/** Relatório de setembro (1 a 23), com todos os bancos. */

export const reportPeriod = {
  title: "O que aconteceu com seu dinheiro",
  range: "1 a 23 de setembro",
  scope: "todos os bancos",
};

export const periodOptions = [
  { value: "7d", label: "7 dias" },
  { value: "mes", label: "Este mês" },
  { value: "3m", label: "3 meses" },
  { value: "12m", label: "12 meses" },
];

export const exportFormats = [
  { id: "pdf", icon: "file", label: "PDF", detail: "O relatório como está na tela, com gráficos" },
  {
    id: "xlsx",
    icon: "grid",
    label: "Planilha Excel (.xlsx)",
    detail: "Resumo e todos os lançamentos do período",
  },
  {
    id: "csv",
    icon: "bar-chart",
    label: "CSV",
    detail: "Lançamentos em texto, para outras ferramentas",
  },
] as const;

export const totals = [
  { label: "Entrou", value: "R$ 8.200,00", tone: "arara" },
  { label: "Saiu", value: "R$ 5.912,47", tone: "sand" },
  { label: "Sobrou", value: "R$ 2.287,53", tone: "folha", note: "28% do que entrou" },
] as const;

/** Para onde foi o que saiu (valores em reais e participação). */
export const outflowBreakdown = [
  { label: "Moradia", value: 2100, percent: "36%", color: "var(--guara-arara)" },
  { label: "Eletrônicos", value: 1250, percent: "21%", color: "var(--guara-urucum)" },
  { label: "Alimentação", value: 742, percent: "13%", color: "var(--guara-tucano)" },
  { label: "Transporte", value: 386, percent: "7%", color: "var(--guara-folha)" },
  { label: "Outros", value: 1434, percent: "24%", color: "var(--guara-caption)" },
];

export type ChartEvent = { day: number; label: string; tone: "arara" | "urucum"; labelRow: 0 | 1 };

export const dailyBalance = {
  daysInMonth: 30,
  today: 23,
  /** Saldo no fim de cada dia, do dia 1 até hoje. */
  values: [
    10190, 10150, 10110, 10060, 15120, 15060, 14990, 14930, 14880, 14520, 14470, 14410, 14350,
    14300, 14240, 14170, 14100, 15060, 14620, 14480, 14320, 13730, 12480,
  ],
  /** Projeção de hoje até o dia 30. */
  projection: [12480, 12400, 12330, 12250, 12170, 12080, 11990, 11900],
  events: [
    { day: 5, label: "Salário e aluguel", tone: "arara", labelRow: 0 },
    { day: 18, label: "Freela", tone: "arara", labelRow: 1 },
    { day: 23, label: "Eletrônicos", tone: "urucum", labelRow: 0 },
  ] satisfies ChartEvent[],
  axisDays: [1, 5, 10, 15, 20, 30],
  label:
    "Saldo de setembro: começou em R$ 10,2 mil, subiu para cerca de R$ 15,1 mil no dia 5 com o salário, desceu aos poucos e está em R$ 12,5 mil hoje. Projeção: R$ 11,9 mil no dia 30.",
};

export const weeklyFlow = {
  weeks: [
    { label: "1 a 7 set", short: "1–7", entrou: 7200, saiu: 2350 },
    { label: "8 a 14 set", short: "8–14", entrou: 0, saiu: 1010 },
    { label: "15 a 21 set", short: "15–21", entrou: 1000, saiu: 780 },
    { label: "22 a 23 set*", short: "22–23*", entrou: 0, saiu: 1772 },
  ],
  label:
    "Entradas e saídas por semana: semana 1 entrou R$ 7.200 e saiu R$ 2.350; semana 2 saiu R$ 1.010; semana 3 entrou R$ 1.000 e saiu R$ 780; dias 22 e 23 saiu R$ 1.772.",
};

export type TimelineEntry = {
  date: string;
  title: string;
  detail: string;
  amount: string;
  tone: "urucum" | "arara" | "neutral";
  outlier?: boolean;
};

export const timeline: TimelineEntry[] = [
  {
    date: "23 set",
    title: "Loja de eletrônicos online",
    detail: "Nubank crédito · 02:14",
    amount: "−R$ 1.249,90",
    tone: "urucum",
    outlier: true,
  },
  {
    date: "18 set",
    title: "Freela · site institucional",
    detail: "Pix recebido · Itaú",
    amount: "+R$ 1.000,00",
    tone: "arara",
  },
  {
    date: "10 set",
    title: "Mercado do mês",
    detail: "Itaú débito",
    amount: "−R$ 311,20",
    tone: "neutral",
  },
  {
    date: "05 set",
    title: "Aluguel",
    detail: "Pix enviado · Itaú",
    amount: "−R$ 2.100,00",
    tone: "neutral",
  },
  {
    date: "05 set",
    title: "Salário",
    detail: "Crédito em conta · Itaú",
    amount: "+R$ 7.200,00",
    tone: "arara",
  },
];

export const categoryComparison = [
  {
    label: "Alimentação",
    detail: "R$ 742 contra R$ 662",
    change: "+12%",
    icon: "arrow-up",
    tone: "urucum",
  },
  {
    label: "Transporte",
    detail: "R$ 386 contra R$ 420",
    change: "−8%",
    icon: "arrow-down",
    tone: "folha",
  },
  {
    label: "Eletrônicos",
    detail: "Não houve gasto em agosto",
    change: "novo",
    icon: "info-lg",
    tone: "tucano",
  },
  {
    label: "Moradia",
    detail: "R$ 2.100 nos dois meses",
    change: "igual",
    icon: "check",
    tone: "caption",
  },
] as const;

export const monthComparison = [
  {
    label: "Entradas",
    change: "+14%",
    tone: "folha",
    color: "var(--guara-arara)",
    current: { value: "R$ 8.200", width: 100 },
    previous: { value: "R$ 7.200", width: 88 },
  },
  {
    label: "Saídas",
    change: "+21%",
    tone: "urucum",
    color: "var(--guara-urucum)",
    current: { value: "R$ 5.912", width: 100 },
    previous: { value: "R$ 4.900", width: 83 },
  },
] as const;
