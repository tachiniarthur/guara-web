import { axisFit, axisIndexes, gridTicks } from "./components/charts";
import { portfolio } from "./data";
import { toPerformance, type Evolution } from "./live";
import { emptyPerformance, prototypePerformance, withPerformance } from "./performance";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));

const point = (date: string, returnPct: number, cdiPct: number | null = null) => ({
  date,
  valueCents: 100_000,
  returnPct,
  cdiPct,
});

describe("Rentabilidade por período (API)", () => {
  it("6 meses: os 6 últimos meses (o último ponto de cada) e o card do período", () => {
    const evolution: Evolution = {
      period: "6m",
      returnPct: 4.2,
      cdiPct: 5.1,
      points: [
        point("2026-05-17", 0, 0),
        point("2026-05-31", 0.5, 0.4),
        point("2026-06-30", 1, 1.2),
        point("2026-07-31", 1.5, 2),
        point("2026-08-31", 2, 2.9),
        point("2026-09-30", 3, 3.8),
        point("2026-10-31", 3.8, 4.6),
        point("2026-11-16", 4.2, 5.1),
      ],
    };
    const perf = plain(toPerformance(evolution, "6m"));
    expect(perf.rentabilidade.rotulos).toEqual(["jun", "jul", "ago", "set", "out", "nov"]);
    expect(perf.rentabilidade.carteira).toEqual([1, 1.5, 2, 3, 3.8, 4.2]);
    expect(perf.rentabilidade.periodo).toBe("6m");
    expect(perf.rent).toEqual({
      id: "rent",
      rotulo: "Rentabilidade em 6 meses",
      valor: "+4,2%",
      detalhe: "CDI no período: +5,1%",
      ganho: true,
    });
  });

  it("desde o início: todos os meses, com o ano quando passa de um ano", () => {
    const evolution: Evolution = {
      returnPct: -2,
      cdiPct: null,
      points: [
        point("2025-09-10", 0),
        point("2025-12-31", 1),
        point("2026-06-30", -1),
        point("2026-11-16", -2),
      ],
    };
    const perf = plain(toPerformance(evolution, "all"));
    expect(perf.rentabilidade.rotulos).toEqual(["set/25", "dez/25", "jun/26", "nov/26"]);
    expect(perf.rent).toMatchObject({
      rotulo: "Rentabilidade desde o início",
      valor: "−2%",
      detalhe: "CDI no período: —",
      ganho: false,
    });
  });

  it("o rótulo segue o período que veio na resposta (a curva anterior, enquanto carrega)", () => {
    const evolution: Evolution = { period: "12m", returnPct: 1, cdiPct: null, points: [] };
    expect(toPerformance(evolution, "6m").rent.rotulo).toBe("Rentabilidade em 12 meses");
  });

  it("período que não veio: sem curva e card com travessão", () => {
    const merged = withPerformance(portfolio, emptyPerformance("all"));
    expect(merged.rentabilidade.carteira).toEqual([]);
    expect(merged.stats[0]).toMatchObject({ rotulo: "Rentabilidade desde o início", valor: "—" });
    expect(merged.stats.slice(1)).toEqual(portfolio.stats.slice(1));
  });
});

describe("Rentabilidade por período (protótipo)", () => {
  it("12M é a série do design", () => {
    const perf = prototypePerformance(portfolio, "12m");
    expect(perf.rentabilidade.carteira).toEqual(portfolio.rentabilidade.carteira);
    expect(perf.rent).toMatchObject({ valor: "+11,1%", detalhe: "CDI no período: +9,9%" });
  });

  it("6M recomeça do zero em março", () => {
    const perf = prototypePerformance(portfolio, "6m");
    expect(perf.rentabilidade.rotulos).toEqual(["mar", "abr", "mai", "jun", "jul", "ago", "set"]);
    expect(perf.rentabilidade.carteira[0]).toBe(0);
    expect(perf.rentabilidade.carteira.at(-1)).toBe(8.1);
    expect(perf.rent).toMatchObject({ rotulo: "Rentabilidade em 6 meses", valor: "+8,1%" });
  });

  it("Tudo junta o ano anterior ao do design (24 meses)", () => {
    const perf = prototypePerformance(portfolio, "all");
    expect(perf.rentabilidade.carteira).toHaveLength(24);
    expect(perf.rentabilidade.rotulos?.[0]).toBe("out/24");
    expect(perf.rentabilidade.rotulos?.at(-1)).toBe("set/26");
    expect(perf.rentabilidade.carteira.at(-1)).toBe(21.1);
  });
});

describe("Eixo e grade do gráfico de rentabilidade", () => {
  it("até 7 rótulos, sempre com o último mês", () => {
    expect(axisIndexes(12)).toEqual([1, 3, 5, 7, 9, 11]);
    expect(axisIndexes(13)).toEqual([0, 2, 4, 6, 8, 10, 12]);
    expect(axisIndexes(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(axisIndexes(6)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(axisIndexes(24)).toEqual([3, 7, 11, 15, 19, 23]);
    expect(axisIndexes(1)).toEqual([0]);
    expect(axisIndexes(0)).toEqual([]);
  });

  it("rótulos com ano ficam em menos posições no celular (sem encostar)", () => {
    const months = [
      "out",
      "nov",
      "dez",
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
    ];
    expect(axisFit(months, 11, 300)).toBe(7);
    const withYear = months.map((m) => `${m}/25`);
    expect(axisFit(withYear, 11, 300)).toBe(5);
    expect(axisFit(withYear, 8.5, 540)).toBe(7);
    expect(axisIndexes(24, axisFit(withYear, 11, 300))).toEqual([3, 8, 13, 18, 23]);
  });

  it("grade em passo redondo dentro da escala", () => {
    expect(gridTicks(0, 12)).toEqual([0, 5, 10]);
    expect(gridTicks(-3, 40)).toEqual([0, 20, 40]);
    expect(gridTicks(-8, 12)).toEqual([-5, 0, 5, 10]);
  });
});
