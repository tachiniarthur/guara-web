"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, formatWhole, percent } from "@/lib/live-format";

import { formatDayTotal, type CategoryLedger, type TransactionDay } from "./lancamentos";

/*
 * Lançamentos com os dados da API (modo real): agrupados por dia, como a lista do design, e a
 * página de uma categoria (total, comparação com a média, teto, "onde foi" e a lista).
 */

const cents = z.number().int();

export const ApiTransactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  occurredOn: z.string(),
  occurredAt: z.string().nullable(),
  amountCents: cents,
  direction: z.enum(["debit", "credit"]),
  kind: z.string(),
  description: z.string(),
  merchantName: z.string().nullable(),
  categoryId: z.string().nullable(),
});
export type ApiTransaction = z.infer<typeof ApiTransactionSchema>;

export const AccountsSchema = z.object({
  data: z.array(
    z.object({ id: z.string(), type: z.string(), institutionName: z.string() }).loose(),
  ),
});
export type Accounts = z.infer<typeof AccountsSchema>;

export const CategoriesSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        subcategories: z.array(z.object({ id: z.string(), name: z.string() })),
      })
      .loose(),
  ),
});
export type Categories = z.infer<typeof CategoriesSchema>;

export const AnomaliesSchema = z.object({
  data: z.array(z.object({ transaction: z.object({ id: z.string() }).loose() }).loose()),
});
export type Anomalies = z.infer<typeof AnomaliesSchema>;

const CategoryResponseSchema = z.object({
  categoryId: z.string().nullable(),
  name: z.string(),
  month: z.string(),
  spentCents: cents.nullable(),
  transactions: z.object({
    data: z.array(ApiTransactionSchema),
    nextCursor: z.string().nullable(),
  }),
});
type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

const SummarySchema = z.object({
  categories: z.array(
    z.object({
      categoryId: z.string().nullable(),
      count: z.number().int(),
      sharePct: z.number().nullable(),
      averageCents: cents.nullable(),
      changePct: z.number().nullable(),
      subcategories: z.array(
        z.object({ categoryId: z.string(), name: z.string(), spentCents: cents }),
      ),
    }),
  ),
});
type Summary = z.infer<typeof SummarySchema>;

const BudgetSummarySchema = z.object({
  items: z.array(
    z.object({
      budget: z.object({ id: z.string(), categoryId: z.string().nullable(), limitCents: cents }),
      usedPct: z.number().nullable(),
      projectedCents: cents.nullable(),
      status: z.enum(["ok", "attention", "exceeded"]).nullable(),
      noticesSent: z.array(z.number().int()),
    }),
  ),
});
type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

/** Nome de cada categoria e subcategoria pelo id. */
export function categoryNames(categories: Categories) {
  const names = new Map<string, string>();
  for (const category of categories.data) {
    names.set(category.id, category.name);
    for (const child of category.subcategories) names.set(child.id, child.name);
  }
  return names;
}

/** "Banco Dev crédito", "Banco Dev poupança", "Banco Dev". */
export function accountLabel(account: Accounts["data"][number] | undefined) {
  if (!account) return "—";
  if (account.type === "credit_card") return `${account.institutionName} crédito`;
  if (account.type === "savings") return `${account.institutionName} poupança`;
  return account.institutionName;
}

const WEEKDAY = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** "Hoje · 5 de novembro", "Ontem · 4 de novembro", "Segunda · 2 de novembro". */
function dayTitle(isoDay: string, now: Date) {
  const today = formatDate(now, "yyyy-MM-dd");
  const yesterday = formatDate(new Date(now.getTime() - 86_400_000), "yyyy-MM-dd");
  const [, month, day] = isoDay.split("-").map(Number) as [number, number, number];
  const label = `${day} de ${MONTHS[month - 1]}`;
  if (isoDay === today) return `Hoje · ${label}`;
  if (isoDay === yesterday) return `Ontem · ${label}`;
  return `${WEEKDAY[new Date(`${isoDay}T12:00:00Z`).getUTCDay()]} · ${label}`;
}

