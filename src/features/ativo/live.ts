"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { CLASS_COLOR, type AssetClassId } from "@/features/alocacao/live";
import { INSTRUMENT, RISK, ApiPositionSchema } from "@/features/investimentos/live";
import type { Risk } from "@/features/investimentos/types";
import { exchangeLabel } from "@/features/mercado/live";
import { ApiError, apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi, markApiStale, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate, formatUsd } from "@/lib/format";
import { apiPercent, percent } from "@/lib/live-format";

/*
 * Página do ativo com os dados da API. O endereço é o id da posição (`/investimentos/<uuid>`):
 * a posição vem de `/v1/investments/positions/:id`; se ela tem ticker da B3 (ou cripto), a
 * cotação, o desempenho e os proventos vêm de `/v1/market/assets/:symbol` (recurso do plano).
 */

const cents = z.number().int();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** O id da URL só vira chamada à API se for um uuid (nada de caminho montado com texto solto). */
export const isPositionId = (id: string) => UUID.test(id);

export const CLASS_NAME: Record<AssetClassId, string> = {
  fixed_income: "Renda fixa",
  equities: "Renda variável",
  real_estate: "Imobiliário",
  alternatives: "Alternativos",
};

export const PositionDetailSchema = ApiPositionSchema.extend({
  priceCents: cents.nullable().optional(),
  manualValueCents: cents.nullable().optional(),
  manualValueDate: z.string().nullable().optional(),
  manualValueStale: z.boolean().optional(),
  gainCents: cents.nullable().optional(),
  originalPrice: z.string().nullable().optional(),
  fx: z.object({ rate: z.string(), date: z.string() }).loose().nullable().optional(),
});
export type PositionDetail = z.infer<typeof PositionDetailSchema>;

const PerformanceSchema = z.object({
  period: z.string(),
  returnPct: apiPercent.nullable(),
  cdiPct: apiPercent.nullable(),
  volatilityPct: apiPercent.nullable(),
  sharpe: apiPercent.nullable(),
});

const MarketAssetSchema = z.object({
  asset: z.object({
    symbol: z.string(),
    name: z.string(),
    longName: z.string().nullable(),
    assetType: z.string(),
    sector: z.string().nullable(),
  }),
  quote: z.object({
    priceCents: cents.nullable(),
    changePercent: apiPercent.nullable(),
    dayHighCents: cents.nullable(),
    dayLowCents: cents.nullable(),
    week52HighCents: cents.nullable(),
    week52LowCents: cents.nullable(),
    quotedAt: z.string().nullable(),
  }),
  performance: z.array(PerformanceSchema),
  fundamentals: z
    .object({
      endDate: z.string(),
      totalAssetsCents: cents.nullable(),
      totalLiabilitiesCents: cents.nullable(),
      equityCents: cents.nullable(),
      cashCents: cents.nullable(),
    })
    .nullable(),
  dividends: z
    .object({
      last12Months: z.array(
        z.object({
          label: z.string(),
          ratePerShare: z.string(),
          lastDatePrior: z.string().nullable(),
          exDate: z.string().nullable(),
          paymentDate: z.string().nullable(),
        }),
      ),
      totalPerShare: z.string(),
      dividendYieldPct: apiPercent.nullable(),
    })
    .nullable(),
  corporateEvents: z
    .array(
      z.object({
        label: z.string(),
        factor: z.string(),
        description: z.string().nullable(),
        lastDatePrior: z.string().nullable(),
        exDate: z.string().nullable(),
      }),
    )
    .nullable(),
  dataPlanLimits: z.array(z.string()),
});
export type MarketAsset = z.infer<typeof MarketAssetSchema>;

export const HISTORY_RANGES = ["1mo", "3mo", "6mo", "1y", "5y"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];
export const RANGE_LABEL: Record<HistoryRange, string> = {
  "1mo": "1 mês",
  "3mo": "3 meses",
  "6mo": "6 meses",
  "1y": "1 ano",
  "5y": "5 anos",
};

const HistorySchema = z.object({
  range: z.string(),
  limitedByPlan: z.boolean(),
  points: z.array(z.object({ date: z.string(), closeCents: cents.nullable() })),
});
export type History = z.infer<typeof HistorySchema>;

