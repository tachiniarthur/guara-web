import { describe, expect, it } from "vitest";

import { formatMoney, formatUsd, formatCurrency, formatReais } from "./currency";

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

describe("formatReais", () => {
  it("arredonda para centavos antes de formatar (2181,72 × 100 não é inteiro em ponto flutuante)", () => {
    expect(2181.72 * 100).not.toBe(218172);
    expect(formatReais(2181.72).replace(/\s/g, " ")).toBe("R$ 2.181,72");
    expect(formatReais(null)).toBe("—");
  });
});

describe("formatUsd / formatMoney", () => {
  const plain = (text: string) => text.replace(/ /g, " ");

  it("dólar no formato brasileiro, sem float", () => {
    expect(plain(formatUsd("350.79"))).toBe("US$ 350,79");
    expect(plain(formatUsd("1234567.8"))).toBe("US$ 1.234.567,80");
    expect(formatUsd(null)).toBe("—");
    expect(formatUsd("abc")).toBe("—");
  });

  it("centavos na moeda do ativo", () => {
    expect(plain(formatMoney(30000, "USD"))).toBe("US$ 300,00");
    expect(plain(formatMoney(5800, "BRL"))).toBe("R$ 58,00");
    expect(formatMoney(null, "USD")).toBe("—");
  });
});