/** Lançamentos em grupos por dia (do mais recente), com o total de cada dia. */
export function toTransactionDays(
  transactions: ApiTransaction[],
  {
    accounts,
    categories,
    anomalies,
  }: { accounts: Accounts; categories: Categories; anomalies: Anomalies },
  now: Date,
): TransactionDay[] {
  const names = categoryNames(categories);
  const byId = new Map(accounts.data.map((account) => [account.id, account]));
  const unusual = new Set(anomalies.data.map((item) => item.transaction.id));
  const days = new Map<string, TransactionDay & { sum: number }>();
  for (const item of transactions) {
    const out = item.direction === "debit";
    let group = days.get(item.occurredOn);
    if (!group) {
      group = {
        id: item.occurredOn,
        titulo: dayTitle(item.occurredOn, now),
        total: "",
        itens: [],
        sum: 0,
      };
      days.set(item.occurredOn, group);
    }
    group.sum += (out ? -1 : 1) * item.amountCents;
    group.itens.push({
      id: item.id,
      descricao: item.merchantName ?? item.description,
      hora: item.occurredAt ? formatDate(item.occurredAt, "HH:mm") : undefined,
      conta: accountLabel(byId.get(item.accountId)),
      categoria: (item.categoryId && names.get(item.categoryId)) || "Sem categoria",
      valor: `${out ? "−" : "+"}${formatCurrency(item.amountCents)}`,
      tipo: out ? "saida" : "entrada",
      foraDoPadrao: unusual.has(item.id) || undefined,
    });
  }
  return [...days.values()].map(({ sum, ...day }) => ({
    ...day,
    total: formatDayTotal(sum / 100),
  }));
}

const STATE_LABEL = { ok: "tranquilo", attention: "atenção", exceeded: "passou do teto" } as const;

export interface CategoryResponses {
  category: CategoryResponse;
  summary: Summary;
  budgets: BudgetSummary;
  accounts: Accounts;
  categories: Categories;
  anomalies: Anomalies;
}

/** Página de uma categoria no mês (função pura, testada). */
export function toCategoryLedger(
  { category, summary, budgets, accounts, categories, anomalies }: CategoryResponses,
  now: Date,
): CategoryLedger {
  const id = category.categoryId ?? "uncategorized";
  const row = summary.categories.find((item) => item.categoryId === category.categoryId);
  const items = category.transactions.data;
  const budget = budgets.items.find((item) => item.budget.categoryId === category.categoryId);
  const spent = category.spentCents ?? 0;
  const monthName = MONTHS[Number(category.month.slice(5)) - 1]!;
  const countBy = new Map<string, number>();
  for (const item of items) {
    if (item.categoryId) countBy.set(item.categoryId, (countBy.get(item.categoryId) ?? 0) + 1);
  }
  const change = row?.changePct ?? null;
  return {
    id,
    nome: category.name,
    mes: monthName,
    lancamentos: row?.count ?? items.length,
    total: formatCurrency(category.spentCents),
    comparacao: {
      parte:
        row?.sharePct == null ? "—" : `${percent.format(Math.round(row.sharePct))}% das saídas`,
      variacao:
        change === null
          ? ""
          : `${change > 0 ? "+" : change < 0 ? "−" : ""}${percent.format(Math.abs(Math.round(change)))}%`,
      antes:
        row?.averageCents == null
          ? "sem histórico dos 3 meses anteriores"
          : `que a média dos 3 meses anteriores (${formatWhole(row.averageCents)})`,
    },
    teto: budget
      ? {
          valor: formatWhole(budget.budget.limitCents),
          estado: `${Math.round(budget.usedPct ?? 0)}% · ${budget.status ? STATE_LABEL[budget.status] : "—"}`,
          percentual: Math.min(budget.usedPct ?? 0, 100),
          marcos: budget.noticesSent.filter((pct) => pct < 100),
          nota:
            (budget.noticesSent.length
              ? `Aviso de ${budget.noticesSent.map((pct) => formatWhole((budget.budget.limitCents * pct) / 100)).join(" e ")} já enviado`
              : "Nenhum aviso enviado ainda") +
            (budget.projectedCents === null
              ? ""
              : ` · no ritmo atual, fecha perto de ${formatWhole(budget.projectedCents)}`),
        }
      : undefined,
    onde: (row?.subcategories ?? [])
      .filter((sub) => sub.spentCents > 0)
      .sort((a, b) => b.spentCents - a.spentCents)
      .map((sub) => ({
        nome: sub.name,
        lancamentos: countBy.get(sub.categoryId) ?? 0,
        valor: formatCurrency(sub.spentCents),
        percentual: spent > 0 ? `${Math.round((sub.spentCents / spent) * 100)}%` : "—",
      })),
    dias: toTransactionDays(items, { accounts, categories, anomalies }, now),
  };
}

