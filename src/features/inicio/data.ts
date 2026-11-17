export interface CashFlowData {
  /**
   * "mes" (padrão): um ponto por dia do mês. "ano": um ponto por mês, de janeiro a dezembro; aí
   * `diasNoMes` é 12 e `hoje` é o mês atual (1 a 12).
   */
  periodo?: "mes" | "ano";
  diasNoMes: number;
  /** Último dia com dado (hoje no mês atual). */
  hoje: number;
  /** Entradas e saídas acumuladas do dia 1 até `hoje`, em reais. */
  entradas: number[];
  saidas: number[];
  /** Saídas previstas no fim do mês, em reais; `null` sem previsão (sem teto total). */
  previsaoSaidas: number | null;
  sobrou: string;
  eixo: { valor: number; rotulo: string }[];
  maximo: number;
  descricao: string;
}

/** Fluxo do mês, em reais acumulados por dia (setembro de 2026, hoje = dia 23). */
export const cashFlow: CashFlowData = {
  diasNoMes: 30,
  hoje: 23,
  /** Entradas acumuladas do dia 1 até hoje. */
  entradas: [
    0, 0, 0, 0, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 8200,
    8200, 8200, 8200, 8200, 8200,
  ],
  /** Saídas acumuladas do dia 1 até hoje. */
  saidas: [
    43, 129, 164, 286, 2386, 2450, 2664, 2707, 2743, 3057, 3114, 3207, 3386, 3629, 3686, 3707, 3779,
    3907, 4014, 4100, 4150, 4200, 5914,
  ],
  previsaoSaidas: 6050,
  sobrou: "R$ 2.287",
  eixo: [
    { valor: 0, rotulo: "0 mil" },
    { valor: 4500, rotulo: "4 mil" },
    { valor: 9000, rotulo: "9 mil" },
  ],
  maximo: 9000,
  descricao:
    "Entradas e saídas acumuladas em setembro. Entrou R$ 8.200 e saiu R$ 5.912 até hoje; sobraram R$ 2.287. Previsão de saídas no fim do mês: cerca de R$ 6.050.",
};

/** Soma acumulada: [1, 2, 3] → [1, 3, 6]. */
function accumulate(values: number[]) {
  let total = 0;
  return values.map((value) => (total += value));
}

const entradasDoAno = [7200, 7200, 7900, 7200, 7200, 8400, 7200, 7900, 8200];
const saidasDoAno = [6100, 5400, 6800, 5900, 6200, 7300, 5600, 6300, 5912];

/** Fluxo do ano, em reais acumulados por mês (2026, até setembro). */
export const cashFlowYear: CashFlowData = {
  periodo: "ano",
  diasNoMes: 12,
  hoje: 9,
  entradas: accumulate(entradasDoAno),
  saidas: accumulate(saidasDoAno),
  previsaoSaidas: null,
  sobrou: "R$ 12.888",
  eixo: [
    { valor: 0, rotulo: "0 mil" },
    { valor: 35000, rotulo: "35 mil" },
    { valor: 70000, rotulo: "70 mil" },
  ],
  maximo: 70000,
  descricao:
    "Entradas e saídas acumuladas em 2026. Entrou R$ 68.400 e saiu R$ 55.512 até hoje; sobraram R$ 12.888.",
};

export const summary = {
  saldo: "R$ 12.480,32",
  saldoRotulo: "Saldo em 2 bancos",
  linhas: [
    { id: "entradas", rotulo: "Entradas", valor: "R$ 8.200,00", variacao: "+4% vs agosto" },
    { id: "saidas", rotulo: "Saídas", valor: "R$ 5.912,47", variacao: "−6% vs agosto" },
    { id: "sobrou", rotulo: "Sobrou no mês", valor: "R$ 2.287,53", variacao: "+R$ 697 vs agosto" },
  ] as const,
};

export type PendingItem = {
  id: string;
  titulo: string;
  detalhe: string;
  origem: string;
  acao: string;
  href: string;
  urgente?: boolean;
};

/** "Precisa de você": o que o Guará separou para o usuário decidir. */
export const pendingItems: PendingItem[] = [
  {
    id: "compra-0214",
    titulo: "Compra de R$ 1.249,90 às 02:14",
    detalhe: "Loja de eletrônicos · 3,8x sua média",
    origem: "Lobo Guará · Fora do padrão",
    acao: "Revisar",
    href: "/alertas",
    urgente: true,
  },
  {
    id: "transporte-86",
    titulo: "Transporte chegou a 86% do teto",
    detalhe: "Faltam R$ 63,60 até o limite do mês",
    origem: "Lobo Guará · Gastos",
    acao: "Ver",
    href: "/gastos",
  },
  {
    id: "netflix",
    titulo: "Netflix subiu R$ 5,00",
    detalhe: "Próxima cobrança de R$ 44,90 em 8 de outubro",
    origem: "Lobo Guará · Gastos",
    acao: "Ver",
    href: "/assinaturas",
  },
];
