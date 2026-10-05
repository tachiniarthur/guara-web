import type { AgentId } from "./data";

export type AgentHighlight =
  | { kind: "dot"; tone: "folha" | "urucum"; strong: string; text: string }
  | { kind: "alert"; strong: string; text: string }
  | { kind: "progress"; strong: string; text: string; value: number; label: string }
  | {
      kind: "allocation";
      strong: string;
      text: string;
      label: string;
      parts: { value: number; color: string }[];
    };

export type AgentCardData = {
  agent: AgentId;
  status: string;
  /** Status em urucum (ex.: "1 alerta"). */
  statusAlert?: boolean;
  metric: string;
  metricAlert?: boolean;
  metricCaption: string;
  highlight: AgentHighlight;
  quote: string;
  link: { label: string; href: string; alert?: boolean };
};

/** Resumo do que cada bicho está fazendo agora (cards do Início e de Assistentes). */
export const agentCards: Record<AgentId, AgentCardData> = {
  capivara: {
    agent: "capivara",
    status: "coordenando a equipe",
    metric: "6 conversas",
    metricCaption: "com a equipe esta semana",
    highlight: { kind: "dot", tone: "folha", strong: "Hoje:", text: "gastos de setembro" },
    quote: "Pergunta do seu jeito que eu chamo quem sabe.",
    link: { label: "Abrir conversas", href: "/conversas" },
  },
  tamandua: {
    agent: "tamandua",
    status: "analisando gastos",
    metric: "R$ 5.912,47",
    metricCaption: "gastos em setembro",
    highlight: { kind: "dot", tone: "urucum", strong: "Transporte", text: "em 86% do teto" },
    quote: "34 gastos pequenos somaram R$ 612 este mês.",
    link: { label: "Ver gastos", href: "/gastos" },
  },
  pacu: {
    agent: "pacu",
    status: "resumo na segunda",
    metric: "R$ 48.310,90",
    metricCaption: "na carteira de investimentos",
    highlight: {
      kind: "allocation",
      strong: "+1,8%",
      text: "no mês · CDI +0,9%",
      label: "Alocação: renda fixa 46%, ações 22%, FIIs 14%, cripto 10%, internacional 8%",
      parts: [
        { value: 46, color: "var(--guara-sand)" },
        { value: 22, color: "var(--guara-tucano)" },
        { value: 14, color: "var(--guara-arara)" },
        { value: 10, color: "var(--guara-urucum)" },
        { value: 8, color: "var(--guara-folha)" },
      ],
    },
    quote: "Na segunda eu mando o resumo da carteira.",
    link: { label: "Ver carteira", href: "/investimentos" },
  },
  caramelo: {
    agent: "caramelo",
    status: "vigiando preços",
    metric: "3 alertas",
    metricCaption: "de preço ativos",
    highlight: {
      kind: "progress",
      strong: "Bitcoin",
      text: "a 5,4% do alvo de venda",
      value: 82,
      label: "Bitcoin a 5,4% do alvo",
    },
    quote: "Tô de guarda. Bateu no preço, eu lato.",
    link: { label: "Ver alertas", href: "/alertas" },
  },
  "quero-quero": {
    agent: "quero-quero",
    status: "1 alerta",
    statusAlert: true,
    metric: "1 compra",
    metricAlert: true,
    metricCaption: "fora do seu padrão",
    highlight: { kind: "alert", strong: "R$ 1.249,90", text: "às 02:14 · 3,8x sua média" },
    quote: "Teve uma compra estranha às 02:14. Foi você?",
    link: { label: "Revisar compra", href: "/alertas", alert: true },
  },
  onca: {
    agent: "onca",
    status: "de olho nas metas",
    metric: "2 metas",
    metricCaption: "em andamento",
    highlight: {
      kind: "progress",
      strong: "Viagem",
      text: "em 62% da meta",
      value: 62,
      label: "Viagem em 62% da meta",
    },
    quote: "Faltam R$ 3.800 para a viagem. No ritmo atual, chega em março.",
    link: { label: "Ver metas", href: "/simulador/objetivo" },
  },
};
