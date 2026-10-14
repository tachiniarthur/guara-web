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

const monthly = (valor: number, display: string, next?: [number, string]) => [
  ...["abr", "mai", "jun", "jul", "ago", "set"].map((mes) => ({ mes, valor, display })),
  { mes: "out*", valor: next?.[0] ?? valor, display: next?.[1] ?? display, previsto: true },
];

export const subscriptionDetails: Record<string, SubscriptionDetail> = {
  netflix: {
    aumento: {
      de: "R$ 39,90",
      para: "R$ 44,90",
      percentual: "+12,5%",
      desde: "08/10/2026",
      noAno: "R$ 60,00",
    },
    porAno: { valor: "R$ 538,80", nota: "com o novo preço" },
    proximaData: "08/10/2026",
    historico: monthly(39.9, "39,90", [44.9, "44,90"]),
    cobrancas: [
      { data: "08/09/2026", valor: "R$ 39,90" },
      { data: "08/08/2026", valor: "R$ 39,90" },
      { data: "08/07/2026", valor: "R$ 39,90" },
      { data: "08/06/2026", valor: "R$ 39,90" },
    ],
    totalSeisMeses: "R$ 239,40",
    cancelar: [
      "Abra o app ou o site da Netflix e entre na sua conta.",
      "Vá em Conta e escolha cancelar a assinatura.",
      "Cancele antes de 08/10 para não pagar outubro.",
    ],
    uso: "O Guará vê só a cobrança no cartão. Não dá para saber pelo banco se você tem assistido.",
  },
};

/** Detalhe de qualquer assinatura (as que não têm cadastro próprio usam os números da lista). */
export function subscriptionDetailFor(item: Subscription): SubscriptionDetail {
  const known = subscriptionDetails[item.id];
  if (known) return known;
  const valor = Number(item.valor.replace(/[^\d,]/g, "").replace(",", "."));
  const display = valor.toFixed(2).replace(".", ",");
  const dia = String(item.dia).padStart(2, "0");
  const anual = (valor * 12).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return {
    porAno: { valor: anual.replace(/ /g, " "), nota: "no preço atual" },
    proximaData: `${dia}/10/2026`,
    historico: monthly(valor, display),
    cobrancas: ["09", "08", "07", "06"].map((mes) => ({
      data: `${dia}/${mes}/2026`,
      valor: item.valor,
    })),
    totalSeisMeses: (valor * 6)
      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      .replace(/ /g, " "),
    cancelar: [
      `Abra o app ou o site do ${item.nome} e entre na sua conta.`,
      "Procure a área de assinatura ou pagamento e escolha cancelar.",
      `Cancele antes de ${dia}/10 para não pagar outubro.`,
    ],
    uso: "O Guará vê só a cobrança no cartão. Não dá para saber pelo banco se você tem usado.",
  };
}
