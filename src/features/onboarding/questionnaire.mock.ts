import type { Questionnaire } from "./questionnaire";

/** Questionário no formato da API, só para os testes (3 perguntas, 3 perfis). */
export const questionnaireMock: Questionnaire = {
  version: "teste-1",
  provisional: true,
  questions: [
    {
      id: "goal",
      label: "Qual é o seu principal objetivo ao investir?",
      summary: "Objetivo",
      why: "O objetivo define quanto risco faz sentido.",
      options: [
        { id: "protect", label: "Proteger o que já tenho", short: "Proteger o que já tem" },
        { id: "growth", label: "Fazer o patrimônio crescer", short: "Crescer no longo prazo" },
      ],
    },
    {
      id: "horizon",
      label: "Por quanto tempo você pretende deixar o dinheiro investido?",
      summary: "Prazo",
      why: "Prazos longos aguentam mais oscilação.",
      options: [
        { id: "lt_1y", label: "Menos de 1 ano", short: "Menos de 1 ano" },
        { id: "3_10y", label: "De 3 a 10 anos", short: "3 a 10 anos" },
      ],
    },
    {
      id: "drawdown",
      label: "Se seus investimentos caíssem 15% em um mês, o que você faria?",
      summary: "Queda de 15%",
      why: "Mostra quanta oscilação você aguenta.",
      options: [
        { id: "sell_all", label: "Venderia tudo", short: "Venderia tudo" },
        { id: "hold", label: "Manteria e esperaria", short: "Manteria e esperaria" },
      ],
    },
  ],
  profiles: [
    {
      profile: "conservative",
      label: "Conservador",
      description: "Prioriza a segurança e a liquidez.",
      targetAllocation: [
        { assetClass: "fixed_income", label: "Renda fixa", targetPct: 80 },
        { assetClass: "equities", label: "Renda variável", targetPct: 10 },
        { assetClass: "real_estate", label: "Imobiliário", targetPct: 10 },
        { assetClass: "alternatives", label: "Alternativos", targetPct: 0 },
      ],
    },
    {
      profile: "moderate",
      label: "Moderado",
      description: "Busca equilíbrio entre segurança e crescimento.",
      targetAllocation: [
        { assetClass: "fixed_income", label: "Renda fixa", targetPct: 50 },
        { assetClass: "equities", label: "Renda variável", targetPct: 30 },
        { assetClass: "real_estate", label: "Imobiliário", targetPct: 15 },
        { assetClass: "alternatives", label: "Alternativos", targetPct: 5 },
      ],
    },
    {
      profile: "aggressive",
      label: "Arrojado",
      description: "Aceita oscilações maiores em busca de mais retorno.",
      targetAllocation: [
        { assetClass: "fixed_income", label: "Renda fixa", targetPct: 25 },
        { assetClass: "equities", label: "Renda variável", targetPct: 50 },
        { assetClass: "real_estate", label: "Imobiliário", targetPct: 15 },
        { assetClass: "alternatives", label: "Alternativos", targetPct: 10 },
      ],
    },
  ],
};
