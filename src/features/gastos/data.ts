export type CategoryBudget = {
  id: string;
  nome: string;
  gasto: string;
  teto: string;
  percentual: number;
};

/** Gasto do mês contra o teto de cada categoria. */
export const categoryBudgets: CategoryBudget[] = [
  { id: "alimentacao", nome: "Alimentação", gasto: "R$ 742", teto: "R$ 1.000", percentual: 74 },
  { id: "transporte", nome: "Transporte", gasto: "R$ 386", teto: "R$ 450", percentual: 86 },
  { id: "lazer", nome: "Lazer", gasto: "R$ 120", teto: "R$ 400", percentual: 30 },
  { id: "assinaturas", nome: "Assinaturas", gasto: "R$ 102", teto: "R$ 150", percentual: 68 },
];

export type Transaction = {
  id: string;
  descricao: string;
  detalhe: string;
  valor: string;
  tipo: "saida" | "entrada";
  foraDoPadrao?: boolean;
};

export const recentTransactions: Transaction[] = [
  {
    id: "t1",
    descricao: "Loja de eletrônicos",
    detalhe: "Fora do padrão",
    valor: "−R$ 1.249,90",
    tipo: "saida",
    foraDoPadrao: true,
  },
  {
    id: "t2",
    descricao: "Padaria",
    detalhe: "Alimentação · Ontem",
    valor: "−R$ 18,40",
    tipo: "saida",
  },
  {
    id: "t3",
    descricao: "App de carro",
    detalhe: "Transporte · Ontem",
    valor: "−R$ 23,90",
    tipo: "saida",
  },
  {
    id: "t4",
    descricao: "Freela",
    detalhe: "Entrada · 18 set",
    valor: "+R$ 1.000,00",
    tipo: "entrada",
  },
];

/** Gasto acumulado por dia (R$): setembro até hoje (dia 23) e agosto completo. */
export const spendingPace = {
  hoje: 23,
  setembro: [
    62, 118, 171, 236, 2412, 2468, 2540, 2601, 2655, 3012, 3070, 3145, 3210, 3268, 3342, 3415, 3486,
    3560, 3640, 4378, 4455, 4590, 5912,
  ],
  agosto: [
    48, 101, 160, 210, 2385, 2440, 2505, 2570, 2630, 2960, 3030, 3095, 3170, 3240, 3320, 3390, 3455,
    3530, 3610, 4290, 4360, 4420, 4900, 4986, 5259, 5341, 5430, 5560, 5711, 6122, 6290,
  ],
  descricao:
    "Gasto acumulado dia a dia. Setembro: R$ 5.912 até o dia 23. Agosto, no mesmo dia: R$ 4.900; fechou em R$ 6.290.",
};

/** Total gasto por mês nos últimos 6 meses (setembro parcial, com previsão). */
export const monthlySpending = {
  meses: [
    { rotulo: "abr", nome: "Abr", valor: 5480 },
    { rotulo: "mai", nome: "Mai", valor: 5120 },
    { rotulo: "jun", nome: "Jun", valor: 5760 },
    { rotulo: "jul", nome: "Jul", valor: 6410 },
    { rotulo: "ago", nome: "Ago", valor: 6290 },
    { rotulo: "set", nome: "Set", valor: 5912 },
  ],
  previsao: 6050,
  media: 5812,
  descricao:
    "Gasto por mês: abril R$ 5.480, maio R$ 5.120, junho R$ 5.760, julho R$ 6.410, agosto R$ 6.290, setembro R$ 5.912 até o dia 23, previsão R$ 6.050. Média de abril a agosto R$ 5.812.",
};

/** Gasto médio por dia da semana (sem aluguel e compras acima de R$ 1.000). */
export const weekdaySpending = {
  dias: [
    { rotulo: "dom", nome: "Dom", valor: 138 },
    { rotulo: "seg", nome: "Seg", valor: 96 },
    { rotulo: "ter", nome: "Ter", valor: 84 },
    { rotulo: "qua", nome: "Qua", valor: 102 },
    { rotulo: "qui", nome: "Qui", valor: 118 },
    { rotulo: "sex", nome: "Sex", valor: 196 },
    { rotulo: "sáb", nome: "Sáb", valor: 214 },
  ],
  descricao:
    "Gasto médio por dia da semana: domingo R$ 138, segunda R$ 96, terça R$ 84, quarta R$ 102, quinta R$ 118, sexta R$ 196, sábado R$ 214.",
};

export type CategorySpending = {
  id: string;
  nome: string;
  lancamentos: number;
  percentual: number;
  valor: number;
  valorFormatado: string;
  cor: string;
};

