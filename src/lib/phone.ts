/**
 * Celular: o campo guarda só os dígitos com DDD (11); a API recebe em E.164 (`+5511987654321`) e a
 * máscara `(11) 98765-4321` existe só para digitar e exibir.
 */
import { onlyDigits } from "./cpf";

/** DDDs em uso no Brasil (Anatel). */
const BR_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/**
 * O que está errado no celular digitado (com ou sem máscara), em pt-BR, ou `null` se ele vale.
 */
export function phoneProblem(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return "Informe o celular com DDD.";
  if (digits.length < 11) return "Faltam números: o celular tem DDD e 9 dígitos.";
  if (!BR_DDDS.has(Number(digits.slice(0, 2)))) return "Esse DDD não existe. Confira os números.";
  if (digits[2] !== "9") return "Informe um celular: o número começa com 9.";
  return null;
}

/** Máscara enquanto a pessoa digita: "1198765" → "(11) 98765", "11987654321" → "(11) 98765-4321". */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Os 11 dígitos no formato da API: "11987654321" → "+5511987654321". */
export const toE164 = (digits: string): string => `+55${onlyDigits(digits)}`;
