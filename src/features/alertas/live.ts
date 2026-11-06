"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import type { AgentId } from "@/features/assistentes/data";
import { BudgetSummarySchema, buildTetos, type BudgetSummary } from "@/features/gastos/live";
import type { TetoProgress } from "@/features/gastos/data";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { percent, relativeDay } from "@/lib/live-format";

import type { AlertHistoryItem, PriceAlert } from "./data";

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
  distancePct: z.number().nullable(),
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