/** Saídas do mês por categoria (as demais entram em "outros"). */
export const categorySpending: CategorySpending[] = [
  {
    id: "moradia",
    nome: "Moradia",
    lancamentos: 1,
    percentual: 36,
    valor: 2100,
    valorFormatado: "R$ 2.100,00",
    cor: "#6DB3EC",
  },
  {
    id: "eletronicos",
    nome: "Eletrônicos",
    lancamentos: 1,
    percentual: 21,
    valor: 1249.9,
    valorFormatado: "R$ 1.249,90",
    cor: "#FF6A50",
  },
  {
    id: "alimentacao",
    nome: "Alimentação",
    lancamentos: 31,
    percentual: 13,
    valor: 742.18,
    valorFormatado: "R$ 742,18",
    cor: "#F2C230",
  },
  {
    id: "transporte",
    nome: "Transporte",
    lancamentos: 22,
    percentual: 7,
    valor: 386.4,
    valorFormatado: "R$ 386,40",
    cor: "#6CC08E",
  },
  {
    id: "assinaturas",
    nome: "Assinaturas",
    lancamentos: 4,
    percentual: 2,
    valor: 101.6,
    valorFormatado: "R$ 101,60",
    cor: "#93A198",
  },
];

export const otherSpending = { valor: 1332.39, valorFormatado: "R$ 1.332,39", cor: "#34443B" };
export const totalSaidas = "R$ 5.912";

export type TetoMilestone = { percentual: number; rotulo: string; atingido: boolean };

export type TetoProgress = {
  id: string;
  categoria: string;
  gasto: string;
  teto: string;
  percentual: number;
  estado: "tranquilo" | "atenção" | "apertado";
  marcos: TetoMilestone[];
};

/** Tetos do mês com os marcos de aviso já disparados (✓). */
export const tetos: TetoProgress[] = [
  {
    id: "alimentacao",
    categoria: "Alimentação",
    gasto: "R$ 742",
    teto: "R$ 1.000",
    percentual: 74.2,
    estado: "atenção",
    marcos: [
      { percentual: 50, rotulo: "500", atingido: true },
      { percentual: 70, rotulo: "700", atingido: true },
      { percentual: 100, rotulo: "teto 1.000", atingido: false },
    ],
  },
  {
    id: "transporte",
    categoria: "Transporte",
    gasto: "R$ 386",
    teto: "R$ 450",
    percentual: 85.9,
    estado: "apertado",
    marcos: [
      { percentual: 66.67, rotulo: "300", atingido: true },
      { percentual: 100, rotulo: "teto 450", atingido: false },
    ],
  },
  {
    id: "lazer",
    categoria: "Lazer",
    gasto: "R$ 120",
    teto: "R$ 400",
    percentual: 30,
    estado: "tranquilo",
    marcos: [
      { percentual: 50, rotulo: "200", atingido: false },
      { percentual: 75, rotulo: "300", atingido: false },
      { percentual: 100, rotulo: "teto 400", atingido: false },
    ],
  },
];

export type SubscriptionSummary = { id: string; nome: string; proxima: string; valor: string };

export const activeSubscriptions: SubscriptionSummary[] = [
  { id: "spotify", nome: "Spotify", proxima: "próxima em 02/out", valor: "R$ 21,90" },
  { id: "netflix", nome: "Netflix", proxima: "próxima em 08/out", valor: "R$ 44,90" },
  { id: "amazon", nome: "Amazon Prime", proxima: "próxima em 12/out", valor: "R$ 19,90" },
  { id: "icloud", nome: "iCloud+", proxima: "próxima em 15/out", valor: "R$ 14,90" },
];

export type LedgerEntry = {
  id: string;
  descricao: string;
  /** Detalhe completo (desktop e tablet) e curto (mobile). */
  detalhe: string;
  detalheCurto: string;
  valor: string;
  tipo: "saida" | "entrada";
  foraDoPadrao?: boolean;
};

export const ledger: LedgerEntry[] = [
  {
    id: "l1",
    descricao: "Loja de eletrônicos online",
    detalhe: "Hoje, 02:14 · Nubank crédito · Eletrônicos",
    detalheCurto: "Hoje, 02:14 · Nubank crédito",
    valor: "−R$ 1.249,90",
    tipo: "saida",
    foraDoPadrao: true,
  },
  {
    id: "l2",
    descricao: "Padaria Central",
    detalhe: "Ontem · Itaú débito · Alimentação",
    detalheCurto: "Ontem · Itaú débito",
    valor: "−R$ 18,40",
    tipo: "saida",
  },
  {
    id: "l3",
    descricao: "Transporte por app",
    detalhe: "Ontem · Nubank crédito · Transporte",
    detalheCurto: "Ontem · Nubank crédito",
    valor: "−R$ 23,90",
    tipo: "saida",
  },
  {
    id: "l4",
    descricao: "Freela · site institucional",
    detalhe: "18 set · Pix recebido · Itaú · Entrada",
    detalheCurto: "18 set · Pix recebido",
    valor: "+R$ 1.000,00",
    tipo: "entrada",
  },
  {
    id: "l5",
    descricao: "Mercado do mês",
    detalhe: "10 set · Itaú débito · Alimentação",
    detalheCurto: "10 set · Itaú débito",
    valor: "−R$ 311,20",
    tipo: "saida",
  },
  {
    id: "l6",
    descricao: "Spotify",
    detalhe: "02 set · Nubank crédito · Assinaturas",
    detalheCurto: "02 set · assinatura",
    valor: "−R$ 21,90",
    tipo: "saida",
  },
];
