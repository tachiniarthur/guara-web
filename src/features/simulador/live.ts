"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatDate } from "@/lib/format";
import { apiPercent, buildView, capitalize, MONTHS } from "@/lib/live-format";

import { GOAL_PLACES, RETIREMENT_PROFILES, type SimulatorContext } from "./inputs";
import { reais } from "./lib/format";
import type { SavedSimulation } from "./saved";

/** Premissas do simulador com os números da pessoa (API), no formato de `SimulatorContext`. */

const cents = z.number().int();

const DefaultsSchema = z
  .object({
    portfolio: z.object({ investedCents: cents.nullable() }).loose(),
  })
  .loose();
type Defaults = z.infer<typeof DefaultsSchema>;

const SuggestionsSchema = z.object({
  hasAccounts: z.boolean(),
  categories: z.array(
    z.object({ categoryId: z.string(), name: z.string(), monthlyAverageCents: cents }).loose(),
  ),
  subscriptions: z.array(
    z.object({ subscriptionId: z.string(), name: z.string(), monthlyAmountCents: cents }).loose(),
  ),
});
type Suggestions = z.infer<typeof SuggestionsSchema>;

const MonthlySchema = z.object({
  months: z.array(
    z.object({
      month: z.string(),
      incomeCents: cents.nullable(),
      balanceCents: cents.nullable(),
    }),
  ),
});
type Monthly = z.infer<typeof MonthlySchema>;

const ProfileSchema = z.object({
  profile: z.object({ profile: z.string(), label: z.string() }).loose().nullable(),
});
type Profile = z.infer<typeof ProfileSchema>;

const BelongingsSchema = z.object({
  data: z.array(z.object({ kind: z.string(), valueCents: cents.nullable() }).loose()),
});
type Belongings = z.infer<typeof BelongingsSchema>;

const GoalsSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        targetCents: cents,
        progress: z
          .object({
            currentCents: cents.nullable(),
            pct: apiPercent.nullable(),
            achieved: z.boolean(),
            monthsLeft: z.number().int(),
            requiredContribution: z.object({ monthlyTodayCents: cents }).loose().nullable(),
          })
          .loose(),
      })
      .loose(),
  ),
});
type Goals = z.infer<typeof GoalsSchema>;

/** Endereços que o Simulador lê (os mesmos que o pré-carregamento busca). */
export const SIMULADOR_PATHS = {
  defaults: "/v1/simulations/defaults",
  suggestions: "/v1/simulations/spending-suggestions",
  monthly: "/v1/insights/spending/monthly?months=12",
  profile: "/v1/investor-profile",
  belongings: "/v1/belongings",
  goals: "/v1/goals",
} as const satisfies Record<string, ApiPath>;

const RATE_BY_PROFILE: Record<string, number> = {
  conservative: RETIREMENT_PROFILES[0].rate,
  moderate: RETIREMENT_PROFILES[1].rate,
  aggressive: RETIREMENT_PROFILES[2].rate,
};

/** Monta o contexto do simulador (função pura, testada). */
export function toSimulatorContext(
  {
    defaults,
    suggestions,
    monthly,
    profile,
    belongings,
    goals,
  }: {
    defaults: Defaults;
    suggestions: Suggestions;
    monthly: Monthly;
    profile: Profile;
    belongings: Belongings;
    goals: Goals;
  },
  now: Date,
): SimulatorContext {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  // Os depósitos começam no mês que vem (month 0–11).
  const start = { year: month === 12 ? year + 1 : year, month: month % 12 };
  const startName = MONTHS[start.month]!;
  // Meses fechados (o atual ainda está correndo): o último dá as entradas; os 3 últimos, a sobra.
  const closed = monthly.months.slice(0, -1).filter((row) => row.incomeCents !== null);
  const last = closed.at(-1);
  const recent = closed.slice(-3).filter((row) => row.balanceCents !== null);
  const surplus =
    recent.length > 0
      ? recent.reduce((sum, row) => sum + row.balanceCents!, 0) / recent.length / 100
      : 0;

  const open = goals.data.filter((goal) => !goal.progress.achieved);
  const reserveGoal = open.find((goal) => /reserva/i.test(goal.name));
  const first = open.find((goal) => goal !== reserveGoal) ?? open[0];

  const categories = suggestions.categories.map((c) => ({
    label: c.name,
    name: c.name.toLowerCase(),
    average: c.monthlyAverageCents / 100,
  }));
  const subscriptions = suggestions.subscriptions.map((s) => ({
    label: s.name,
    name: `a assinatura ${s.name}`,
    average: s.monthlyAmountCents / 100,
  }));
  const otherCuts = suggestions.subscriptions.slice(0, 3).map((s) => ({
    title: s.name,
    detail: "assinatura ativa",
    value: reais(s.monthlyAmountCents / 100),
  }));

  return {
    start,
    lastMonthName: last ? MONTHS[Number(last.month.slice(5)) - 1]! : "o último mês",
    startLabel: startName,
    firstDepositLabel: `${capitalize(startName)} de ${start.year}`,
    household: {
      income: (last?.incomeCents ?? 0) / 100,
      surplus: Math.max(0, surplus),
      profile: profile.profile?.label ?? "não definido",
      invested: (defaults.portfolio.investedCents ?? 0) / 100,
      properties:
        belongings.data
          .filter((b) => b.kind === "real_estate")
          .reduce((sum, b) => sum + (b.valueCents ?? 0), 0) / 100,
    },
    reserve: reserveGoal
      ? {
          saved: (reserveGoal.progress.currentCents ?? 0) / 100,
          target: reserveGoal.targetCents / 100,
          monthly: (reserveGoal.progress.requiredContribution?.monthlyTodayCents ?? 0) / 100,
          place: "",
        }
      : null,
    retirementRate: RATE_BY_PROFILE[profile.profile?.profile ?? ""] ?? RETIREMENT_PROFILES[1].rate,
    cutCategories: [...categories, ...subscriptions].slice(0, 8),
    cutDestinations: ["Aposentadoria", ...open.map((goal) => goal.name)],
    goalDefaults: first
      ? {
          name: first.name,
          cost: Math.round(first.targetCents / 100),
          months: Math.max(1, first.progress.monthsLeft),
          saved: (first.progress.currentCents ?? 0) / 100,
          place: GOAL_PLACES[0].label,
        }
      : { name: "Meu objetivo", cost: 10000, months: 12, saved: 0, place: GOAL_PLACES[0].label },
    otherCuts,
    otherCutsTotal:
      otherCuts.length > 0
        ? suggestions.subscriptions
            .slice(0, 3)
            .reduce((sum, s) => sum + s.monthlyAmountCents / 100, 0)
        : null,
    goalRows: open
      .filter((goal) => goal !== first)
      .slice(0, 2)
      .map((goal) => ({
        title: goal.name,
        detail: `${reais((goal.progress.currentCents ?? 0) / 100)} de ${reais(goal.targetCents / 100)}`,
        value: `${Math.round(goal.progress.pct ?? 0)}%`,
      })),
  };
}

