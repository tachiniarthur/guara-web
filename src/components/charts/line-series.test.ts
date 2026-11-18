import { axisPicks, niceScale, niceStep } from "./line-series";

describe("escala da linha (LineSeries)", () => {
  it("passo redondo pelo tamanho do intervalo", () => {
    expect(niceStep(30, 40)).toBe(2.5);
    expect(niceStep(0, 300_000)).toBe(100_000);
    expect(niceStep(0.1, 0.5)).toBe(0.1);
  });

  it("a escala cobre o dado e começa e termina num passo", () => {
    const scale = niceScale([31.2, 38.9, 35]);
    expect(scale.min).toBeLessThanOrEqual(31.2);
    expect(scale.max).toBeGreaterThanOrEqual(38.9);
    expect(scale.ticks[0]).toBe(scale.min);
    expect(scale.ticks.at(-1)).toBe(scale.max);
  });

  it("série constante não vira escala de tamanho zero", () => {
    const scale = niceScale([50, 50, 50]);
    expect(scale.max).toBeGreaterThan(scale.min);
  });

  it("decimais sem resto de ponto flutuante", () => {
    expect(niceScale([0.1, 0.32]).ticks).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it("rótulos do eixo em passo fixo, sempre com o último", () => {
    expect(axisPicks(10, 4)).toEqual([0, 3, 6, 9]);
    expect(axisPicks(10, 4).at(-1)).toBe(9);
    expect(axisPicks(10, 4).length).toBeLessThanOrEqual(4);
    expect(axisPicks(1, 4)).toEqual([0]);
  });
});
