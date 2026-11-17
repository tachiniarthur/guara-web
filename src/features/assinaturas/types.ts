/** Formatos que as telas de Assinaturas desenham (montados em `live.ts` a partir da API). */

export type Subscription = {
  id: string;
  nome: string;
  categoria: string;
  conta: string;
  dia: number;
  proxima: string;
  valor: string;
  /** "por mês" (padrão) ou "por ano" (cobrança anual). */
  periodo?: "por mês" | "por ano";
  alerta?: { tom: "tucano" | "urucum"; texto: string };
};

/** Detalhe de uma assinatura: valores, histórico de cobranças e como cancelar. */
export type SubscriptionDetail = {
  aumento?: { de: string; para: string; percentual: string; desde: string; noAno: string };
  porAno: { valor: string; nota: string };
  proximaData: string;
  historico: { mes: string; valor: number; display: string; previsto?: boolean }[];
  cobrancas: { data: string; valor: string }[];
  totalSeisMeses: string;
  cancelar: string[];
  uso: string;
};

/** Resumo do topo: quantas, o total do mês e do ano e a média, em centavos. */
export type SubscriptionStatsData = {
  ativas: number;
  mensal: number;
  anual: number;
  media: number | null;
};
