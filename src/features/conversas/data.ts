import type { AgentId } from "@/features/assistentes/data";

export type ConversationSummary = {
  id: string;
  titulo: string;
  quando: string;
  resumo: string;
};

export type ConversationGroup = { titulo: string; itens: ConversationSummary[] };

/** Histórico de conversas com a turma, agrupado por período. */
export const conversationHistory: ConversationGroup[] = [
  {
    titulo: "Hoje",
    itens: [
      {
        id: "gastos-setembro",
        titulo: "Gastos de setembro",
        quando: "14:32",
        resumo: "Você gastou R$ 742,18 em Alimentação",
      },
      {
        id: "aposentadoria-55",
        titulo: "Aposentadoria aos 55",
        quando: "14:40",
        resumo: "Aporte necessário: R$ 5.640/mês",
      },
    ],
  },
  {
    titulo: "Esta semana",
    itens: [
      {
        id: "alerta-bitcoin",
        titulo: "Alerta do Bitcoin",
        quando: "seg",
        resumo: "BTC a 5,4% do alvo de venda",
      },
      {
        id: "compra-madrugada",
        titulo: "Compra de madrugada",
        quando: "dom",
        resumo: "R$ 1.249,90 em eletrônicos",
      },
      {
        id: "cortar-uber",
        titulo: "Cortar Uber no emprego novo",
        quando: "sáb",
        resumo: "Economia estimada de R$ 312/mês",
      },
    ],
  },
  {
    titulo: "Agosto",
    itens: [
      {
        id: "rebalancear",
        titulo: "Rebalancear a carteira",
        quando: "28 ago",
        resumo: "Renda fixa acima do alvo",
      },
      {
        id: "viajar",
        titulo: "Quanto sobra para viajar?",
        quando: "19 ago",
        resumo: "Sobra média de R$ 1.900/mês",
      },
    ],
  },
];

/** Sugestões rápidas abaixo do chat. */
export const quickPrompts = ["Gastos pequenos", "Resumo da semana", "Como está meu saldo?"];

/** Conversas com o conteúdo completo; as demais do histórico ainda abrem a conversa atual. */
export const CURRENT_CONVERSATION = "gastos-setembro";
export const conversationIds = ["gastos-setembro", "aposentadoria-55"] as const;
export type ConversationId = (typeof conversationIds)[number];

export function conversationHref(id: string) {
  if (id === CURRENT_CONVERSATION || !(conversationIds as readonly string[]).includes(id))
    return "/conversas";
  return `/conversas/${id}`;
}

export const conversationCount = conversationHistory.reduce(
  (total, group) => total + group.itens.length,
  0,
);

/** Como cada bicho aparece ao ser chamado com @. */
export const agentMentions: { id: AgentId; handle: string; descricao: string }[] = [
  { id: "capivara", handle: "@capivara", descricao: "Coordena e chama o certo" },
  { id: "pacu", handle: "@pacu", descricao: "Investimentos e simulações" },
  { id: "caramelo", handle: "@caramelo", descricao: "Alertas de preço" },
  { id: "tamandua", handle: "@tamandua", descricao: "Organização de gastos" },
  { id: "quero-quero", handle: "@queroquero", descricao: "Compras fora do padrão" },
  { id: "onca", handle: "@onca", descricao: "Metas e objetivos" },
];
