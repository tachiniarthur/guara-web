/**
 * CPF: só dígitos (11) em tudo que trafega e é guardado; a máscara `123.456.789-09` existe só
 * para digitar e exibir.
 */

/** Só os dígitos de um texto ("529.982.247-25" → "52998224725"). */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Dígito verificador (módulo 11) dos `length` primeiros dígitos de `base`. */
function checkDigit(base: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i += 1) sum += Number(base[i]) * (length + 1 - i);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** 11 dígitos com os verificadores certos; "111.111.111-11" e afins não valem. Aceita a máscara. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  return (
    checkDigit(digits, 9) === Number(digits[9]) && checkDigit(digits, 10) === Number(digits[10])
  );
}

/**
 * Máscara enquanto a pessoa digita: "52998" → "529.98", "52998224725" → "529.982.247-25".
 * Ignora o que não for dígito e corta depois do 11º.
 */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
