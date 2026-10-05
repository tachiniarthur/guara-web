/** Projeções com juros compostos mensais (taxa anual efetiva convertida para o mês). */

export const monthlyRate = (annual: number) => (1 + annual) ** (1 / 12) - 1;

/** Valor acumulado após `months` meses: saldo inicial rendendo + depósitos mensais rendendo. */
export function futureValue(initial: number, deposit: number, rate: number, months: number) {
  const growth = (1 + rate) ** months;
  return initial * growth + (rate === 0 ? deposit * months : deposit * ((growth - 1) / rate));
}

export type ProjectionSeries = {
  /** Com rendimento. */
  projected: number[];
  /** Só o que foi depositado. */
  deposited: number[];
};

/** Série em `points` pontos, um a cada `step` meses. */
export function project({
  initial,
  deposit,
  rate,
  points,
  step,
}: {
  initial: number;
  deposit: number;
  rate: number;
  points: number;
  step: number;
}): ProjectionSeries {
  const months = Array.from({ length: points }, (_, i) => i * step);
  return {
    projected: months.map((m) => futureValue(initial, deposit, rate, m)),
    deposited: months.map((m) => initial + deposit * m),
  };
}
