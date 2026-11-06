"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import type { IconName } from "@/components/ui/icon";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, capitalize, formatWhole, percent } from "@/lib/live-format";

import { BudgetSummarySchema, buildTetos, type BudgetSummary } from "./live";
import type { TetoDetail, TetoStatus } from "./tetos";

/* Tetos de gasto com os dados da API (modo real), no mesmo formato dos dados de exemplo. */

const cents = z.number().int();

const SummarySchema = z.object({
  month: z.string(),
  categories: z.array(z.object({ categoryId: z.string().nullable(), spentCents: cents }).loose()),
});
type Summary = z.infer<typeof SummarySchema>;

const ICONS: Record<string, IconName> = { transport: "car-front", leisure: "star" };

const monthName = (month: string) => MONTHS[Number(month.slice(5)) - 1]!;

function statusOf(usedPct: number | null): TetoStatus {
  if (usedPct === null || usedPct < 70) return "no-ritmo";
  return usedPct < 100 ? "perto" : "estourou";
}

export interface TetosView {
  mes: string;
  /** Dia em que os tetos recomeçam ("1º de dezembro"). */
  recomeco: string;
  summary: { ativos: number; gasto: string; total: string; percentual: number; nota: string };
  items: (TetoDetail & { categoryId: string })[];
  previousMonths: { mes: string; nota: string; status: TetoStatus }[];
}

/** Converte as respostas da API nos tetos do mês (função pura, testada). */
export function toTetosView(
  { budgets, months }: { budgets: BudgetSummary; months: Summary[] },
  now: Date,
): TetosView {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const next = MONTHS[month % 12]!;
  const progress = buildTetos(budgets);
  const categoryItems = budgets.items.filter((item) => item.budget.categoryId !== null);
  const spentIn = (summary: Summary | undefined, categoryId: string) =>
    summary?.categories.find((c) => c.categoryId === categoryId)?.spentCents ?? 0;
  // `months`: do mês atual (0) para trás.
  const ordered = [...months].reverse();
  const items = categoryItems.map((item, i) => {
    const categoryId = item.budget.categoryId!;
    const limit = item.budget.limitCents;
    const spent = item.spentCents ?? 0;
    const left = limit - spent;
    const pct = item.usedPct ?? 0;
    const pctText = `${percent.format(Math.round(pct))}%`;
    const projected = item.projectedCents;
    const pace =
      projected === null
        ? ""
        : projected > limit
          ? " · no ritmo atual, passa do teto"
          : ` · no ritmo atual, fecha perto de ${formatWhole(projected)}`;
    const notice80 = formatWhole(limit * 0.8);
    return {
      ...progress[i]!,
      categoryId,
      icone: ICONS[categoryId] ?? "tag",
      gastoCompleto: formatCurrency(spent),
      tetoCompleto: formatCurrency(limit),
      status: statusOf(item.usedPct),
      resumo:
        left >= 0
          ? `${pctText} · Faltam ${formatCurrency(left)}${pace}`
          : `${pctText} · ${formatCurrency(-left)} acima do teto`,
      destaque: {
        percentual: pctText,
        faltam: formatCurrency(Math.max(left, 0)),
        ritmo: projected !== null && projected <= limit ? formatWhole(projected) : undefined,
      },
      historico: ordered.map((summary, index) => ({
        mes: `${monthName(summary.month).slice(0, 3)}${index === ordered.length - 1 ? "*" : ""}`,
        valor: Math.round(spentIn(summary, categoryId) / 100),
      })),
      avisos: [
        {
          titulo: `${notice80} · 1º de 2 avisos`,
          quando: item.noticesSent.includes(80) ? "Enviado este mês" : "Ainda não chegou",
          enviado: item.noticesSent.includes(80),
        },
        {
          titulo: `${formatWhole(limit)} · teto`,
          quando: item.noticesSent.includes(100) ? "Enviado este mês" : "Ainda não chegou",
          enviado: item.noticesSent.includes(100),
        },
      ],
    } satisfies TetoDetail & { categoryId: string };
  });
  const spentTotal = categoryItems.reduce((sum, item) => sum + (item.spentCents ?? 0), 0);
  const limitTotal = categoryItems.reduce((sum, item) => sum + item.budget.limitCents, 0);
  const totalPct = limitTotal > 0 ? (spentTotal / limitTotal) * 100 : 0;
  const previousMonths = months.slice(1, 3).map((summary) => {
    const over = categoryItems.filter(
      (item) => spentIn(summary, item.budget.categoryId!) > item.budget.limitCents,
    );
    return {
      mes: capitalize(monthName(summary.month)),
      nota:
        over.length === 0
          ? "Nenhum teto estourado"
          : over
              .map(
                (item) =>
                  `${item.categoryName ?? "—"}: ${formatWhole(spentIn(summary, item.budget.categoryId!))} de ${formatWhole(item.budget.limitCents)}`,
              )
              .join(" · "),
      status: (over.length === 0 ? "no-ritmo" : "estourou") as TetoStatus,
    };
  });
  return {
    mes: `${capitalize(MONTHS[month - 1]!)} ${year}`,
    recomeco: `1º de ${next}`,
    summary: {
      ativos: items.length,
      gasto: formatCurrency(spentTotal),
      total: formatCurrency(limitTotal),
      percentual: Math.round(totalPct * 10) / 10,
      nota: `${Math.round(totalPct)}% do total dos tetos · recomeçam no dia 1º de ${next}`,
    },
    items,
    previousMonths,
  };
}

const monthOf = (now: Date, back: number) => {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const date = new Date(Date.UTC(year, month - 1 - back, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Tetos do mês com o histórico de 6 meses. `data` fica `undefined` enquanto carrega. */
export function useTetosView({ enabled }: { enabled: boolean }) {
  const now = new Date();
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>) => ({
    queryKey: ["gastos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime: 60_000,
  });
  const results = useQueries({
    queries: [
      get("/v1/budgets/summary", BudgetSummarySchema),
      ...[0, 1, 2, 3, 4, 5].map((back) =>
        get(`/v1/insights/spending?month=${monthOf(now, back)}`, SummarySchema),
      ),
    ],
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [budgets, ...months] = results.map((r) => r.data) as [BudgetSummary, ...Summary[]];
  return { data: toTetosView({ budgets, months }, now), error: null };
}
