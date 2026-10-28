/**
 * Entradas do simulador como no design (estáticas até a API existir). As mesmas do app
 * (`apps/mobile/src/features/simulator/data.ts`): mexer aqui, mexer lá.
 */

/** As simulações começam em outubro de 2026 (primeiro depósito no dia 5, com o salário). */
export const START = { year: 2026, month: 9 } as const;

export const HOUSEHOLD = {
  /** Entradas de setembro. */
  income: 8200,
  /** Entradas menos saídas, média do mês. */
  surplus: 2287.53,
  profile: "Moderado",
  /** Carteira de investimentos ("Já investido"). */
  invested: 48310.9,
  /** Imóveis cadastrados (entram só se marcados). */
  properties: 698500,
} as const;

export const RETIREMENT_DEFAULTS = { years: 25, income: 10000, rate: 4, withdrawal: 4 } as const;

export const RETIREMENT_PROFILES = [
  { key: "conservative", label: "Conservador", rate: 3 },
  { key: "moderate", label: "Moderado", rate: 4 },
  { key: "bold", label: "Arrojado", rate: 5 },
] as const;

/** Degraus de "Marcos do caminho" (só os abaixo da meta aparecem). */
export const RETIREMENT_MILESTONES = [
  { value: 500_000, caption: "primeiro meio milhão" },
  { value: 1_000_000, caption: "primeiro milhão" },
  { value: 2_000_000, caption: "metade do caminho em valor" },
] as const;

export const RETIREMENT_INCLUDES = ["Previdência privada", "INSS estimado", "Imóveis"] as const;

export const GOAL_DEFAULTS = {
  name: "Viagem para o Japão",
  cost: 30000,
  months: 18,
  saved: 4000,
  place: "CDB 110% CDI",
} as const;

/** Onde guardar, com o rendimento líquido por mês (CDB 110% CDI: 0,9%; os outros, 100% do CDI). */
export const GOAL_PLACES = [
  { label: "CDB 110% CDI", monthlyRate: 0.009 },
  { label: "Tesouro Selic", monthlyRate: 0.0082 },
  { label: "Caixinha do banco", monthlyRate: 0.0082 },
] as const;

/** Depósito mensal da reserva de emergência (Onça), para somar com a viagem. */
export const RESERVE = {
  saved: 15892,
  target: 30000,
  monthly: 990,
  place: "Tesouro Selic",
} as const;

export const CUT_CATEGORIES = [
  { label: "Transporte por app", name: "transporte por app", average: 390 },
  { label: "Delivery", name: "delivery", average: null },
  { label: "Assinaturas", name: "assinaturas", average: null },
  { label: "Compras online", name: "compras online", average: null },
] as const;

export const CUT_DEFAULTS = {
  category: "Transporte por app",
  percent: 80,
  rate: 4,
  destination: "Aposentadoria",
} as const;

export const CUT_DESTINATIONS = ["Aposentadoria", "Viagem para o Japão", "Reserva"] as const;
