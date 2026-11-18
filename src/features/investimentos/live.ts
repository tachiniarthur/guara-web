"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { toPriceAlert, ApiPriceAlertSchema } from "@/features/alertas/live";
import type { PriceAlert } from "@/features/alertas/data";
import {
  AllocationResponseSchema,
  ALLOCATION_PATHS,
  InvestorProfileSchema,
  toAllocation,
  type AllocationResponse,
  type InvestorProfileResponse,
} from "@/features/alocacao/live";
import { exchangeLabel } from "@/features/mercado/live";
import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate, formatUsd } from "@/lib/format";
import { MONTHS, apiPercent, buildView, formatWhole, percent, signed } from "@/lib/live-format";

import type { CountryExposure, Position, PositionGroup, Risk } from "./types";
import { performanceTitle, type Performance, type PerformancePeriod } from "./performance";

/*
 * Investimentos com os dados da API: resumo, rentabilidade, posições, bens, alertas de preço e a
 * alocação nas quatro classes da API contra o alvo do perfil respondido no questionário.
 */

const cents = z.number().int();

export const ApiPositionSchema = z.object({
  id: z.string(),
  assetClass: z.string(),
  instrumentType: z.string(),
  name: z.string(),
  symbol: z.string().nullable(),
  risk: z.enum(["low", "medium", "high"]),
  quantity: z.string(),
  averagePriceCents: cents,
  costCents: cents,
  valueCents: cents.nullable(),
  valuationSource: z.string().nullable(),
  valuedOn: z.string().nullable(),
  returnPct: apiPercent.nullable(),
  portfolioPct: apiPercent.nullable(),
  country: z.string().nullable(),
  /** Ativo dos EUA: bolsa, moeda e valores em US$ (a API antiga não manda: opcionais). */
  micCode: z.string().nullable().optional(),
  currency: z.string().optional(),
  originalAveragePrice: z.string().nullable().optional(),
  originalValue: z.string().nullable().optional(),
  source: z.string(),
  updatedAt: z.string(),
});
export type ApiPosition = z.infer<typeof ApiPositionSchema>;

export const PositionsSchema = z.object({
  data: z.array(ApiPositionSchema),
  groups: z
    .array(
      z.object({
        assetClass: z.string(),
        label: z.string(),
        valueCents: cents,
        pct: apiPercent.nullable(),
        positions: z.array(ApiPositionSchema),
      }),
    )
    .nullable(),
});
export type Positions = z.infer<typeof PositionsSchema>;

const SummarySchema = z.object({
  investedCents: cents,
  costCents: cents,
  gainCents: cents,
  returnPct: apiPercent.nullable(),
  unvaluedPositions: z.number().int(),
  year: z.number().int(),
  contributionsYearCents: cents,
  dividendsYearCents: cents.nullable(),
  totalNetWorthCents: cents,
});
type Summary = z.infer<typeof SummarySchema>;

export const EvolutionSchema = z.object({
  /** O período da resposta (a tela mostra o rótulo do que chegou, não do que foi pedido). */
  period: z.enum(["6m", "12m", "all"]).optional(),
  returnPct: apiPercent.nullable(),
  cdiPct: apiPercent.nullable(),
  points: z.array(
    z.object({
      date: z.string(),
      valueCents: cents,
      returnPct: apiPercent,
      cdiPct: apiPercent.nullable(),
    }),
  ),
});
export type Evolution = z.infer<typeof EvolutionSchema>;

/** Quantos meses o gráfico mostra em cada período (o último ponto de cada mês). */
const PERIOD_MONTHS: Record<PerformancePeriod, number> = { "6m": 6, "12m": 12, all: Infinity };

/**
 * Rentabilidade do período: a curva mês a mês (o último ponto de cada mês) e o card
 * "Rentabilidade em…". Função pura, testada.
 */
export function toPerformance(evolution: Evolution, requested: PerformancePeriod): Performance {
  const period = evolution.period ?? requested;
  const lastOfMonth = new Map<string, Evolution["points"][number]>();
  for (const point of evolution.points) lastOfMonth.set(point.date.slice(0, 7), point);
  const monthly = [...lastOfMonth.entries()].slice(-PERIOD_MONTHS[period]);
  // Mais de um ano na tela: o mês leva o ano junto ("nov/25"), senão "nov" se repete.
  const years = new Set(monthly.map(([month]) => month.slice(0, 4)));
  const withYear = monthly.length > 12 || (period === "all" && years.size > 1);
  const rotulos = monthly.map(([month]) => {
    const name = MONTHS[Number(month.slice(5)) - 1]!.slice(0, 3);
    return withYear ? `${name}/${month.slice(2, 4)}` : name;
  });
  const total = evolution.returnPct;
  const cdi = evolution.cdiPct;
  return {
    rentabilidade: {
      carteira: monthly.map(([, p]) => p.returnPct),
      cdi: monthly.map(([, p]) => p.cdiPct),
      rotulos,
      periodo: period,
    },
    rent: {
      id: "rent",
      rotulo: performanceTitle(period),
      valor: total === null ? "—" : signed(total, `${percent.format(Math.abs(total))}%`),
      detalhe:
        cdi === null
          ? "CDI no período: —"
          : `CDI no período: ${signed(cdi, `${percent.format(Math.abs(cdi))}%`)}`,
      ganho: (total ?? 0) >= 0,
    },
  };
}

