import { formatDate } from "@/lib/format";
import { capitalize } from "@/lib/live-format";

import type { Conversation } from "./api";

export type ConversationGroup = { titulo: string; itens: Conversation[] };

const DAY = 86_400_000;
const dayKey = (value: Date | string) => formatDate(value, "yyyy-MM-dd");

/** Dias inteiros entre a data e hoje, no calendário de São Paulo. */
function daysAgo(iso: string, now: Date) {
  const day = Date.parse(`${dayKey(iso)}T12:00:00-03:00`);
  const today = Date.parse(`${dayKey(now)}T12:00:00-03:00`);
  return Math.round((today - day) / DAY);
}

/** Hoje, Ontem, Esta semana (até 6 dias), e depois o mês ("Outubro", "Outubro de 2025"). */
function groupTitle(iso: string, now: Date) {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return "Hoje";
  if (ago === 1) return "Ontem";
  if (ago < 7) return "Esta semana";
  const sameYear = formatDate(iso, "yyyy") === formatDate(now, "yyyy");
  return capitalize(formatDate(iso, sameYear ? "MMMM" : "MMMM 'de' yyyy"));
}

/** Conversas agrupadas pela última mensagem, na ordem em que a API manda (mais recente antes). */
export function groupConversations(items: Conversation[], now: Date): ConversationGroup[] {
  const groups: ConversationGroup[] = [];
  for (const item of items) {
    const titulo = groupTitle(item.lastMessageAt, now);
    const last = groups.at(-1);
    if (last?.titulo === titulo) last.itens.push(item);
    else groups.push({ titulo, itens: [item] });
  }
  return groups;
}

/** Ao lado do título: a hora (hoje), "ontem", o dia da semana ou a data. */
export function whenLabel(iso: string, now: Date) {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return formatDate(iso, "HH:mm");
  if (ago === 1) return "ontem";
  if (ago < 7) return formatDate(iso, "EEE").replace(".", "");
  return formatDate(iso, "d MMM").replace(".", "");
}

/** "Hoje, 14:32", "Ontem, 09:10" ou "3 de out, 18:05" (marcador no começo da conversa). */
export function startedLabel(iso: string, now: Date) {
  const ago = daysAgo(iso, now);
  const time = formatDate(iso, "HH:mm");
  if (ago <= 0) return `Hoje, ${time}`;
  if (ago === 1) return `Ontem, ${time}`;
  return `${formatDate(iso, "d 'de' MMM").replace(".", "")}, ${time}`;
}

/** O que o Guará está consultando, em português (as tools da API). */
const TOOL_LABELS: Record<string, string> = {
  get_portfolio_summary: "sua carteira",
  get_quotes: "as cotações",
  get_spending_summary: "seus gastos",
  list_budgets: "seus tetos de gasto",
  list_goals: "suas metas",
  list_positions: "seus investimentos",
  list_price_alerts: "seus alertas de preço",
  list_simulations: "suas simulações",
  list_subscriptions: "suas assinaturas",
  list_unusual_transactions: "as compras fora do padrão",
  run_simulation: "uma simulação",
  search_transactions: "seus lançamentos",
};

export const toolLabel = (name: string) => TOOL_LABELS[name] ?? "seus dados";
