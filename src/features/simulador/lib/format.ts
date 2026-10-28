const MINUS = "−";

const decimal = (value: number, digits: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Reais → "R$ 5.640" (sem centavos). */
export const reais = (value: number) =>
  `${value < 0 ? MINUS : ""}R$ ${decimal(Math.abs(Math.round(value)), 0)}`;

/** Reais com centavos → "R$ 2.287,53". */
export const reaisWithCents = (value: number) => `R$ ${decimal(value, 2)}`;

/** "R$ 1,74 mi", "R$ 3,0 mi", "R$ 1 mi" (digits = 0). */
export const millions = (value: number, digits = 2) =>
  `R$ ${decimal(value / 1_000_000, digits)} mi`;

/** "R$ 46 mil". */
export const thousands = (value: number) => `R$ ${decimal(value / 1000, 0)} mil`;

/** Valores grandes na forma mais curta: "R$ 500 mil", "R$ 1,29 mi". */
export const compact = (value: number, digits = 2) =>
  value >= 1_000_000 ? millions(value, digits) : thousands(value);

/** "R$ 3,0 milhões", "R$ 1,5 milhão", "R$ 800 mil". */
export function longAmount(value: number): string {
  if (value < 1_000_000) return thousands(value);
  const amount = millions(value, 1).replace(" mi", "");
  return `${amount} ${value < 2_000_000 ? "milhão" : "milhões"}`;
}

/** "−R$ 1.490" (ou "+R$ 1.490"). */
export const signedReais = (value: number) => `${value < 0 ? MINUS : "+"}${reais(Math.abs(value))}`;

/** "4,0% a.a." */
export const yearlyPercent = (value: number) => `${decimal(value, 1)}% a.a.`;

/** "R$ 48.310,90" → 48310.9 (campo de dinheiro digitado). */
export const parseMoney = (text: string) => Number(text.replace(/\D/g, "")) / 100;

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Mês `offset` meses depois de `start` ({ year, month 0–11 }) → "abr/28". */
export function shortMonth(start: { year: number; month: number }, offset: number): string {
  const index = start.month + offset;
  const year = start.year + Math.floor(index / 12);
  return `${MONTHS[((index % 12) + 12) % 12]}/${String(year).slice(-2)}`;
}

/** → "abril de 2028". */
export function longMonth(start: { year: number; month: number }, offset: number): string {
  const index = start.month + offset;
  const year = start.year + Math.floor(index / 12);
  return `${MONTH_NAMES[((index % 12) + 12) % 12]} de ${year}`;
}