export const evolutionPath = (period: PerformancePeriod): ApiPath =>
  `/v1/investments/evolution?period=${period}`;

/**
 * A rentabilidade do período escolhido. O de 12 meses já vem com a tela (mesmo endereço, mesma
 * resposta no cache); ao trocar, a curva anterior fica na tela, esmaecida, até a nova chegar.
 */
export function usePerformance(period: PerformancePeriod, { enabled }: { enabled: boolean }) {
  const query = useQuery({
    ...apiQuery(evolutionPath(period), EvolutionSchema, { enabled }),
    placeholderData: keepPreviousData,
  });
  const performance = query.data ? toPerformance(query.data, period) : undefined;
  return {
    performance,
    loading:
      enabled &&
      (query.isPending || query.isPlaceholderData || (query.isError && query.isFetching)),
    error: query.isError && !query.isFetching ? query.error : null,
    retry: () => void query.refetch(),
  };
}

const BelongingsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["real_estate", "vehicle"]),
      name: z.string(),
      valueCents: cents,
      valueDate: z.string(),
      debtCents: cents.nullable(),
    }),
  ),
});
type Belongings = z.infer<typeof BelongingsSchema>;

const AlertsSchema = z.object({ data: z.array(ApiPriceAlertSchema) });
type Alerts = z.infer<typeof AlertsSchema>;

const DashboardSchema = z.object({
  netWorth: z.object({
    data: z.object({ investmentsMonthChangeCents: cents.nullable() }).loose().nullable(),
  }),
});
type Dashboard = z.infer<typeof DashboardSchema>;

export const RISK: Record<ApiPosition["risk"], Risk> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};
export const INSTRUMENT: Record<string, string> = {
  stock: "Ação",
  unit: "Unit",
  fii: "Fundo imobiliário",
  etf: "ETF",
  bdr: "BDR",
  crypto: "Cripto",
  fund: "Fundo de investimento",
  cdb: "CDB",
  lci_lca: "LCI/LCA",
  treasury: "Título público",
  debenture: "Debênture",
  savings: "Poupança",
  pension: "Previdência",
  other: "Outro",
};
/** Onde o globo marca cada país (o centro financeiro). */
const COUNTRY: Record<
  string,
  Omit<CountryExposure, "percentual" | "valor" | "ativos" | "detalhe">
> = {
  BR: {
    id: "br",
    pais: "Brasil",
    cor: "tucano",
    globo: { iso: 76, lat: -23.55, lng: -46.63, local: "São Paulo" },
  },
  US: {
    id: "us",
    pais: "Estados Unidos",
    cor: "arara",
    globo: { iso: 840, lat: 40.71, lng: -74.01, local: "Nova York" },
  },
};
const NO_COUNTRY = { id: "none", pais: "Sem país definido", cor: "folha" as const, globo: null };

/** Página da posição. */
export const positionHref = (id: string) => `/investimentos/${id}`;

