import type { IconName } from "@/components/ui/icon";

/** Metas acompanhadas pela Onça (reserva, viagem e aposentadoria). */

export type GoalTone = "folha" | "arara" | "tucano";

export type Goal = {
  id: string;
  nome: string;
  onde: string;
  icone: IconName;
  iconeTom: "arara" | "neutro";
  status: { texto: string; tom: GoalTone };
  guardado: string;
  alvo: string;
  percentual: number;
  mensal: string;
  previsao: string;
  /** Tem tela de detalhe. */
  detalhe?: boolean;
};

export const goals: Goal[] = [
  {
    id: "reserva",
    nome: "Reserva de emergência",
    onde: "Tesouro Selic 2029 · Itaú",
    icone: "shield-check",
    iconeTom: "arara",
    status: { texto: "No ritmo", tom: "folha" },
    guardado: "R$ 15.892",
    alvo: "R$ 30.000",
    percentual: 53,
    mensal: "R$ 990/mês",
    previsao: "previsão set/2027",
    detalhe: true,
  },
  {
    id: "japao",
    nome: "Viagem para o Japão",
    onde: "CDB 110% CDI · Nubank",
    icone: "target",
    iconeTom: "arara",
    status: { texto: "Começa em 5/10", tom: "arara" },
    guardado: "R$ 4.000",
    alvo: "R$ 30.000",
    percentual: 13,
    mensal: "R$ 1.310/mês",
    previsao: "abril de 2028",
  },
  {
    id: "aposentadoria",
    nome: "Aposentadoria",
    onde: "Carteira de investimentos",
    icone: "loader",
    iconeTom: "neutro",
    status: { texto: "Acima do que sobra", tom: "tucano" },
    guardado: "R$ 0",
    alvo: "R$ 3,0 milhões",
    percentual: 0,
    mensal: "R$ 5.640/mês",
    previsao: "2051 · aos 55 anos",
  },
];

export const goalsSummary = {
  guardado: "R$ 19.892",
  mensal: "R$ 2.300/mês",
  sobrou: "sem a aposentadoria · sobrou R$ 2.287,53 em setembro",
  dica: "A reserva está no ritmo: mais R$ 990 em 5/10 e você passa de 56%. A viagem começa no mesmo dia. A aposentadoria pede mais do que sobra hoje; quer ver onde ajustar?",
};

/** Detalhe da Reserva de emergência. */
export const goalDetail = {
  id: "reserva",
  criada: "Acompanhada pela Onça · criada em mar/2025",
  faltam: "R$ 14.108",
  completa: "set/2027",
  dica: "Se você mandar os R$ 312 do corte no transporte por app para cá, a reserva fica pronta em jul/2027, 2 meses antes.",
  saldo: {
    rotulo: "Saldo da reserva: abril R$ 11,6 mil a setembro R$ 15,9 mil",
    meses: [
      { label: "abr", value: 11.6, display: "11,6 mil" },
      { label: "mai", value: 12.7, display: "12,7 mil" },
      { label: "jun", value: 12.6, display: "12,6 mil" },
      { label: "jul", value: 13.8, display: "13,8 mil" },
      { label: "ago", value: 14.9, display: "14,9 mil" },
      { label: "set", value: 15.9, display: "15,9 mil" },
    ],
    nota: "Junho caiu por um resgate de R$ 1.200 para o conserto do carro. É para isso que a reserva existe.",
  },
  marcos: [
    { titulo: "25% · R$ 7.500", nota: "Chegou em nov/2025", feito: true },
    { titulo: "50% · R$ 15.000", nota: "Chegou em set/2026", feito: true },
    { titulo: "75% · R$ 22.500", nota: "Previsto para mar/2027", feito: false },
    {
      titulo: "100% · R$ 30.000",
      nota: "Previsto para set/2027 · 6 meses do seu custo de vida",
      feito: false,
      final: true,
    },
  ],
  movimentos: [
    { titulo: "Depósito mensal", data: "05/09/2026", valor: "+R$ 990,00" },
    { titulo: "Rendimento de agosto", data: "31/08/2026", valor: "+R$ 141,30" },
    { titulo: "Depósito mensal", data: "05/08/2026", valor: "+R$ 990,00" },
    { titulo: "Rendimento de julho", data: "31/07/2026", valor: "+R$ 132,80" },
    { titulo: "Depósito mensal", data: "05/07/2026", valor: "+R$ 990,00" },
    { titulo: "Resgate · conserto do carro", data: "20/06/2026", valor: "−R$ 1.200,00" },
  ],
  ajustes: [
    { label: "Onde está guardado", value: "Tesouro Selic 2029 · Itaú" },
    { label: "Depósito mensal", value: "R$ 990 todo dia 5" },
    { label: "Valor da meta", value: "R$ 30.000 · 6 meses de custo de vida" },
    { label: "Previsão", value: "set/2027, com o rendimento" },
  ],
};

/** Nova meta a partir da simulação "Juntar para um objetivo". */
export const goalDraft = {
  nome: "Viagem para o Japão",
  valor: "R$ 30.000,00",
  valorDica: "Passagens, hospedagem e passeios para 2 pessoas",
  prazo: "18 meses · abril de 2028",
  guardado: "R$ 4.000,00",
  guardadoDica: "Separado no CDB 110% CDI",
  onde: [
    {
      titulo: "CDB 110% CDI · Nubank",
      texto: "Rende cerca de 0,9% ao mês · já tem R$ 4.000 separados",
    },
    { titulo: "Tesouro Selic 2029 · Itaú", texto: "Usado pela Reserva de emergência" },
    { titulo: "Caixinha do banco", texto: "Resgate na hora, rende um pouco menos" },
  ],
  mensal: "R$ 1.310,00",
  mensalDica: "Calculado para chegar no prazo. Equivale a 57% do que sobrou em setembro.",
  dia: "Todo dia 5, junto com o salário",
  previa: {
    rotulo: "Prévia da meta: de R$ 4.000 em outubro de 2026 a R$ 30.000 em abril de 2028",
    comRendimento: [4, 5.41, 9.49, 13.71, 17.99, 22.4, 26.81, 30.01],
    soDepositos: [4, 5.3, 9.24, 13.16, 17.1, 21.02, 24.97, 27.59],
    meses: [
      { index: 0, label: "out/26" },
      { index: 2, label: "jan/27" },
      { index: 4, label: "jun/27" },
      { index: 6, label: "dez/27" },
      { index: 7, label: "abr/28" },
    ],
    resumo: [
      { label: "Falta juntar", value: "R$ 26.000" },
      { label: "Depósitos", value: "18 de R$ 1.310" },
      { label: "Primeiro depósito", value: "5 de outubro" },
      { label: "Chega em", value: "abril de 2028" },
    ],
  },
};