// --- Formatação ------------------------------------------------------------------------------

const brDay = (day: string | null | undefined) => (day ? formatDate(`${day}T12:00:00-03:00`) : "—");
const shortDay = (day: string | null | undefined) =>
  day ? formatDate(`${day}T12:00:00-03:00`, "dd/MM") : "—";

export type Change = { valor: string; alta: boolean } | null;
const change = (value: number | null | undefined): Change =>
  value === null || value === undefined
    ? null
    : { valor: `${percent.format(Math.abs(value))}%`, alta: value >= 0 };

const pct = (value: number | null) =>
  value === null ? "—" : `${value > 0 ? "+" : ""}${percent.format(value)}%`;

/** "0.47156696" (por cota) para "R$ 0,4716". */
export function perShare(decimal: string) {
  const value = Number(decimal);
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
}

/** Quantidade sem zeros sobrando ("10.00000000" vira "10"; "0.5" vira "0,5"). */
export function formatQuantity(decimal: string) {
  const value = Number(decimal);
  if (!Number.isFinite(value)) return decimal;
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 8 });
}

// --- A posição -------------------------------------------------------------------------------

export interface AssetView {
  id: string;
  nome: string;
  ticker: string | null;
  descricao: string;
  instrumento: string;
  classe: string;
  cor: string;
  risco: Risk;
  manual: boolean;
  origem: string;
  /** Bolsa de fora ("Nasdaq"); `null` = Brasil. */
  bolsa: string | null;
  /** Com ticker da B3 ou cripto: a página de mercado existe. */
  mercado: boolean;
  /** Tem quantidade de verdade (com ticker); sem ticker, a quantidade é "1". */
  cotado: boolean;
  valor: string;
  valorOriginal: string | null;
  custo: string;
  ganho: { valor: string; alta: boolean } | null;
  rentabilidade: Change;
  percentual: string;
  quantidade: string;
  precoMedio: string;
  cotacao: string;
  /** "Cotação de 16/11", "Valor informado em 02/10" ou "Sem valor". */
  valorEm: string;
  /** Valor informado há mais de 30 dias. */
  desatualizado: boolean;
  /** Campos para os formulários (centavos e texto da API). */
  form: {
    name: string;
    quantity: string;
    averagePriceCents: number;
    manualValueCents: number | null;
  };
}

export function toAssetView(p: PositionDetail): AssetView {
  const classId = p.assetClass as AssetClassId;
  const manual = p.source === "manual";
  const abroad = Boolean(p.micCode);
  const instrumento = INSTRUMENT[p.instrumentType] ?? p.instrumentType;
  const gain = p.gainCents ?? null;
  const valuedOn = shortDay(p.valuedOn);
  const valorEm =
    p.valueCents === null
      ? "Sem valor"
      : p.valuationSource === "quote"
        ? `Cotação de ${valuedOn}`
        : p.valuationSource === "institution"
          ? `Valor da instituição em ${valuedOn}`
          : `Valor informado em ${valuedOn}`;
  return {
    id: p.id,
    nome: p.symbol ?? p.name,
    ticker: p.symbol,
    descricao: p.symbol ? p.name : instrumento,
    instrumento,
    classe: CLASS_NAME[classId] ?? p.assetClass,
    cor: CLASS_COLOR[classId] ?? "#93A198",
    risco: RISK[p.risk],
    manual,
    origem: manual ? "Cadastro manual" : "Open Finance",
    bolsa: abroad ? exchangeLabel(p.micCode) : null,
    mercado: Boolean(p.symbol) && !abroad,
    cotado: Boolean(p.symbol),
    valor: formatCurrency(p.valueCents),
    valorOriginal: abroad && p.originalValue ? formatUsd(p.originalValue) : null,
    custo: formatCurrency(p.costCents),
    ganho:
      gain === null
        ? null
        : { valor: `${gain >= 0 ? "+" : "−"}${formatCurrency(Math.abs(gain))}`, alta: gain >= 0 },
    rentabilidade: change(p.returnPct),
    percentual: p.portfolioPct === null ? "—" : `${percent.format(p.portfolioPct)}%`,
    quantidade: p.symbol ? formatQuantity(p.quantity) : "—",
    precoMedio: p.symbol
      ? abroad && p.originalAveragePrice
        ? `${formatUsd(p.originalAveragePrice)} (${formatCurrency(p.averagePriceCents)})`
        : formatCurrency(p.averagePriceCents)
      : "—",
    cotacao:
      abroad && p.originalPrice
        ? formatUsd(p.originalPrice)
        : p.priceCents
          ? formatCurrency(p.priceCents)
          : "—",
    valorEm,
    desatualizado: Boolean(p.manualValueStale),
    form: {
      name: p.name,
      quantity: p.quantity,
      averagePriceCents: p.averagePriceCents,
      manualValueCents: p.manualValueCents ?? null,
    },
  };
}

