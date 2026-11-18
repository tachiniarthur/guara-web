"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import type { IconName } from "@/components/ui/icon";
import { ApiError, apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi, markApiStale, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, apiPercent, buildView, formatWhole } from "@/lib/live-format";

/*
 * Metas com os dados da API (`/v1/goals`, recurso do plano). O progresso vem do valor que a
 * pessoa informa ou da soma das posições vinculadas; o aporte mensal é a estimativa da API pelas
 * premissas padrão (não há agenda de depósitos nem lembretes).
 */

const cents = z.number().int();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isGoalId = (id: string) => UUID.test(id);

export type GoalTone = "folha" | "arara" | "tucano";

export type Goal = {
  id: string;
  href: string;
  nome: string;
  onde: string;
  icone: IconName;
  status: { texto: string; tom: GoalTone };
  guardado: string;
  alvo: string;
  percentual: number;
  mensal: string;
  previsao: string;
};

export type GoalsSummary = {
  guardado: string;
  mensal: string;
  mensalNota: string;
  sobrou: string;
  sobrouQuando: string;
  dica: string;
};

const ProgressSchema = z.object({
  currentCents: cents.nullable(),
  pct: apiPercent.nullable(),
  remainingCents: cents.nullable().optional(),
  achieved: z.boolean().nullable(),
  monthsLeft: z.number().int(),
  unvaluedPositions: z.number().int().optional(),
  requiredContribution: z
    .object({ monthlyTodayCents: cents, firstNominalCents: cents.optional() })
    .loose()
    .nullable(),
});

export const ApiGoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetCents: cents,
  targetDate: z.string(),
  targetTodayCents: cents.nullable().optional(),
  progressSource: z.enum(["manual", "positions"]),
  currentAmountCents: cents.nullable().optional(),
  currentAmountDate: z.string().nullable().optional(),
  positionIds: z.array(z.string()),
  progress: ProgressSchema,
  assumptions: z
    .object({
      annualReturnPct: z.string(),
      annualInflationPct: z.string(),
      annualReturnReason: z.string(),
    })
    .loose()
    .nullable()
    .optional(),
  disclaimer: z.string().optional(),
  createdAt: z.string().optional(),
});
export type ApiGoal = z.infer<typeof ApiGoalSchema>;

const GoalsSchema = z.object({ data: z.array(ApiGoalSchema) });
type Goals = z.infer<typeof GoalsSchema>;

export const GoalPositionsSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        symbol: z.string().nullable(),
        valueCents: cents.nullable().optional(),
      })
      .loose(),
  ),
});
type Positions = z.infer<typeof GoalPositionsSchema>;

const MonthlySchema = z.object({
  months: z.array(z.object({ month: z.string(), balanceCents: cents.nullable() }).loose()),
});
type Monthly = z.infer<typeof MonthlySchema>;

export const monthYear = (isoDay: string) => {
  const [year, month] = isoDay.split("-").map(Number) as [number, number];
  return `${MONTHS[month - 1]!.slice(0, 3)}/${year}`;
};

const goalHref = (id: string) => `/metas/${id}`;

function statusOf(goal: ApiGoal): Goal["status"] {
  if (goal.progress.achieved === true) return { texto: "Concluída", tom: "folha" };
  if (goal.progress.monthsLeft <= 0) return { texto: "Prazo vencido", tom: "tucano" };
  return { texto: "Em andamento", tom: "arara" };
}

function whereOf(goal: ApiGoal, nameOf: Map<string, string>) {
  if (goal.progressSource === "manual") return "Valor informado por você";
  const linked = goal.positionIds.map((id) => nameOf.get(id)).filter(Boolean);
  return linked.length > 0 ? linked.join(" · ") : "Posições da carteira";
}

