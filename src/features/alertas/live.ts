"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import type { AgentId } from "@/features/assistentes/data";
import { BudgetSummarySchema, buildTetos, type BudgetSummary } from "@/features/gastos/live";
import type { TetoProgress } from "@/features/gastos/data";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { percent, relativeDay, apiPercent } from "@/lib/live-format";

import type { AlertHistoryItem, PriceAlert } from "./data";
import type { PriceAlertDetail } from "./price-alerts";

/* Alertas com os dados da API (modo real), no mesmo formato dos dados de exemplo. */

const cents = z.number().int();

export const ApiPriceAlertSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  assetName: z.string().nullable(),
  direction: z.enum(["buy", "sell"]),
  targetPriceCents: cents,
  status: z.enum(["active", "triggered"]),
  currentPriceCents: cents.nullable(),
  quotedAt: z.string().nullable(),
  distancePct: apiPercent.nullable(),
  triggeredAt: z.string().nullable(),
  triggeredPriceCents: cents.nullable(),
  createdAt: z.string(),
});
export type ApiPriceAlert = z.infer<typeof ApiPriceAlertSchema>;

const PriceAlertListSchema = z.object({ data: z.array(ApiPriceAlertSchema) });
type PriceAlertList = z.infer<typeof PriceAlertListSchema>;

const NotificationsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      body: z.string(),
      createdAt: z.string(),
    }),
  ),
});
type Notifications = z.infer<typeof NotificationsSchema>;

/** Um alerta de preço como a lista do design mostra ("Faltam 10,1%", barra de progresso). */
export function toPriceAlert(alert: ApiPriceAlert): PriceAlert {
  const sell = alert.direction === "sell";
  const target = formatCurrency(alert.targetPriceCents);
  const now = alert.currentPriceCents === null ? "—" : formatCurrency(alert.currentPriceCents);
  if (alert.status === "triggered") {
    return {
      id: alert.id,
      ativo: alert.symbol,
      direcao: sell ? "venda" : "compra",
      condicao: `Disparou a ${formatCurrency(alert.triggeredPriceCents)} · alvo ${target}`,
      progresso: 100,
      faltam: "Disparou",
    };
  }
  const distance = alert.distancePct === null ? null : Math.abs(alert.distancePct);
  return {
    id: alert.id,
    ativo: alert.symbol,
    direcao: sell ? "venda" : "compra",
    condicao: `${sell ? "Quando subir a" : "Quando cair a"} ${target} · agora ${now}`,
    progresso: distance === null ? 0 : Math.max(0, Math.min(100, Math.round(100 - distance))),
    faltam: distance === null ? "Sem cotação agora" : `Faltam ${percent.format(distance)}%`,
  };
}

const AGENT_BY_TYPE: Record<string, AgentId> = {
  price_alert_triggered: "caramelo",
  budget_threshold_reached: "tamandua",
  budget_exceeded: "tamandua",
  unusual_transaction: "quero_quero",
};

/** Avisos já enviados: as notificações de teto, preço e compra fora do padrão. */
export function toAlertHistory(notifications: Notifications, now: Date): AlertHistoryItem[] {
  return notifications.data
    .filter((item) => item.type in AGENT_BY_TYPE)
    .map((item) => ({
      id: item.id,
      agent: AGENT_BY_TYPE[item.type]!,
      texto: item.title,
      quando: `${relativeDay(formatDate(item.createdAt, "yyyy-MM-dd"), now)}, ${formatDate(item.createdAt, "HH:mm")}`,
    }));
}

export interface AlertasView {
  tetos: TetoProgress[];
  priceAlerts: PriceAlert[];
  history: AlertHistoryItem[];
}

export function toAlertasView(
  {
    budgets,
    alerts,
    notifications,
  }: { budgets: BudgetSummary; alerts: PriceAlertList; notifications: Notifications },
  now: Date,
): AlertasView {
  return {
    tetos: buildTetos(budgets),
    priceAlerts: alerts.data.filter((a) => a.status === "active").map(toPriceAlert),
    history: toAlertHistory(notifications, now),
  };
}