/** Busca a página de uma categoria no mês atual. `data` fica `undefined` enquanto carrega. */
export function useCategoryLedger(categoryId: string, { enabled }: { enabled: boolean }) {
  const now = new Date();
  const month = formatDate(now, "yyyy-MM");
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>, staleTime = 60_000) => ({
    queryKey: ["gastos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime,
  });
  const results = useQueries({
    queries: [
      get(
        `/v1/insights/spending/categories/${encodeURIComponent(categoryId)}?month=${month}&limit=100`,
        CategoryResponseSchema,
      ),
      get(`/v1/insights/spending?month=${month}`, SummarySchema),
      get("/v1/budgets/summary", BudgetSummarySchema),
      get("/v1/accounts", AccountsSchema),
      get("/v1/categories", CategoriesSchema, 30 * 60_000),
      get("/v1/anomalies?status=pending", AnomaliesSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [category, summary, budgets, accounts, categories, anomalies] = results.map(
    (result) => result.data,
  ) as [CategoryResponse, Summary, BudgetSummary, Accounts, Categories, Anomalies];
  return {
    data: toCategoryLedger({ category, summary, budgets, accounts, categories, anomalies }, now),
    error: null,
  };
}

const DetailSchema = ApiTransactionSchema.extend({ note: z.string().nullable() });
const AnomalyListSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      transaction: z.object({ id: z.string() }).loose(),
    }),
  ),
});
const BudgetsSchema = z.object({
  items: z.array(z.object({ budget: z.object({ categoryId: z.string().nullable() }) }).loose()),
});

const WEEKDAY_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export interface TransactionDetailResponses {
  transaction: z.infer<typeof DetailSchema>;
  accounts: Accounts;
  categories: Categories;
  anomalies: z.infer<typeof AnomalyListSchema>;
  budgets: z.infer<typeof BudgetsSchema>;
}

/** Um lançamento com os detalhes do banco (função pura, testada). */
export function toTransactionDetail(
  { transaction, accounts, categories, anomalies, budgets }: TransactionDetailResponses,
  now: Date,
) {
  const [day] = toTransactionDays(
    [transaction],
    {
      accounts,
      categories,
      anomalies: { data: anomalies.data.filter((a) => a.status === "pending") },
    },
    now,
  );
  const item = { ...day!.itens[0]!, dia: day! };
  const account = accounts.data.find((a) => a.id === transaction.accountId);
  const names = categoryNames(categories);
  const topOf = new Map<string, string>();
  for (const category of categories.data) {
    topOf.set(category.id, category.id);
    for (const child of category.subcategories) topOf.set(child.id, category.id);
  }
  const top = transaction.categoryId ? topOf.get(transaction.categoryId) : undefined;
  const hasBudget = budgets.items.some((b) => b.budget.categoryId === top);
  const weekday = WEEKDAY_LONG[new Date(`${transaction.occurredOn}T12:00:00Z`).getUTCDay()]!;
  const date = formatDate(`${transaction.occurredOn}T12:00:00-03:00`, "dd/MM/yyyy");
  const time = item.hora;
  const kind =
    account?.type === "credit_card"
      ? "cartão de crédito"
      : account?.type === "savings"
        ? "poupança"
        : "conta corrente";
  const categoryName = (top && names.get(top)) || item.categoria;
  return {
    item,
    details: {
      data: [`${weekday}, ${date}`, time].filter(Boolean).join(" · "),
      contaCompleta: account ? `${account.institutionName} · ${kind}` : "—",
      descricaoBanco: transaction.description,
      origem: account ? `Open Finance · ${account.institutionName}` : "Open Finance",
      resumo: [`${weekday}, ${date}`, time, item.conta].filter(Boolean).join(" · "),
      categorias: [
        item.categoria,
        ...categories.data.filter((c) => c.name !== item.categoria).map((c) => c.name),
      ].slice(0, 6),
      semTeto:
        transaction.direction === "debit" && !hasBudget
          ? `Esta compra não entra em nenhum teto. Você não tem teto para ${categoryName}.`
          : undefined,
    },
  };
}

/** Busca um lançamento. `data` fica `undefined` enquanto carrega; `missing` quando não existe. */
export function useTransactionDetail(id: string, { enabled }: { enabled: boolean }) {
  const now = new Date();
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>, staleTime = 60_000) => ({
    queryKey: ["gastos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime,
    retry: false,
  });
  const results = useQueries({
    queries: [
      get(`/v1/transactions/${encodeURIComponent(id)}`, DetailSchema),
      get("/v1/accounts", AccountsSchema),
      get("/v1/categories", CategoriesSchema, 30 * 60_000),
      get("/v1/anomalies", AnomalyListSchema),
      get("/v1/budgets/summary", BudgetsSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  const missing =
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "not_found" || error.code === "validation_failed");
  if (error || results.some((result) => result.isPending))
    return { data: undefined, error, missing };
  const [transaction, accounts, categories, anomalies, budgets] = results.map((r) => r.data) as [
    z.infer<typeof DetailSchema>,
    Accounts,
    Categories,
    z.infer<typeof AnomalyListSchema>,
    z.infer<typeof BudgetsSchema>,
  ];
  return {
    data: toTransactionDetail({ transaction, accounts, categories, anomalies, budgets }, now),
    error: null,
    missing: false,
  };
}
