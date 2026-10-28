import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/lib/format/currency";

import {
  ANNUAL_DISCOUNT_PERCENT,
  annualFromMonthly,
  annualPerMonth,
  annualSavings,
  planById,
  plans,
} from "./planos";

describe("planos: mensal e anual", () => {
  it("o anual guardado segue a regra mensal × 12 com o desconto", () => {
    expect(ANNUAL_DISCOUNT_PERCENT).toBe(10);
    for (const plan of plans) expect(plan.anual).toBe(annualFromMonthly(plan.mensal));
  });

  it("preços, valor por mês e economia de cada plano", () => {
    const table = plans.map((p) => [p.id, p.mensal, p.anual, annualPerMonth(p), annualSavings(p)]);
    expect(table).toEqual([
      ["basic", 1790, 19332, 1611, 2148],
      ["plus", 4390, 47412, 3951, 5268],
      ["pro", 7690, 83052, 6921, 9228],
    ]);
  });

  it("formata em reais", () => {
    const basic = planById("basic");
    expect(formatCurrency(annualPerMonth(basic))).toMatch(/^R\$\s16,11$/);
    expect(formatCurrency(basic.anual)).toMatch(/^R\$\s193,32$/);
    expect(formatCurrency(annualSavings(basic))).toMatch(/^R\$\s21,48$/);
  });
});
