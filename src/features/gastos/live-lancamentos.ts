"use client";

import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, capitalize, formatWhole, apiPercent, buildView } from "@/lib/live-format";

import type { CategorySpending } from "./data";
import type { LancamentosData } from "./lancamentos-context";
import {
  AccountsSchema,
  ApiTransactionSchema,
  CategoriesSchema,
  toTransactionDays,
  type Accounts,
  type ApiTransaction,
  type Categories,
} from "./live-ledger";

const cents = z.number().int();

const PageSchema = z.object({
  data: z.array(ApiTransactionSchema),
  nextCursor: z.string().nullable(),
});

const SummarySchema = z.object({
  spentCents: cents.nullable(),
  incomeCents: cents.nullable(),
  balanceCents: cents.nullable(),
  categories: z.array(
    z.object({
      categoryId: z.string().nullable(),
      name: z.string(),
      spentCents: cents,
      count: z.number().int(),
      sharePct: apiPercent.nullable(),
    }),
  ),
});
type Summary = z.infer<typeof SummarySchema>;

const AnomaliesSchema = z.object({
  data: z.array(
    z
      .object({
        transaction: z
          .object({ id: z.string(), occurredAt: z.string().nullable(), amountCents: cents })
          .loose(),
      })
      .loose(),
  ),
});
type Anomalies = z.infer<typeof AnomaliesSchema>;

export interface LancamentosResponses {
  transactions: ApiTransaction[];
  hasMore: boolean;
  summary: Summary;
  accounts: Accounts;
  categories: Categories;
  anomalies: Anomalies;
}

/** Converte as respostas da API na lista de lançamentos do mês (função pura, testada). */
export function toLancamentos(
  { transactions, hasMore, summary, accounts, categories, anomalies }: LancamentosResponses,
  now: Date,
  loadMore: () => void,
  loadingMore: boolean,
): LancamentosData {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const monthName = MONTHS[month - 1]!;
  const banks = [...new Set(accounts.data.map((account) => account.institutionName))];
  const count = summary.categories.reduce((sum, item) => sum + item.count, 0);
  const sorted = [...summary.categories]
    .filter((item) => item.categoryId !== null)
    .sort((a, b) => b.spentCents - a.spentCents);
  const top = sorted.slice(0, 5);
  const rest = summary.categories
    .filter((item) => !top.includes(item))
    .reduce((sum, item) => sum + item.spentCents, 0);
  const categorias: CategorySpending[] = top.map((item) => ({
    id: item.categoryId!,
    nome: item.name,
    lancamentos: item.count,
    percentual: Math.round(item.sharePct ?? 0),
    valor: item.spentCents / 100,
    valorFormatado: formatCurrency(item.spentCents),
    cor: "",
  }));
  const unusual = anomalies.data[0]?.transaction;
  return {
    days: toTransactionDays(transactions, { accounts, categories, anomalies }, now),
    banks: ["Todos os bancos", ...banks],
    bankMarks: false,
    totals: {
      entrou: formatCurrency(summary.incomeCents),
      saiu: formatCurrency(summary.spentCents),
      sobrou: formatCurrency(summary.balanceCents),
    },
    resumo: `${count} ${count === 1 ? "gasto" : "gastos"} em ${monthName} · ${banks.join(" e ") || "—"}`,
    mes: `${capitalize(monthName)} ${year}`,
    categorias,
    outros: formatWhole(rest),
    foraDoPadrao: unusual
      ? `A compra de ${formatCurrency(unusual.amountCents)}` +
        (unusual.occurredAt ? ` às ${formatDate(unusual.occurredAt, "HH:mm")}` : "") +
        " está fora do seu padrão. Clique nela para confirmar se foi você."
      : null,
    loadMore: hasMore ? { onClick: loadMore, pending: loadingMore } : null,
  };
}

/** Lançamentos do mês atual (100 por vez) e o resumo. `data` fica `undefined` enquanto carrega. */
export function useLancamentos({ enabled }: { enabled: boolean }) {
  const now = new Date();
  const month = formatDate(now, "yyyy-MM");
  const from = `${month}-01`;
  const to = formatDate(now, "yyyy-MM-dd");
  const pages = useInfiniteQuery({
    queryKey: ["gastos", "lancamentos", from, to],
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        `/v1/transactions?from=${from}&to=${to}&limit=100${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`,
        PageSchema,
        { signal },
      ),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
    staleTime: 60_000,
  });
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>, staleTime = 60_000) => ({
    queryKey: ["gastos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime,
  });
  const results = useQueries({
    queries: [
      get(`/v1/insights/spending?month=${month}`, SummarySchema),
      get("/v1/accounts", AccountsSchema),
      get("/v1/categories", CategoriesSchema, 30 * 60_000),
      get("/v1/anomalies?status=pending", AnomaliesSchema),
    ] as const,
  });
  const error = pages.error ?? results.find((result) => result.error)?.error ?? null;
  if (error || pages.isPending || results.some((result) => result.isPending)) {
    return { data: undefined, error };
  }
  const [summary, accounts, categories, anomalies] = results.map((result) => result.data) as [
    Summary,
    Accounts,
    Categories,
    Anomalies,
  ];
  return {
    ...buildView("lançamentos", () =>
      toLancamentos(
        {
          transactions: pages.data!.pages.flatMap((page) => page.data),
          hasMore: pages.hasNextPage,
          summary,
          accounts,
          categories,
          anomalies,
        },
        now,
        () => void pages.fetchNextPage(),
        pages.isFetchingNextPage,
      ),
    ),
  };
}
