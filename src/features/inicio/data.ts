import type { AgentId } from "@/features/assistentes/data";

/** Fluxo do mês, em reais acumulados por dia (setembro de 2026, hoje = dia 23). */
export const cashFlow = {
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
  agent: AgentId;
  titulo: string;
  detalhe: string;
  origem: string;
  acao: string;
  href: string;
  urgente?: boolean;
};

/** "Precisa de você": o que a turma separou para o usuário decidir. */
export const pendingItems: PendingItem[] = [
  {
    id: "compra-0214",
    agent: "quero-quero",
    titulo: "Compra de R$ 1.249,90 às 02:14",
    detalhe: "Loja de eletrônicos · 3,8x sua média",
    origem: "Quero-quero · Fora do padrão",
    acao: "Revisar",
    href: "/alertas",
    urgente: true,
  },
  {
    id: "transporte-86",
    agent: "tamandua",
    titulo: "Transporte chegou a 86% do teto",
    detalhe: "Faltam R$ 63,60 até o limite do mês",
    origem: "Tamanduá · Gastos",
    acao: "Ver",
    href: "/gastos",
  },
  {
    id: "netflix",
    agent: "tamandua",
    titulo: "Netflix subiu R$ 5,00",
    detalhe: "Próxima cobrança de R$ 44,90 em 8 de outubro",
    origem: "Tamanduá · Gastos",
    acao: "Ver",
    href: "/assinaturas",
  },
];