// --- Mercado ---------------------------------------------------------------------------------

const PERIOD_LABEL: Record<string, string> = {
  "1mo": "1 mês",
  "3mo": "3 meses",
  "6mo": "6 meses",
  "1y": "12 meses",
};

export interface MarketView {
  nomeLongo: string | null;
  setor: string | null;
  cotacao: string;
  variacaoDia: Change;
  cotadoEm: string | null;
  dia: { min: string; max: string } | null;
  /** Faixa de 52 semanas com a posição (0–100) da cotação de hoje nela. */
  faixa52: { min: string; max: string; posicao: number } | null;
  desempenho: {
    periodo: string;
    retorno: string;
    cdi: string;
    volatilidade: string;
    sharpe: string;
  }[];
  fundamentos: { data: string; itens: { label: string; value: string }[] } | null;
  proventos: {
    porCota: string;
    dy: string | null;
    itens: { label: string; valor: string; dataCom: string; pagamento: string }[];
  } | null;
  eventos: { label: string; fator: string; descricao: string | null; data: string }[] | null;
  /** O que veio vazio porque o plano da fonte de dados não cobre. */
  limites: string[];
}

const LIMIT_TEXT: Record<string, string> = {
  dividends: "proventos",
  fundamentals: "dados do balanço",
  long_history: "histórico longo",
};

export function toMarketView(m: MarketAsset): MarketView {
  const q = m.quote;
  const range =
    q.week52LowCents !== null && q.week52HighCents !== null && q.priceCents !== null
      ? {
          min: formatCurrency(q.week52LowCents),
          max: formatCurrency(q.week52HighCents),
          posicao:
            q.week52HighCents === q.week52LowCents
              ? 50
              : Math.min(
                  100,
                  Math.max(
                    0,
                    ((q.priceCents - q.week52LowCents) / (q.week52HighCents - q.week52LowCents)) *
                      100,
                  ),
                ),
        }
      : null;
  const f = m.fundamentals;
  return {
    nomeLongo: m.asset.longName,
    setor: m.asset.sector,
    cotacao: formatCurrency(q.priceCents),
    variacaoDia: change(q.changePercent),
    cotadoEm: q.quotedAt ? formatDate(q.quotedAt, "dd/MM 'às' HH:mm") : null,
    dia:
      q.dayLowCents !== null && q.dayHighCents !== null
        ? { min: formatCurrency(q.dayLowCents), max: formatCurrency(q.dayHighCents) }
        : null,
    faixa52: range,
    desempenho: m.performance.map((p) => ({
      periodo: PERIOD_LABEL[p.period] ?? p.period,
      retorno: pct(p.returnPct),
      cdi: pct(p.cdiPct),
      volatilidade: p.volatilityPct === null ? "—" : `${percent.format(p.volatilityPct)}%`,
      sharpe:
        p.sharpe === null ? "—" : p.sharpe.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    })),
    fundamentos: f
      ? {
          data: brDay(f.endDate),
          itens: [
            { label: "Ativos totais", value: formatCurrency(f.totalAssetsCents) },
            { label: "Passivos totais", value: formatCurrency(f.totalLiabilitiesCents) },
            { label: "Patrimônio líquido", value: formatCurrency(f.equityCents) },
            { label: "Caixa", value: formatCurrency(f.cashCents) },
          ],
        }
      : null,
    proventos: m.dividends
      ? {
          porCota: perShare(m.dividends.totalPerShare),
          dy:
            m.dividends.dividendYieldPct === null
              ? null
              : `${percent.format(m.dividends.dividendYieldPct)}%`,
          itens: m.dividends.last12Months.map((d) => ({
            label: d.label,
            valor: perShare(d.ratePerShare),
            dataCom: brDay(d.lastDatePrior),
            pagamento: brDay(d.paymentDate),
          })),
        }
      : null,
    eventos: m.corporateEvents
      ? m.corporateEvents.map((e) => ({
          label: e.label,
          fator: e.factor,
          descricao: e.description,
          data: brDay(e.exDate ?? e.lastDatePrior),
        }))
      : null,
    limites: m.dataPlanLimits.map((l) => LIMIT_TEXT[l] ?? l),
  };
}