/** Busca o que a tela Alertas mostra. `data` fica `undefined` enquanto carrega. */
export function useAlertasView({ enabled }: { enabled: boolean }) {
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>) => ({
    queryKey: ["alertas", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime: 60_000,
  });
  const results = useQueries({
    queries: [
      get("/v1/budgets/summary", BudgetSummarySchema),
      get("/v1/price-alerts", PriceAlertListSchema),
      get("/v1/notifications?limit=20", NotificationsSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [budgets, alerts, notifications] = results.map((r) => r.data) as [
    BudgetSummary,
    PriceAlertList,
    Notifications,
  ];
  return { data: toAlertasView({ budgets, alerts, notifications }, new Date()), error: null };
}

const HistorySchema = z.object({
  points: z.array(z.object({ date: z.string(), closeCents: cents.nullable() })),
});
type History = z.infer<typeof HistorySchema>;

const reais = (value: number) => formatCurrency(Math.round(value * 100)).replace(/,00$/, "");

/** Detalhe de um alerta com os últimos 30 dias de cotação (função pura, testada). */
export function toPriceAlertDetail(
  alert: ApiPriceAlert,
  history: History | null,
  now: Date,
): PriceAlertDetail {
  const base = toPriceAlert(alert);
  const sell = alert.direction === "sell";
  const closes = (history?.points ?? []).filter((point) => point.closeCents !== null).slice(-30);
  const prices = closes.map((point) => point.closeCents! / 100);
  const current = alert.currentPriceCents === null ? null : alert.currentPriceCents / 100;
  if (current !== null && prices.length === 0) prices.push(current);
  const target = alert.targetPriceCents / 100;
  const all = [...prices, target];
  const low = Math.min(...all);
  const high = Math.max(...all);
  const pad = (high - low) * 0.1 || high * 0.05;
  const distanceCents =
    alert.currentPriceCents === null
      ? null
      : Math.abs(alert.targetPriceCents - alert.currentPriceCents);
  const lastDay = closes.at(-1)?.date;
  return {
    ...base,
    simbolo: alert.symbol.charAt(0),
    ticker: alert.symbol,
    alvo: formatCurrency(alert.targetPriceCents),
    alvoNota: sell ? "avisar quando subir até" : "avisar quando cair até",
    agora: alert.currentPriceCents === null ? "—" : formatCurrency(alert.currentPriceCents),
    agoraHora: alert.quotedAt ? `às ${formatDate(alert.quotedAt, "HH:mm")}` : "",
    distancia: base.faltam.toLowerCase(),
    distanciaValor: distanceCents === null ? "—" : formatCurrency(distanceCents),
    tipo: sell ? "Venda · avisar quando subir" : "Compra · avisar quando cair",
    criadoEm: formatDate(alert.createdAt),
    precos: prices,
    faixa: { baixo: Math.max(0, low - pad), alto: high + pad, rotulo: reais },
    minima: prices.length ? reais(Math.min(...prices)) : "—",
    maxima: prices.length ? reais(Math.max(...prices)) : "—",
    disparo: {
      quando: alert.triggeredAt
        ? `${relativeDay(formatDate(alert.triggeredAt, "yyyy-MM-dd"), now)}, ${formatDate(alert.triggeredAt, "HH:mm")}`
        : "—",
      cotacao: formatCurrency(alert.triggeredPriceCents),
      hora: alert.triggeredAt ? formatDate(alert.triggeredAt, "HH:mm") : "—",
      valor: (alert.triggeredPriceCents ?? alert.targetPriceCents) / 100,
    },
    ultimoRotulo: lastDay ? formatDate(`${lastDay}T12:00:00-03:00`, "dd/MM") : undefined,
  };
}

/** Um alerta de preço e o histórico do ativo. `missing` quando o alerta não existe. */
export function usePriceAlertDetail(id: string, { enabled }: { enabled: boolean }) {
  const results = useQueries({
    queries: [
      {
        queryKey: ["alertas", "preco", id],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          apiRequest(`/v1/price-alerts/${encodeURIComponent(id)}`, ApiPriceAlertSchema, { signal }),
        enabled,
        staleTime: 60_000,
        retry: false,
      },
    ],
  });
  const alert = results[0].data;
  const history = useQueries({
    queries: [
      {
        queryKey: ["alertas", "historico", alert?.symbol],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          apiRequest(
            `/v1/market/assets/${encodeURIComponent(alert!.symbol)}/history?range=1mo`,
            HistorySchema,
            { signal },
          ),
        enabled: enabled && Boolean(alert),
        staleTime: 30 * 60_000,
        retry: false,
      },
    ],
  })[0];
  const error = results[0].error;
  const missing =
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "not_found" || error.code === "validation_failed");
  if (error) return { data: undefined, error, missing };
  // O histórico é opcional: sem ele (serviço fora, plano), o gráfico fica só com o preço atual.
  if (!alert || history.isPending) return { data: undefined, error: null, missing: false };
  return {
    data: toPriceAlertDetail(alert, history.data ?? null, new Date()),
    fired: alert.status === "triggered",
    error: null,
    missing: false,
  };
}

/** Todos os alertas de preço ativos. */
export function usePriceAlerts({ enabled }: { enabled: boolean }) {
  const result = useQueries({
    queries: [
      {
        queryKey: ["alertas", "/v1/price-alerts"],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          apiRequest("/v1/price-alerts", PriceAlertListSchema, { signal }),
        enabled,
        staleTime: 60_000,
      },
    ],
  })[0];
  return {
    data: result.data?.data.filter((a) => a.status === "active").map(toPriceAlert),
    error: result.error,
  };
}
