"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { toPriceAlert, ApiPriceAlertSchema } from "@/features/alertas/live";
import type { PriceAlert } from "@/features/alertas/data";
import {
  groups as allocationGroups,
  profileById,
  type GroupId,
  type HeldSubclass,
  type ProfileId,
} from "@/features/alocacao/data";
import { exchangeLabel } from "@/features/mercado/live";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate, formatUsd } from "@/lib/format";
import { MONTHS, apiPercent, buildView, formatWhole, percent, signed } from "@/lib/live-format";

import type { AllocationSlice, CountryExposure, Position, PositionGroup, Risk } from "./data";

/*
 * Investimentos com os dados da API (modo real), no mesmo formato dos dados de exemplo. A
 * alocação segue os 5 grupos do design (renda fixa Brasil e exterior, renda variável Brasil e
 * exterior, cripto), montados das posições pelo instrumento e pelo país; o alvo é o do perfil
 * que a pessoa respondeu no questionário.
 */

const cents = z.number().int();

const ApiPositionSchema = z.object({
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

const PositionsSchema = z.object({
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
type Positions = z.infer<typeof PositionsSchema>;

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

const EvolutionSchema = z.object({
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
type Evolution = z.infer<typeof EvolutionSchema>;

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

const ProfileSchema = z.object({
  profile: z
    .object({ profile: z.enum(["conservative", "moderate", "aggressive"]), createdAt: z.string() })
    .loose()
    .nullable(),
});
type Profile = z.infer<typeof ProfileSchema>;

const DashboardSchema = z.object({
  netWorth: z.object({
    data: z.object({ investmentsMonthChangeCents: cents.nullable() }).loose().nullable(),
  }),
});
type Dashboard = z.infer<typeof DashboardSchema>;

const RISK: Record<ApiPosition["risk"], Risk> = { low: "Baixo", medium: "Médio", high: "Alto" };
const INSTRUMENT: Record<string, string> = {
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
const PROFILE: Record<"conservative" | "moderate" | "aggressive", ProfileId> = {
  conservative: "conservador",
  moderate: "moderado",
  aggressive: "arrojado",
};

/** Grupo do design: cripto; renda fixa (Brasil ou exterior); o resto é renda variável. */
export function groupOf(
  position: Pick<ApiPosition, "assetClass" | "instrumentType" | "country">,
): GroupId {
  const abroad = position.country !== null && position.country !== "BR";
  if (position.instrumentType === "crypto") return "cripto";
  if (position.assetClass === "fixed_income") return abroad ? "rf-int" : "rf-br";
  return abroad ? "rv-int" : "rv-br";
}

/** Subclasse do design (as do alvo do perfil), pelo instrumento e pelo nome. */
function subclassOf(p: ApiPosition): { grupo: GroupId; nome: string } {
  const grupo = groupOf(p);
  if (grupo === "cripto") return { grupo, nome: /eth/i.test(p.name) ? "Ethereum" : "Bitcoin" };
  if (grupo === "rf-br") {
    if (/IPCA/i.test(p.name)) return { grupo, nome: "Inflação (IPCA+)" };
    if (/Prefixad/i.test(p.name)) return { grupo, nome: "Prefixada" };
    if (p.instrumentType === "debenture") return { grupo, nome: "Crédito privado" };
    return { grupo, nome: "Pós-fixada" };
  }
  if (grupo === "rf-int") return { grupo, nome: "Treasuries" };
  if (grupo === "rv-int") {
    return {
      grupo,
      nome: p.instrumentType === "etf" ? "ETFs internacionais" : "Ações diretas/BDRs",
    };
  }
  if (p.instrumentType === "fii") return { grupo, nome: "FIIs" };
  if (/small/i.test(p.name)) return { grupo, nome: "Ações small caps" };
  return { grupo, nome: "Ações large cap" };
}

const COUNTRY: Record<string, Omit<CountryExposure, "percentual" | "valor" | "ativos">> = {
  BR: {
    id: "br",
    pais: "Brasil",
    detalhe: "Renda fixa, ações e fundos no Brasil",
    cor: "tucano",
    globo: { iso: 76, lat: -23.55, lng: -46.63, local: "B3 e Tesouro Nacional" },
  },
  US: {
    id: "us",
    pais: "Estados Unidos",
    detalhe: "ETFs e BDRs de empresas americanas",
    cor: "arara",
    globo: { iso: 840, lat: 40.71, lng: -74.01, local: "Bolsas de Nova York" },
  },
};
const NO_COUNTRY = {
  id: "none",
  pais: "Sem país",
  detalhe: "Ativos negociados no mundo todo",
  cor: "folha" as const,
  globo: null,
};

const slugOf = (p: ApiPosition) => (p.symbol ?? p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");

function toPosition(p: ApiPosition, groupLabel: string): Position {
  const manual = p.source === "manual";
  const abroad = Boolean(p.micCode);
  const exchange = p.micCode ? exchangeLabel(p.micCode) : null;
  const when = p.valuedOn ? formatDate(`${p.valuedOn}T12:00:00-03:00`, "dd/MM") : null;
  return {
    id: p.id,
    slug: slugOf(p),
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
    hoje:
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
  profile: Profile;
  dashboard: Dashboard;
}

/** Converte as respostas da API no que a tela Investimentos mostra (função pura, testada). */
export function toInvestimentosView(r: InvestimentosResponses, now: Date) {
  const invested = r.summary.investedCents;
  const all = r.positions.data;
  const monthName = MONTHS[Number(formatDate(now, "M")) - 1]!;
  const change = r.dashboard.netWorth.data?.investmentsMonthChangeCents ?? null;
  const base = change === null ? 0 : invested - change;

  // Rentabilidade: o último ponto de cada mês dos últimos 12.
  const lastOfMonth = new Map<string, Evolution["points"][number]>();
  for (const point of r.evolution.points) lastOfMonth.set(point.date.slice(0, 7), point);
  const monthly = [...lastOfMonth.entries()].slice(-12);
  const carteira = monthly.map(([, p]) => p.returnPct);
  const cdi = monthly.map(([, p]) => p.cdiPct);
  const rotulos = monthly.map(([month]) => MONTHS[Number(month.slice(5)) - 1]!.slice(0, 3));

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

  // Alocação nos 5 grupos do design.
  const byGroup: Record<GroupId, number> = {
    "rf-br": 0,
    "rf-int": 0,
    "rv-br": 0,
    "rv-int": 0,
    cripto: 0,
  };
  for (const p of all) byGroup[groupOf(p)] += p.valueCents ?? 0;
  const share = (value: number) => (invested > 0 ? Math.round((value / invested) * 1000) / 10 : 0);
  const atual = Object.fromEntries(
    allocationGroups.map((g) => [g.id, share(byGroup[g.id])]),
  ) as Record<GroupId, number>;
  const perfil: ProfileId = r.profile.profile ? PROFILE[r.profile.profile.profile] : "moderado";
  const alvo = profileById[perfil].alvo;
  const subTotals = new Map<string, { grupo: GroupId; valor: number; nomes: string[] }>();
  for (const p of all) {
    const sub = subclassOf(p);
    const key = `${sub.grupo}|${sub.nome}`;
    const entry = subTotals.get(key) ?? { grupo: sub.grupo, valor: 0, nomes: [] };
    entry.valor += p.valueCents ?? 0;
    entry.nomes.push(p.symbol ?? p.name);
    subTotals.set(key, entry);
  }
  const subclasses: HeldSubclass[] = profileById[perfil].subclasses.map((s) => {
    const held = [...subTotals.entries()].find(
      ([key]) => key.split("|")[0] === s.grupo && s.nome.startsWith(key.split("|")[1]!),
    )?.[1];
    return held
      ? {
          ...s,
          atual: share(held.valor),
          detalhe: `${held.nomes.slice(0, 3).join(", ")}${held.nomes.length > 3 ? "…" : ""} · ${formatCurrency(held.valor)}`,
        }
      : { ...s, atual: 0 };
  });
  const portfolioAllocation = {
    perfil,
    definidoEm: r.profile.profile ? formatDate(r.profile.profile.createdAt) : "—",
    total: formatCurrency(invested),
    ativos: all.length,
    atual,
    subclasses,
    emReais: allocationGroups.map((g) => {
      const target = Math.round((invested * alvo[g.id]) / 100);
      const diff = byGroup[g.id] - target;
      return {
        grupo: g.id,
        hoje: formatCurrency(byGroup[g.id]),
        alvo: formatCurrency(target),
        falta: diff >= 0 ? `${formatCurrency(diff)} acima` : `faltam ${formatCurrency(-diff)}`,
      };
    }),
  };
  const allocation: AllocationSlice[] = allocationGroups.map((g) => ({
    classe: g.nome,
    curta: g.curta,
    cor: g.cor,
    atual: atual[g.id],
    alvo: alvo[g.id],
  }));

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
        percentual: Math.round(share(value)),
        valor: formatWhole(value),
        ativos: [...list]
          .sort((a, b) => (b.valueCents ?? 0) - (a.valueCents ?? 0))
          .slice(0, 5)
          .map((p) => ({
            nome: p.symbol ?? p.name,
            total: formatCurrency(p.valueCents),
            slug: slugOf(p),
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

  const yearReturn = r.evolution.returnPct;
  const yearCdi = r.evolution.cdiPct;
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
    rentabilidade: { carteira, cdi, meses: rotulos.filter((_, i) => i % 2 === 1), rotulos },
    stats: [
      {
        id: "rent",
        rotulo: "Rentabilidade em 12 meses",
        valor:
          yearReturn === null
            ? "—"
            : `${signed(yearReturn, `${percent.format(Math.abs(yearReturn))}%`)}`,
        detalhe:
          yearCdi === null
            ? "CDI no período: —"
            : `CDI no período: ${signed(yearCdi, `${percent.format(Math.abs(yearCdi))}%`)}`,
        ganho: (yearReturn ?? 0) >= 0,
      },
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
        detalhe: "Dividendos, JCP e rendimentos",
      },
    ],
  };

  const priceAlerts: PriceAlert[] = r.alerts.data
    .filter((a) => a.status === "active")
    .map(toPriceAlert);
  return {
    portfolio,
    positionGroups: visibleGroups,
    allocation,
    countryExposure,
    otherAssets,
    priceAlerts,
    portfolioAllocation,
    posicoes: all.length,
    semInvestimentos: all.length === 0,
  };
}

export type InvestimentosView = ReturnType<typeof toInvestimentosView>;

/** Busca o que a tela Investimentos mostra. `data` fica `undefined` enquanto carrega. */
export function useInvestimentosView({ enabled }: { enabled: boolean }) {
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>) => ({
    queryKey: ["investimentos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime: 60_000,
  });
  const results = useQueries({
    queries: [
      get("/v1/investments/summary", SummarySchema),
      get("/v1/investments/evolution?period=12m", EvolutionSchema),
      get("/v1/investments/positions?groupBy=class", PositionsSchema),
      get("/v1/belongings", BelongingsSchema),
      get("/v1/price-alerts", AlertsSchema),
      get("/v1/investor-profile", ProfileSchema),
      get("/v1/dashboard", DashboardSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [summary, evolution, positions, belongings, alerts, profile, dashboard] = results.map(
    (result) => result.data,
  ) as [Summary, Evolution, Positions, Belongings, Alerts, Profile, Dashboard];
  return buildView("investimentos", () =>
    toInvestimentosView(
      { summary, evolution, positions, belongings, alerts, profile, dashboard },
      new Date(),
    ),
  );
}
