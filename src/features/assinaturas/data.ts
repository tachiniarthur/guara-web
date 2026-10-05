export type Subscription = {
  id: string;
  nome: string;
  categoria: string;
  conta: string;
  dia: number;
  proxima: string;
  valor: string;
  alerta?: { tom: "tucano" | "urucum"; texto: string };
};

/** Assinaturas detectadas por valor e empresa que se repetem. */
export const subscriptions: Subscription[] = [
  {
    id: "spotify",
    nome: "Spotify",
    categoria: "Música",
    conta: "Nubank crédito",
    dia: 2,
    proxima: "Próxima cobrança em 02 out",
    valor: "R$ 21,90",
  },
  {
    id: "netflix",
    nome: "Netflix",
    categoria: "Streaming",
    conta: "Nubank crédito",
    dia: 8,
    proxima: "Próxima cobrança em 08 out",
    valor: "R$ 44,90",
    alerta: { tom: "tucano", texto: "Subiu de R$ 39,90" },
  },
  {
    id: "amazon",
    nome: "Amazon Prime",
    categoria: "Compras e streaming",
    conta: "Itaú crédito",
    dia: 12,
    proxima: "Próxima cobrança em 12 out",
    valor: "R$ 19,90",
    alerta: { tom: "urucum", texto: "Sem uso aparente há 60 dias" },
  },
  {
    id: "icloud",
    nome: "iCloud+",
    categoria: "Armazenamento",
    conta: "Itaú débito",
    dia: 15,
    proxima: "Próxima cobrança em 15 out",
    valor: "R$ 14,90",
  },
];

export const subscriptionTotals = {
  mensal: "R$ 101,60",
  anual: "R$ 1.219,20 por ano · 4 assinaturas",
};