/** "3 posições: ação, FII e ETF". */
function exposureDetail(list: ApiPosition[]) {
  const kinds = [...new Set(list.map((p) => INSTRUMENT[p.instrumentType] ?? p.instrumentType))];
  const count = list.length === 1 ? "1 posição" : `${list.length} posições`;
  const names = kinds.map((k) => k.toLowerCase());
  const joined =
    names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names.at(-1)}` : (names[0] ?? "");
  return joined ? `${count}: ${joined}` : count;
}

function toPosition(p: ApiPosition, groupLabel: string): Position {
  const manual = p.source === "manual";
  const abroad = Boolean(p.micCode);
  const exchange = p.micCode ? exchangeLabel(p.micCode) : null;
  const when = p.valuedOn ? formatDate(`${p.valuedOn}T12:00:00-03:00`, "dd/MM") : null;
  return {
    id: p.id,
    href: positionHref(p.id),
    nome: p.symbol ?? p.name,
    descricao: p.symbol
      ? exchange
        ? `${p.name} · ${exchange}`
        : p.name
      : (INSTRUMENT[p.instrumentType] ?? p.instrumentType),
    classe: groupLabel,
    instrumento: INSTRUMENT[p.instrumentType] ?? p.instrumentType,
    risco: RISK[p.risk],
    origem: manual
      ? { tipo: "manual", texto: "Cadastro manual", atualizado: when ? `valor de ${when}` : "—" }
      : { tipo: "open-finance", texto: "Open Finance" },
    quantidade: p.symbol ? Number(p.quantity).toLocaleString("pt-BR") : undefined,
    precoMedio: !p.symbol
      ? undefined
      : abroad
        ? formatUsd(p.originalAveragePrice ?? null)
        : formatCurrency(p.averagePriceCents),
    total: formatCurrency(p.valueCents),
    totalOriginal: abroad ? formatUsd(p.originalValue ?? null) : undefined,
    percentual: p.portfolioPct === null ? "—" : `${percent.format(p.portfolioPct)}%`,
    rentabilidade:
      p.returnPct === null
        ? { valor: "—", alta: true }
        : { valor: `${percent.format(Math.abs(p.returnPct))}%`, alta: p.returnPct >= 0 },
  };
}

export interface InvestimentosResponses {
  summary: Summary;
  evolution: Evolution;
  positions: Positions;
  belongings: Belongings;
  alerts: Alerts;
  profile: InvestorProfileResponse;
  allocation: AllocationResponse;
  dashboard: Dashboard;
}

/** Converte as respostas da API no que a tela Investimentos mostra (função pura, testada). */
export function toInvestimentosView(r: InvestimentosResponses, now: Date) {
  const invested = r.summary.investedCents;
  const all = r.positions.data;
  const monthName = MONTHS[Number(formatDate(now, "M")) - 1]!;
  const change = r.dashboard.netWorth.data?.investmentsMonthChangeCents ?? null;
  const base = change === null ? 0 : invested - change;

  // Rentabilidade em 12 meses (a tela troca o período pelo `usePerformance`).
  const performance = toPerformance(r.evolution, "12m");

  const groupsOut: PositionGroup[] = (r.positions.groups ?? []).map((g) => ({
    classe: g.label,
    total: formatCurrency(g.valueCents),
    percentual: g.pct === null ? "—" : `${percent.format(g.pct)}%`,
    posicoes: g.positions.map((p) => toPosition(p, g.label)),
  }));
  // A tela mostra as maiores; as demais entram em "outras N posições".
  const shown = new Set(
    [...all]
      .sort((a, b) => (b.valueCents ?? 0) - (a.valueCents ?? 0))
      .slice(0, 8)
      .map((p) => p.id),
  );
  const visibleGroups = groupsOut
    .map((g) => ({ ...g, posicoes: g.posicoes.filter((p) => shown.has(p.id)) }))
    .filter((g) => g.posicoes.length > 0);
  const rest = all.filter((p) => !shown.has(p.id));
  const restCents = rest.reduce((s, p) => s + (p.valueCents ?? 0), 0);

  const share = (value: number) => (invested > 0 ? Math.round((value / invested) * 1000) / 10 : 0);

  // Exposição por país das posições.
  const countries = new Map<string, ApiPosition[]>();
  for (const p of all) {
    const key = p.instrumentType === "crypto" ? "none" : (p.country ?? "BR");
    countries.set(key, [...(countries.get(key) ?? []), p]);
  }
  const countryExposure: CountryExposure[] = [...countries.entries()]
    .map(([code, list]) => {
      const value = list.reduce((s, p) => s + (p.valueCents ?? 0), 0);
      const meta =
        code === "none"
          ? NO_COUNTRY
          : (COUNTRY[code] ?? { ...NO_COUNTRY, id: code.toLowerCase(), pais: code });
      return {
        ...meta,
        detalhe: exposureDetail(list),
        percentual: Math.round(share(value)),
        valor: formatWhole(value),
        ativos: [...list]
          .sort((a, b) => (b.valueCents ?? 0) - (a.valueCents ?? 0))
          .slice(0, 5)
          .map((p) => ({
            nome: p.symbol ?? p.name,
            total: formatCurrency(p.valueCents),
            href: positionHref(p.id),
          })),
      };
    })
    .sort((a, b) => b.percentual - a.percentual);

  const otherAssets = r.belongings.data.map((b) => {
    const when = formatDate(`${b.valueDate}T12:00:00-03:00`, "MMM/yyyy").replace(".", "");
    const debt = b.debtCents ? `Saldo devedor ${formatWhole(b.debtCents)}` : "Quitado";
    const kind = b.kind === "real_estate" ? "Imóvel" : "Veículo";
    return {
      id: b.id,
      icone: (b.kind === "real_estate" ? "home" : "car") as "home" | "car",
      nome: b.name,
      detalhe: `${kind} · ${b.debtCents ? "financiado" : "quitado"}`,
      detalheCurto: `${kind} · ${b.debtCents ? `saldo devedor ${formatWhole(b.debtCents)}` : "quitado"}`,
      valor: formatWhole(b.valueCents),
      fonte: `Estimativa sua · informada em ${when}`,
      fonteCurta: `Valor estimado por você em ${when}`,
      extra: debt,
    };
  });

  const months = Math.max(1, Number(formatDate(now, "M")));
  const portfolio = {
    patrimonio: formatCurrency(invested),
    variacaoMes:
      change === null
        ? "—"
        : `${signed(change, formatCurrency(Math.abs(change)))} em ${monthName}` +
          (base > 0
            ? ` (${signed(change, `${percent.format(Math.abs((change / base) * 100))}%`)})`
            : ""),
    totalComBens: formatCurrency(r.summary.totalNetWorthCents),
    investido: formatCurrency(invested),
    bens: formatWhole(r.summary.totalNetWorthCents - invested),
    atualizacao: (() => {
      const latest = all
        .map((p) => p.valuedOn)
        .filter(Boolean)
        .sort()
        .at(-1);
      return latest
        ? `Valores de ${formatDate(`${latest}T12:00:00-03:00`, "dd/MM")}`
        : "Sem valores atualizados";
    })(),
    outras: {
      quantidade: rest.length,
      total: formatCurrency(restCents),
      percentual: `${percent.format(share(restCents))}%`,
    },
    rentabilidade: performance.rentabilidade,
    stats: [
      performance.rent,
      {
        id: "aportes",
        rotulo: `Aportes em ${r.summary.year}`,
        valor: formatWhole(r.summary.contributionsYearCents),
        detalhe: `${formatWhole(Math.round(r.summary.contributionsYearCents / months))} por mês, em média`,
      },
      {
        id: "proventos",
        rotulo: `Proventos em ${r.summary.year}`,
        valor: formatWhole(r.summary.dividendsYearCents),
        detalhe:
          r.summary.dividendsYearCents === null
            ? "Ainda não calculados por posição"
            : "Dividendos, JCP e rendimentos",
      },
    ],
  };

  const priceAlerts: PriceAlert[] = r.alerts.data
    .filter((a) => a.status === "active")
    .map(toPriceAlert);
  return {
    portfolio,
    positionGroups: visibleGroups,
    countryExposure,
    otherAssets,
    priceAlerts,
    alocacao: toAllocation(r.allocation, r.profile),
    posicoes: all.length,
    semInvestimentos: all.length === 0,
  };
}

export type InvestimentosView = ReturnType<typeof toInvestimentosView>;

/** Endereços que a tela Investimentos lê (os mesmos que o pré-carregamento busca). */
export const INVESTIMENTOS_PATHS = {
  summary: "/v1/investments/summary",
  evolution: evolutionPath("12m"),
  positions: "/v1/investments/positions?groupBy=class",
  belongings: "/v1/belongings",
  alerts: "/v1/price-alerts",
  profile: ALLOCATION_PATHS.profile,
  allocation: ALLOCATION_PATHS.allocation,
  dashboard: "/v1/dashboard",
} as const satisfies Record<string, ApiPath>;

/** Busca o que a tela Investimentos mostra. `data` fica `undefined` enquanto carrega. */
export function useInvestimentosView({ enabled }: { enabled: boolean }) {
  const paths = INVESTIMENTOS_PATHS;
  const get = <T>(path: ApiPath, schema: z.ZodType<T>, staleTime?: number) => ({
    ...apiQuery(path, schema, { enabled, staleTime }),
  });
  const results = useQueries({
    queries: [
      get(paths.summary, SummarySchema),
      get(paths.evolution, EvolutionSchema),
      get(paths.positions, PositionsSchema),
      get(paths.belongings, BelongingsSchema),
      get(paths.alerts, AlertsSchema),
      get(paths.profile, InvestorProfileSchema),
      get(paths.allocation, AllocationResponseSchema),
      get(paths.dashboard, DashboardSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [summary, evolution, positions, belongings, alerts, profile, allocation, dashboard] =
    results.map((result) => result.data) as [
      Summary,
      Evolution,
      Positions,
      Belongings,
      Alerts,
      InvestorProfileResponse,
      AllocationResponse,
      Dashboard,
    ];
  return buildView("investimentos", () =>
    toInvestimentosView(
      { summary, evolution, positions, belongings, alerts, profile, allocation, dashboard },
      new Date(),
    ),
  );
}
