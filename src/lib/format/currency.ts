import type { Cents } from "@/types";

import { EMPTY_VALUE, isNil } from "./empty";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata centavos inteiros como moeda brasileira (ex.: 123456 => "R$ 1.234,56").
 *
 * O valor é convertido para uma string decimal exata usando BigInt, sem passar por
 * float, e só então entregue ao Intl.NumberFormat (que aceita strings decimais).
 * Observação: o Intl usa espaço não separável (U+00A0) entre "R$" e o número.
 */
export function formatCurrency(cents: Cents | null | undefined): string {
  if (isNil(cents)) return EMPTY_VALUE;
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(`formatCurrency espera centavos inteiros, recebeu: ${cents}`);
  }

  const value = BigInt(cents);
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const reais = abs / 100n;
  const centavos = (abs % 100n).toString().padStart(2, "0");
  const decimal = `${negative ? "-" : ""}${reais}.${centavos}`;

  // A tipagem do lib aceita apenas number | bigint, mas o Intl.NumberFormat v3 aceita
  // strings decimais exatas (suportado no Node 20+ e no Hermes).
  return brl.format(decimal as unknown as number);
}

/**
 * Formata um valor em reais (a unidade dos gráficos, que guardam reais para a escala) como moeda.
 * Converte para centavos inteiros antes: `2181.72 * 100` vira `218171.99999999997` em ponto
 * flutuante, e o `formatCurrency` exige centavos inteiros.
 */
export function formatReais(reais: number | null | undefined): string {
  if (isNil(reais)) return EMPTY_VALUE;
  return formatCurrency(Math.round(reais * 100) as Cents);
}
