import { priceAlerts, type PriceAlert } from "./data";

/** Detalhe de um alerta de preço vigiado pelo Caramelo. */
export type PriceAlertDetail = PriceAlert & {
  simbolo: string;
  ticker: string;
  alvo: string;
  /** "avisar quando subir até" / "avisar quando cair até" */
  alvoNota: string;
  agora: string;
  agoraHora: string;
  distancia: string;
  distanciaValor: string;
  tipo: string;
  criadoEm: string;
  /** Preços dos últimos 30 dias (o último é o atual) e a faixa do gráfico. */
  precos: number[];
  faixa: { baixo: number; alto: number; rotulo: (v: number) => string };
  minima: string;
  maxima: string;
  /** Quando já disparou (estado "disparado"). */
  disparo: { quando: string; cotacao: string; hora: string; valor: number };
};

const mil = (v: number) => `${Math.round(v / 1000)} mil`;
const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

function trend(start: number, end: number, wiggle: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const base = start + ((end - start) * i) / 29;
    const noise = Math.sin(i * 1.7) * wiggle + Math.cos(i * 0.9) * wiggle * 0.6;
    return Math.round((i === 29 ? end : base + noise) * 100) / 100;
  });
}

const extra: Record<string, Omit<PriceAlertDetail, keyof PriceAlert>> = {
  btc: {
    simbolo: "₿",
    ticker: "BTC",
    alvo: "R$ 650.000",
    alvoNota: "avisar quando subir até",
    agora: "R$ 615.200",
    agoraHora: "às 14:30",
    distancia: "faltam 5,4%",
    distanciaValor: "R$ 34.800",
    tipo: "Venda · avisar quando subir",
    criadoEm: "15/09/2026",
    precos: [
      560100, 553600, 566000, 571800, 569300, 578900, 584200, 581000, 590300, 596800, 593200,
      601500, 598700, 606000, 611900, 609100, 617400, 620300, 624200, 619000, 612600, 608800,
      614200, 618900, 613300, 610700, 616100, 612900, 617800, 615200,
    ],
    faixa: { baixo: 550000, alto: 650000, rotulo: mil },
    minima: "R$ 553.600",
    maxima: "R$ 624.200",
    disparo: { quando: "Hoje, 15:12", cotacao: "R$ 651.300", hora: "hoje, 15:12", valor: 651300 },
  },
  petr4: {
    simbolo: "P",
    ticker: "PETR4",
    alvo: "R$ 34,00",
    alvoNota: "avisar quando cair até",
    agora: "R$ 37,82",
    agoraHora: "às 14:30",
    distancia: "faltam 10,1%",
    distanciaValor: "R$ 3,82",
    tipo: "Compra · avisar quando cair",
    criadoEm: "10/09/2026",
    precos: trend(38.9, 37.82, 0.45),
    faixa: { baixo: 34, alto: 40, rotulo: (v) => reais(v) },
    minima: "R$ 37,10",
    maxima: "R$ 39,60",
    disparo: { quando: "Hoje, 15:12", cotacao: "R$ 33,95", hora: "hoje, 15:12", valor: 33.95 },
  },
  ivvb11: {
    simbolo: "I",
    ticker: "IVVB11",
    alvo: "R$ 330,00",
    alvoNota: "avisar quando cair até",
    agora: "R$ 351,40",
    agoraHora: "às 14:30",
    distancia: "faltam 6,1%",
    distanciaValor: "R$ 21,40",
    tipo: "Compra · avisar quando cair",
    criadoEm: "02/09/2026",
    precos: trend(344, 351.4, 3.2),
    faixa: { baixo: 330, alto: 360, rotulo: (v) => reais(v) },
    minima: "R$ 339,80",
    maxima: "R$ 355,10",
    disparo: { quando: "Hoje, 15:12", cotacao: "R$ 329,70", hora: "hoje, 15:12", valor: 329.7 },
  },
};

export const priceAlertDetails: PriceAlertDetail[] = priceAlerts.map((alert) => ({
  ...alert,
  ...(extra[alert.id] ?? extra.btc!),
}));

export function findPriceAlert(id: string) {
  return priceAlertDetails.find((alert) => alert.id === id);
}
