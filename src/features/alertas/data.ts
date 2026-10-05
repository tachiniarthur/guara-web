import type { AgentId } from "@/features/assistentes/data";

export type PriceAlert = {
  id: string;
  ativo: string;
  direcao: "venda" | "compra";
  condicao: string;
  progresso: number;
  faltam: string;
};

/** Alertas de preço vigiados pelo Caramelo. */
export const priceAlerts: PriceAlert[] = [
  {
    id: "btc",
    ativo: "Bitcoin",
    direcao: "venda",
    condicao: "Quando subir a R$ 650.000 · agora R$ 615.200",
    progresso: 95,
    faltam: "Faltam 5,4%",
  },
  {
    id: "petr4",
    ativo: "PETR4",
    direcao: "compra",
    condicao: "Quando cair a R$ 34,00 · agora R$ 37,82",
    progresso: 78,
    faltam: "Faltam 10,1%",
  },
  {
    id: "ivvb11",
    ativo: "IVVB11",
    direcao: "compra",
    condicao: "Quando cair a R$ 330,00 · agora R$ 351,40",
    progresso: 88,
    faltam: "Faltam 6,1%",
  },
];

export type AlertHistoryItem = {
  id: string;
  agent: AgentId;
  texto: string;
  quando: string;
  pendente?: string;
};

/** Avisos já enviados (cada aviso de teto chega uma vez por mês). */
export const alertHistory: AlertHistoryItem[] = [
  {
    id: "h1",
    agent: "quero-quero",
    texto: "Compra fora do padrão: R$ 1.249,90 em eletrônicos",
    quando: "Hoje, 02:15 · celular e e-mail",
    pendente: "Aguardando sua resposta",
  },
  {
    id: "h2",
    agent: "tamandua",
    texto: "Alimentação chegou a R$ 700 (2º de 3 avisos)",
    quando: "21 set, 19:02 · celular",
  },
  {
    id: "h3",
    agent: "tamandua",
    texto: "Transporte chegou a R$ 300 (1º de 2 avisos)",
    quando: "17 set, 08:41 · celular",
  },
  {
    id: "h4",
    agent: "tamandua",
    texto: "Alimentação chegou a R$ 500 (1º de 3 avisos)",
    quando: "12 set, 13:48 · celular",
  },
];
