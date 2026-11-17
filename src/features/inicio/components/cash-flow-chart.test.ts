import { describe, expect, it } from "vitest";

import { axisTicks } from "./cash-flow-chart";

describe("marcas do eixo de entradas e saídas", () => {
  it("mês: dias 1, 10 e 20, hoje e o último dia", () => {
    expect(axisTicks("mes", 30, 23)).toEqual([1, 10, 20, 23, 30]);
  });

  it("ano: jan, abr, jul e out, o mês atual e dezembro, sem repetir", () => {
    expect(axisTicks("ano", 12, 11)).toEqual([1, 4, 7, 10, 11, 12]);
    expect(axisTicks("ano", 12, 4)).toEqual([1, 4, 7, 10, 12]);
  });
});
