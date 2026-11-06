"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { MONTHS, apiPercent, buildView, formatWhole } from "@/lib/live-format";

import type { Goal, goalsSummary } from "./data";

/* Metas com os dados da API (modo real), no mesmo formato dos dados de exemplo. */

const cents = z.number().int();

const GoalsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      targetCents: cents,
      targetDate: z.string(),
      progressSource: z.enum(["manual", "positions"]),
      positionIds: z.array(z.string()),
      progress: z.object({
        currentCents: cents.nullable(),
        pct: apiPercent.nullable(),
        achieved: z.boolean().nullable(),
        monthsLeft: z.number().int(),
        requiredContribution: z.object({ monthlyTodayCents: cents }).loose().nullable(),
      }),
    }),
  ),
});
type Goals = z.infer<typeof GoalsSchema>;

const PositionsSchema = z.object({
  data: z.array(
    z.object({ id: z.string(), name: z.string(), symbol: z.string().nullable() }).loose(),
  ),
});
type Positions = z.infer<typeof PositionsSchema>;

const MonthlySchema = z.object({
  months: z.array(z.object({ month: z.string(), balanceCents: cents.nullable() }).loose()),
});
type Monthly = z.infer<typeof MonthlySchema>;

export type GoalsSummary = typeof goalsSummary;

const monthYear = (isoDay: string) => {
  const [year, month] = isoDay.split("-").map(Number) as [number, number];
  return `${MONTHS[month - 1]!.slice(0, 3)}/${year}`;
};

/** Converte as respostas da API nas metas e no resumo (função pura, testada). */
export function toMetasView(
  { goals, positions, monthly }: { goals: Goals; positions: Positions; monthly: Monthly },
  now: Date,
): { goals: Goal[]; summary: GoalsSummary } {
  const nameOf = new Map(positions.data.map((p) => [p.id, p.symbol ?? p.name]));
  const items: Goal[] = goals.data.map((goal) => {
    const { progress } = goal;
    const achieved = progress.achieved === true;
    const late = !achieved && progress.monthsLeft <= 0;
    const linked = goal.positionIds.map((id) => nameOf.get(id)).filter(Boolean);
    const monthlyCents = progress.requiredContribution?.monthlyTodayCents ?? null;
    return {
      id: goal.id,
      nome: goal.name,
      onde:
        goal.progressSource === "positions"
          ? linked.length > 0
            ? linked.join(" · ")
            : "Posições da carteira"
          : "Valor informado por você",
      icone: achieved ? "check" : /reserva/i.test(goal.name) ? "shield-check" : "target",
      iconeTom: achieved ? "neutro" : "arara",
      status: achieved
        ? { texto: "Concluída", tom: "folha" }
        : late
          ? { texto: "Prazo vencido", tom: "tucano" }
          : { texto: "Em andamento", tom: "arara" },
      guardado: formatWhole(progress.currentCents),
      alvo: formatWhole(goal.targetCents),
      percentual: Math.min(100, Math.round(progress.pct ?? 0)),
      mensal: achieved
        ? "meta atingida"
        : monthlyCents === null
          ? "—"
          : `${formatWhole(monthlyCents)}/mês`,
      previsao: `até ${monthYear(goal.targetDate)}`,
    };
  });

  const open = goals.data.filter((g) => g.progress.achieved !== true);
  const planned = open.reduce(
    (s, g) => s + (g.progress.requiredContribution?.monthlyTodayCents ?? 0),
    0,
  );
  const saved = goals.data.reduce((s, g) => s + (g.progress.currentCents ?? 0), 0);
  const current = monthly.months.at(-1);
  const monthName = current
    ? MONTHS[Number(current.month.slice(5)) - 1]!
    : MONTHS[Number(formatDate(now, "M")) - 1]!;
  const nearest = [...open].sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0];
  const done = goals.data.length - open.length;
  const nearestMonthly = nearest?.progress.requiredContribution?.monthlyTodayCents ?? null;
  return {
    goals: items,
    summary: {
      guardado: formatWhole(saved),
      mensal: open.length === 0 ? "—" : `${formatWhole(planned)}/mês`,
      mensalNota:
        open.length === 1 ? "para 1 meta em andamento" : `para ${open.length} metas em andamento`,
      sobrou: formatWhole(current?.balanceCents ?? null),
      sobrouQuando: `em ${monthName}`,
      // Não há agenda de depósitos na API: sem data, o "Próximo depósito" fica "—".
      proximo: "—",
      dica: nearest
        ? `${done > 0 ? `${done === 1 ? "Uma meta já foi atingida" : `${done} metas já foram atingidas`}. ` : ""}A mais próxima é ${nearest.name}, até ${monthYear(nearest.targetDate)}${nearestMonthly === null ? "." : `: pede cerca de ${formatWhole(nearestMonthly)} por mês.`}`
        : "Todas as metas foram atingidas. Que tal criar a próxima?",
    },
  };
}

/** Busca as metas. `data` fica `undefined` enquanto carrega. */
export function useMetasView({ enabled }: { enabled: boolean }) {
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>) => ({
    queryKey: ["metas", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime: 60_000,
  });
  const results = useQueries({
    queries: [
      get("/v1/goals", GoalsSchema),
      get("/v1/investments/positions", PositionsSchema),
      get("/v1/insights/spending/monthly?months=1", MonthlySchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [goals, positions, monthly] = results.map((r) => r.data) as [Goals, Positions, Monthly];
  return buildView("metas", () => toMetasView({ goals, positions, monthly }, new Date()));
}
