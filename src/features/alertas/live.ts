"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { BudgetSummarySchema, buildTetos, type BudgetSummary } from "@/features/gastos/live";
import type { TetoProgress } from "@/features/gastos/types";
import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatDate, formatMoney } from "@/lib/format";
import { percent, relativeDay, apiPercent, buildView } from "@/lib/live-format";

import type { AlertHistoryItem, PriceAlert } from "./data";
import type { PriceAlertDetail } from "./price-alerts";

/* Alertas com os dados da API (modo real), no mesmo formato dos dados de exemplo. */

const cents = z.number().int();

export const ApiPriceAlertSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  /** Bolsa dos EUA (alvo em dólar); ausente ou `null` = B3. */
  micCode: z.string().nullable().optional(),
  currency: z.string().optional(),
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

/** Valores do alerta na moeda do ativo: reais na B3, dólares nos EUA. */
const moneyOf =
  (alert: Pick<ApiPriceAlert, "currency">) =>
  (cents: number | null): string =>
    formatMoney(cents, alert.currency ?? "BRL");

/** Um alerta de preço como a lista do design mostra ("Faltam 10,1%", barra de progresso). */
export function toPriceAlert(alert: ApiPriceAlert): PriceAlert {
  const sell = alert.direction === "sell";
  const money = moneyOf(alert);
  const target = money(alert.targetPriceCents);
  const now = alert.currentPriceCents === null ? "—" : money(alert.currentPriceCents);
  if (alert.status === "triggered") {
    return {
      id: alert.id,
      ativo: alert.symbol,
      direcao: sell ? "venda" : "compra",
      condicao: `Disparou a ${money(alert.triggeredPriceCents)} · alvo ${target}`,
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

/** Tipos de notificação que entram no histórico de avisos (todos dados pelo Guará). */
const ALERT_TYPES = new Set([
  "price_alert_triggered",
  "budget_threshold_reached",
  "budget_exceeded",
  "unusual_transaction",
]);

/** Avisos já enviados: as notificações de teto, preço e compra fora do padrão. */
export function toAlertHistory(notifications: Notifications, now: Date): AlertHistoryItem[] {
  return notifications.data
    .filter((item) => ALERT_TYPES.has(item.type))
    .map((item) => ({
      id: item.id,
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

/** Endereços que a tela Alertas lê (os mesmos que o pré-carregamento busca). */
export const ALERTAS_PATHS = {
  budgets: "/v1/budgets/summary",
  alerts: "/v1/price-alerts",
  notifications: "/v1/notifications?limit=20",
} as const satisfies Record<string, ApiPath>;

/** Busca o que a tela Alertas mostra. `data` fica `undefined` enquanto carrega. */
export function useAlertasView({ enabled }: { enabled: boolean }) {
  const paths = ALERTAS_PATHS;
  const get = <T>(path: ApiPath, schema: z.ZodType<T>, staleTime?: number) => ({
    ...apiQuery(path, schema, { enabled, staleTime }),
  });
  const results = useQueries({
    queries: [
      get(paths.budgets, BudgetSummarySchema),
      get(paths.alerts, PriceAlertListSchema),
      get(paths.notifications, NotificationsSchema),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [budgets, alerts, notifications] = results.map((r) => r.data) as [
    BudgetSummary,
    PriceAlertList,
    Notifications,
  ];
  return buildView("alertas", () => toAlertasView({ budgets, alerts, notifications }, new Date()));
}

const HistorySchema = z.object({
  points: z.array(z.object({ date: z.string(), closeCents: cents.nullable() })),
});
type History = z.infer<typeof HistorySchema>;

/** Rótulo do gráfico na moeda do ativo, sem centavos redondos ("R$ 38", "US$ 350"). */
const axisLabel = (currency: string) => (value: number) =>
  formatMoney(Math.round(value * 100), currency).replace(/,00$/, "");

/** Detalhe de um alerta com os últimos 30 dias de cotação (função pura, testada). */
export function toPriceAlertDetail(
  alert: ApiPriceAlert,
  history: History | null,
  now: Date,
): PriceAlertDetail {
  const base = toPriceAlert(alert);
  const sell = alert.direction === "sell";
  const money = moneyOf(alert);
  const reais = axisLabel(alert.currency ?? "BRL");
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
    alvo: money(alert.targetPriceCents),
    alvoNota: sell ? "avisar quando subir até" : "avisar quando cair até",
    agora: alert.currentPriceCents === null ? "—" : money(alert.currentPriceCents),
    agoraHora: alert.quotedAt ? `às ${formatDate(alert.quotedAt, "HH:mm")}` : "",
    distancia: base.faltam.toLowerCase(),
    distanciaValor: distanceCents === null ? "—" : money(distanceCents),
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
      cotacao: money(alert.triggeredPriceCents),
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
        ...apiQuery(`/v1/price-alerts/${encodeURIComponent(id)}`, ApiPriceAlertSchema, { enabled }),
        retry: false,
      },
    ],
  });
  const alert = results[0].data;
  const history = useQueries({
    queries: [
      {
        ...apiQuery(
          `/v1/market/assets/${encodeURIComponent(alert?.symbol ?? "")}/history?range=1mo`,
          HistorySchema,
          // O histórico diário é só da B3 por enquanto: ativo dos EUA fica com o preço atual.
          { enabled: enabled && Boolean(alert) && !alert?.micCode, staleTime: 30 * 60_000 },
        ),
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
  if (error) return { data: undefined, error, missing, fired: false };
  // O histórico é opcional: sem ele (serviço fora, plano), o gráfico fica só com o preço atual.
  if (!alert || (!alert.micCode && history.isPending)) {
    return { data: undefined, error: null, missing: false, fired: false };
  }
  return {
    ...buildView("alerta de preço", () =>
      toPriceAlertDetail(alert, history.data ?? null, new Date()),
    ),
    fired: alert.status === "triggered",
    missing: false,
  };
}

/** Todos os alertas de preço ativos. */
export function usePriceAlerts({ enabled }: { enabled: boolean }) {
  const result = useQueries({
    queries: [apiQuery("/v1/price-alerts", PriceAlertListSchema, { enabled })],
  })[0];
  return {
    data: result.data?.data.filter((a) => a.status === "active").map(toPriceAlert),
    error: result.error,
  };
}