function toGoal(goal: ApiGoal, nameOf: Map<string, string>): Goal {
  const { progress } = goal;
  const achieved = progress.achieved === true;
  const monthlyCents = progress.requiredContribution?.monthlyTodayCents ?? null;
  return {
    id: goal.id,
    href: goalHref(goal.id),
    nome: goal.name,
    onde: whereOf(goal, nameOf),
    icone: achieved ? "check" : goal.progressSource === "positions" ? "trending-up" : "target",
    status: statusOf(goal),
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
}

/** Converte as respostas da API nas metas e no resumo (função pura, testada). */
export function toMetasView(
  { goals, positions, monthly }: { goals: Goals; positions: Positions; monthly: Monthly },
  now: Date,
): { goals: Goal[]; summary: GoalsSummary } {
  const nameOf = new Map(positions.data.map((p) => [p.id, p.symbol ?? p.name]));
  const items = goals.data.map((goal) => toGoal(goal, nameOf));

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
      dica: nearest
        ? `${done > 0 ? `${done === 1 ? "Uma meta já foi atingida" : `${done} metas já foram atingidas`}. ` : ""}A mais próxima é ${nearest.name}, até ${monthYear(nearest.targetDate)}${nearestMonthly === null ? "." : `: pede cerca de ${formatWhole(nearestMonthly)} por mês.`}`
        : "Todas as metas foram atingidas. Que tal criar a próxima?",
    },
  };
}

/** Endereços que a tela Metas lê (os mesmos que o pré-carregamento busca). */
export const METAS_PATHS = {
  goals: "/v1/goals",
  positions: "/v1/investments/positions",
  // Os 12 meses que o Início também pede (uma chamada só); aqui vale o último.
  monthly: "/v1/insights/spending/monthly?months=12",
} as const satisfies Record<string, ApiPath>;

/** 4xx (não existe, fora do plano) não melhora tentando de novo. */
const retry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status !== null && error.status < 500) && count < 2;

/** Metas são recurso do plano: 403 com `PLAN_LIMIT_REACHED`. */
export const isPlanLimit = (error: unknown) =>
  error instanceof ApiError &&
  (error.code === "plan_limit_reached" || error.code === "subscription_required");

/** O limite de metas do plano que a API mandou no erro (`details.limit`), se veio. */
export function goalLimitOf(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.code !== "plan_limit_reached") return null;
  const limit = (error.details as { limit?: unknown } | undefined)?.limit;
  return typeof limit === "number" ? limit : null;
}

/** "Seu plano permite até 2 metas…" quando a criação esbarra no limite do plano. */
export function planLimitText(error: unknown): string {
  const limit = goalLimitOf(error);
  return limit === null
    ? "Metas fazem parte de outro plano. Veja os planos em Meu perfil."
    : `Seu plano permite até ${limit} ${limit === 1 ? "meta" : "metas"}. Exclua uma meta ou veja os planos em Meu perfil.`;
}