/** Pontos do gráfico (sem os dias sem fechamento). */
export function toHistoryPoints(h: History) {
  return h.points
    .filter((p): p is { date: string; closeCents: number } => p.closeCents !== null)
    .map((p) => ({ date: p.date, value: p.closeCents / 100 }));
}

// --- Consultas -------------------------------------------------------------------------------

/** 4xx (não existe, sem permissão, fora do plano) não melhora tentando de novo. */
const retry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status !== null && error.status < 500) && count < 2;

export const positionPath = (id: string): ApiPath =>
  `/v1/investments/positions/${encodeURIComponent(id)}`;
const marketPath = (symbol: string): ApiPath => `/v1/market/assets/${encodeURIComponent(symbol)}`;

export function usePosition(id: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    ...apiQuery(positionPath(id), PositionDetailSchema, { enabled: enabled && isPositionId(id) }),
    retry,
  });
}

export function useMarketAsset(symbol: string | null, { enabled }: { enabled: boolean }) {
  return useQuery({
    ...apiQuery(marketPath(symbol ?? "-"), MarketAssetSchema, {
      enabled: enabled && symbol !== null,
      staleTime: 60_000,
    }),
    retry,
  });
}

export function useHistory(
  symbol: string | null,
  range: HistoryRange,
  { enabled }: { enabled: boolean },
) {
  return useQuery({
    ...apiQuery(`${marketPath(symbol ?? "-")}/history?range=${range}`, HistorySchema, {
      enabled: enabled && symbol !== null,
      staleTime: 10 * 60_000,
    }),
    retry,
  });
}

/** Recurso fora do plano (a página de mercado do ativo é do plano Pro). */
export const isPlanLimit = (error: unknown) =>
  error instanceof ApiError &&
  (error.code === "plan_limit_reached" || error.code === "subscription_required");

// --- Alterações ------------------------------------------------------------------------------

const invalidatePortfolio = (client: ReturnType<typeof useQueryClient>) =>
  invalidateApi(client, "/v1/investments", "/v1/goals", "/v1/dashboard");

export type PositionPatch = {
  name?: string;
  quantity?: string;
  averagePriceCents?: number;
  manualValueCents?: number | null;
};

/** Correção da posição (não gera aporte nem resgate). */
export function useUpdatePosition(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: PositionPatch) =>
      apiRequest(positionPath(id), PositionDetailSchema, { method: "PATCH", body }),
    onSuccess: () => invalidatePortfolio(client),
  });
}

export type MovementInput = {
  kind: "contribution" | "redemption";
  amountCents?: number;
  originalAmount?: string;
  quantity?: string;
  occurredOn: string;
};

/** Aporte ou resgate: a API recalcula quantidade e preço médio. */
export function useAddMovement(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: MovementInput) =>
      apiRequest(`${positionPath(id)}/movements`, z.object({}).loose(), {
        method: "POST",
        body,
      }),
    onSuccess: () => invalidatePortfolio(client),
  });
}

/** Remove a posição e as movimentações dela. */
export function useRemovePosition(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest(positionPath(id), z.undefined(), { method: "DELETE" }),
    // Sem buscar agora: a página do item excluído ainda está aberta e pediria um 404.
    onSuccess: () => markApiStale(client, "/v1/investments", "/v1/goals", "/v1/dashboard"),
  });
}
