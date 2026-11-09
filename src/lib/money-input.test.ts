import { describe, expect, it } from "vitest";

import {
  centsToDecimal,
  multiplyDecimalByCents,
  parseDecimalInput,
  parseMoneyInput,
} from "./money-input";

describe("parseDecimalInput", () => {
  it("formato brasileiro, com ou sem símbolo", () => {
    expect(parseDecimalInput("1.234,56")).toBe("1234.56");
    expect(parseDecimalInput("R$ 650.000,00")).toBe("650000.00");
    expect(parseDecimalInput("US$ 300,5")).toBe("300.5");
    expect(parseDecimalInput("200")).toBe("200");
    expect(parseDecimalInput("0,00012345")).toBe("0.00012345");
  });

  it("ponto: decimal com até 2 casas, milhar com 3", () => {
    expect(parseDecimalInput("300.5")).toBe("300.5");
    expect(parseDecimalInput("1.000")).toBe("1000");
    expect(parseDecimalInput("1.000.000")).toBe("1000000");
  });

  it("vazio, negativo ou lixo: null", () => {
    expect(parseDecimalInput("")).toBeNull();
    expect(parseDecimalInput("-5")).toBeNull();
    expect(parseDecimalInput("abc")).toBeNull();
    expect(parseDecimalInput("1,2,3")).toBeNull();
  });
});

describe("parseMoneyInput / centsToDecimal", () => {
  it("centavos sem float", () => {
    expect(parseMoneyInput("R$ 0,10")).toBe(10);
    expect(parseMoneyInput("1.234,565")).toBe(123457);
    expect(parseMoneyInput("0")).toBeNull();
    expect(centsToDecimal(30000)).toBe("300.00");
    expect(centsToDecimal(5)).toBe("0.05");
  });
});

describe("multiplyDecimalByCents", () => {
  it("quantidade fracionária sem float", () => {
    expect(multiplyDecimalByCents("2", 35079)).toBe(70158);
    expect(multiplyDecimalByCents("0.1", 3)).toBe(0);
    expect(multiplyDecimalByCents("0.5", 3)).toBe(2);
    expect(multiplyDecimalByCents("1.00012345", 10000)).toBe(10001);
  });
});
