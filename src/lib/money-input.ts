/**
 * Leitura do que a pessoa digita em campos de valor e quantidade, no formato brasileiro
 * ("1.234,56", "R$ 650.000", "US$ 300,5"), sem passar por float. TS puro.
 */

/** Texto digitado → decimal com ponto ("1234.56"). Vazio ou inválido: `null`. */
export function parseDecimalInput(text: string): string | null {
  const cleaned = text.replace(/[^\d.,-]/g, "");
  if (cleaned === "" || cleaned.startsWith("-")) return null;
  // Vírgula é o decimal; pontos são milhar. Sem vírgula, ponto único com até 2 casas no fim
  // também vale como decimal ("300.5"), mas "1.000" é milhar.
  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+\.\d{1,2}$/.test(cleaned) && !/^\d{1,3}\.\d{3}$/.test(cleaned)) {
    normalized = cleaned;
  } else {
    normalized = cleaned.replace(/\./g, "");
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const [int, frac] = normalized.split(".") as [string, string | undefined];
  const trimmedInt = int.replace(/^0+(?=\d)/, "");
  return frac === undefined ? trimmedInt : `${trimmedInt}.${frac}`;
}

/** Decimal com ponto → centavos inteiros (arredonda meio para cima na 3ª casa). */
export function decimalToCents(decimal: string): number {
  const [int, frac = ""] = decimal.split(".") as [string, string | undefined];
  const padded = `${frac}000`;
  let cents = BigInt(int) * 100n + BigInt(padded.slice(0, 2));
  if (Number(padded[2]) >= 5) cents += 1n;
  return Number(cents);
}

/** Texto digitado → centavos. Vazio, inválido ou zero: `null`. */
export function parseMoneyInput(text: string): number | null {
  const decimal = parseDecimalInput(text);
  if (decimal === null) return null;
  const cents = decimalToCents(decimal);
  return cents > 0 ? cents : null;
}

/** Centavos → decimal com ponto e 2 casas ("300.00"), como a API recebe valores em US$. */
export function centsToDecimal(cents: number): string {
  const value = BigInt(cents);
  return `${value / 100n}.${(value % 100n).toString().padStart(2, "0")}`;
}

/** Quantidade decimal ("2.5") × centavos, exato e arredondado no fim (meio para cima). */
export function multiplyDecimalByCents(quantity: string, cents: number): number {
  const [int, frac = ""] = quantity.split(".") as [string, string | undefined];
  const scale = 10n ** BigInt(frac.length);
  const product = BigInt(`${int}${frac}`) * BigInt(cents);
  const rounded = (product * 2n + scale) / (scale * 2n);
  return Number(rounded);
}