/** Busca as metas. `data` fica `undefined` enquanto carrega. */
export function useMetasView({ enabled }: { enabled: boolean }) {
  const paths = METAS_PATHS;
  const results = useQueries({
    queries: [
      { ...apiQuery(paths.goals, GoalsSchema, { enabled }), retry },
      apiQuery(paths.positions, GoalPositionsSchema, { enabled }),
      apiQuery(paths.monthly, MonthlySchema, { enabled }),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [goals, positions, monthly] = results.map((r) => r.data) as [Goals, Positions, Monthly];
  return buildView("metas", () => toMetasView({ goals, positions, monthly }, new Date()));
}

// --- Uma meta ---------------------------------------------------------------------------------

export interface GoalDetail extends Goal {
  faltam: string;
  /** Data da meta por extenso ("30/06/2027") e quantos meses faltam. */
  prazo: string;
  meses: string;
  alvoHoje: string | null;
  fonte: "manual" | "positions";
  posicoes: { id: string; nome: string; valor: string }[];
  semValor: number;
  premissas: { label: string; value: string }[];
  motivoPremissa: string | null;
  aviso: string | null;
  criada: string | null;
  form: {
    name: string;
    targetCents: number;
    targetDate: string;
    progressSource: "manual" | "positions";
    currentAmountCents: number | null;
    positionIds: string[];
  };
}

/** Enquanto a API responde: a forma da meta com "—" (os cards guardam o lugar). */
export const EMPTY_GOAL: GoalDetail = {
  id: "",
  href: "",
  nome: "—",
  onde: "—",
  icone: "target",
  status: { texto: "—", tom: "folha" },
  guardado: "—",
  alvo: "—",
  percentual: 0,
  mensal: "—",
  previsao: "—",
  faltam: "—",
  prazo: "—",
  meses: "—",
  alvoHoje: null,
  fonte: "manual",
  posicoes: [],
  semValor: 0,
  premissas: [
    { label: "Rendimento estimado", value: "—" },
    { label: "Inflação estimada", value: "—" },
  ],
  motivoPremissa: null,
  aviso: null,
  criada: null,
  form: {
    name: "",
    targetCents: 0,
    targetDate: "",
    progressSource: "manual",
    currentAmountCents: null,
    positionIds: [],
  },
};

const pctText = (decimal: string) =>
  `${Number(decimal).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% ao ano`;

export function toGoalDetail(goal: ApiGoal, positions: Positions): GoalDetail {
  const nameOf = new Map(positions.data.map((p) => [p.id, p.symbol ?? p.name]));
  const valueOf = new Map(positions.data.map((p) => [p.id, p.valueCents ?? null]));
  const { progress } = goal;
  const months = progress.monthsLeft;
  return {
    ...toGoal(goal, nameOf),
    faltam: formatCurrency(progress.remainingCents ?? null),
    prazo: formatDate(`${goal.targetDate}T12:00:00-03:00`),
    meses: months <= 0 ? "prazo vencido" : months === 1 ? "falta 1 mês" : `faltam ${months} meses`,
    alvoHoje:
      goal.targetTodayCents === null || goal.targetTodayCents === undefined
        ? null
        : formatCurrency(goal.targetTodayCents),
    fonte: goal.progressSource,
    posicoes: goal.positionIds.map((id) => ({
      id,
      nome: nameOf.get(id) ?? "Posição",
      valor: formatCurrency(valueOf.get(id) ?? null),
    })),
    semValor: progress.unvaluedPositions ?? 0,
    premissas: goal.assumptions
      ? [
          { label: "Rendimento estimado", value: pctText(goal.assumptions.annualReturnPct) },
          { label: "Inflação estimada", value: pctText(goal.assumptions.annualInflationPct) },
        ]
      : [],
    motivoPremissa: goal.assumptions?.annualReturnReason ?? null,
    aviso: goal.disclaimer ?? null,
    criada: goal.createdAt ? `Criada em ${formatDate(goal.createdAt)}` : null,
    form: {
      name: goal.name,
      targetCents: goal.targetCents,
      targetDate: goal.targetDate,
      progressSource: goal.progressSource,
      currentAmountCents: goal.currentAmountCents ?? null,
      positionIds: goal.positionIds,
    },
  };
}

const goalPath = (id: string): ApiPath => `/v1/goals/${encodeURIComponent(id)}`;

export function useGoal(id: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    ...apiQuery(goalPath(id), ApiGoalSchema, { enabled: enabled && isGoalId(id) }),
    retry,
  });
}

export function useGoalPositions({ enabled }: { enabled: boolean }) {
  return useQuery(apiQuery(METAS_PATHS.positions, GoalPositionsSchema, { enabled }));
}

export type GoalInput = {
  name: string;
  targetCents: number;
  targetDate: string;
  progressSource: "manual" | "positions";
  currentAmountCents?: number | null;
  positionIds?: string[];
};

const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  invalidateApi(client, "/v1/goals");

export function useCreateGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalInput) =>
      apiRequest("/v1/goals", ApiGoalSchema, { method: "POST", body }),
    onSuccess: () => invalidate(client),
  });
}

export function useUpdateGoal(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<GoalInput>) =>
      apiRequest(goalPath(id), ApiGoalSchema, { method: "PATCH", body }),
    onSuccess: () => invalidate(client),
  });
}

export function useRemoveGoal(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest(goalPath(id), z.undefined(), { method: "DELETE" }),
    // Sem buscar agora: a página do item excluído ainda está aberta e pediria um 404.
    onSuccess: () => markApiStale(client, "/v1/goals"),
  });
}