/** As premissas da pessoa. `data` fica `undefined` enquanto carrega. */
export function useSimulatorContext({ enabled }: { enabled: boolean }) {
  const paths = SIMULADOR_PATHS;
  const results = useQueries({
    queries: [
      apiQuery(paths.defaults, DefaultsSchema, { enabled }),
      apiQuery(paths.suggestions, SuggestionsSchema, { enabled }),
      apiQuery(paths.monthly, MonthlySchema, { enabled }),
      apiQuery(paths.profile, ProfileSchema, { enabled }),
      apiQuery(paths.belongings, BelongingsSchema, { enabled }),
      apiQuery(paths.goals, GoalsSchema, { enabled }),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [defaults, suggestions, monthly, profile, belongings, goals] = results.map(
    (result) => result.data,
  ) as [Defaults, Suggestions, Monthly, Profile, Belongings, Goals];
  return buildView("simulador", () =>
    toSimulatorContext({ defaults, suggestions, monthly, profile, belongings, goals }, new Date()),
  );
}

// --- Simulações salvas ------------------------------------------------------------------------

const SavedSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        kind: z.enum(["retirement", "goal", "spending_cut"]),
        name: z.string(),
        createdAt: z.string(),
        input: z.record(z.string(), z.unknown()),
        result: z.record(z.string(), z.unknown()),
      })
      .loose(),
  ),
});
type Saved = z.infer<typeof SavedSchema>;

export const SIMULATIONS_PATH = "/v1/simulations" as const;

const KINDS = {
  retirement: { tipo: "Aposentadoria", icone: "loader", href: "/simulador" },
  goal: { tipo: "Objetivo", icone: "target", href: "/simulador/objetivo" },
  spending_cut: { tipo: "Corte de gasto", icone: "trending-up", href: "/simulador/corte" },
} as const;

const num = (value: unknown) => (typeof value === "number" ? value : null);
const path = (value: unknown, ...keys: string[]) =>
  keys.reduce<unknown>(
    (current, key) =>
      current && typeof current === "object" ? (current as Record<string, unknown>)[key] : null,
    value,
  );
const money = (centsValue: number | null) => (centsValue === null ? "—" : reais(centsValue / 100));

/** Uma simulação da API como item de Simulações salvas. */
export function toSavedFromApi(item: Saved["data"][number]): SavedSimulation {
  const kind = KINDS[item.kind];
  const { input, result } = item;
  let valor = "—";
  let resumo = "";
  if (item.kind === "goal") {
    valor = `${money(num(path(result, "required", "monthlyTodayCents")))}/mês`;
    const months = num(input.months);
    resumo = `${money(num(input.targetCents))}${months === null ? "" : ` em ${months} meses`}`;
  } else if (item.kind === "spending_cut") {
    valor = `${money(num(input.monthlyAmountCents))}/mês`;
    const months = num(input.months);
    resumo = `${typeof input.description === "string" ? `${input.description} · ` : ""}${months === null ? "" : `por ${months} meses`}`;
  } else {
    const deposit = num(path(result, "required", "monthlyTodayCents"));
    valor = `${money(deposit ?? num(input.monthlyContributionCents))}/mês`;
    const age = num(input.retirementAge);
    const income = num(input.desiredMonthlyIncomeCents);
    resumo = [
      age === null ? null : `aos ${age} anos`,
      income === null ? null : `renda de ${money(income)}`,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return {
    id: `api:${item.id}`,
    apiId: item.id,
    tipo: kind.tipo,
    icone: kind.icone,
    href: kind.href,
    nome: item.name,
    valor,
    resumo,
    salva: `Salva em ${formatDate(item.createdAt, "dd/MM/yyyy")}`,
  };
}

/** As simulações salvas na conta (`GET /v1/simulations`). */
export function useApiSavedSimulations({ enabled }: { enabled: boolean }) {
  const query = useQuery(apiQuery(SIMULATIONS_PATH, SavedSchema, { enabled }));
  return {
    data: query.data?.data.map(toSavedFromApi),
    error: query.error,
    pending: enabled && query.isPending,
  };
}
