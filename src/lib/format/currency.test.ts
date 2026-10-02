import { describe, expect, it } from "vitest";

import { formatCurrency } from "./currency";

// O Intl separa "R$" do número com espaço não separável (U+00A0).
const NBSP = " ";

describe("formatCurrency", () => {
  it("formata centavos inteiros em pt-BR", () => {
    expect(formatCurrency(123456)).toBe(`R$${NBSP}1.234,56`);
  });

  it("formata zero e valores menores que um real", () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
    expect(formatCurrency(5)).toBe(`R$${NBSP}0,05`);
    expect(formatCurrency(99)).toBe(`R$${NBSP}0,99`);
  });

  it("formata valores negativos", () => {
    expect(formatCurrency(-123456)).toBe(`-R$${NBSP}1.234,56`);
  });

  it("não perde precisão em valores altos (sem float)", () => {
    expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toBe(`R$${NBSP}90.071.992.547.409,91`);
  });

  it("retorna travessão para nulo ou indefinido", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("rejeita valores não inteiros", () => {
    expect(() => formatCurrency(12.5)).toThrow(RangeError);
    expect(() => formatCurrency(Number.NaN)).toThrow(RangeError);
  });
});
