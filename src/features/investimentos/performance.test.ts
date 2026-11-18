import { axisFit, axisIndexes, gridTicks } from "./components/charts";
import { toPerformance, type Evolution } from "./live";
import { emptyPerformance, withPerformance } from "./performance";
import type { PortfolioData } from "./types";

const portfolio: PortfolioData = {
  patrimonio: "R$ 10.000,00",
  variacaoMes: "",
  totalComBens: "R$ 10.000,00",
  investido: "R$ 10.000,00",
  bens: "R$ 0",
  atualizacao: "",
  outras: { quantidade: 0, total: "R$ 0,00", percentual: "0%" },
  rentabilidade: { carteira: [0, 1], cdi: [0, 1], rotulos: ["out", "nov"] },
  stats: [
    { id: "rent", rotulo: "Rentabilidade em 12 meses", valor: "+1%", detalhe: "" },
    { id: "aportes", rotulo: "Aportes em 2026", valor: "R$ 1.000", detalhe: "" },
  ],
};

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

describe("eixos do gráfico de rentabilidade", () => {
  it("até 7 rótulos, sempre com o último ponto", () => {
    expect(axisIndexes(12)).toEqual([1, 3, 5, 7, 9, 11]);
    expect(axisIndexes(3)).toEqual([0, 1, 2]);
  });

  it("quantos rótulos cabem sem encostar (entre 2 e 7)", () => {
    expect(axisFit(["nov/25", "dez/25"], 12, 600)).toBe(7);
    expect(axisFit(["nov/25", "dez/25"], 12, 40)).toBe(2);
  });

  it("grade em passo redondo, com escala negativa sem -0", () => {
    expect(gridTicks(0, 12)).toEqual([0, 5, 10]);
    expect(gridTicks(-8, 12)).toEqual([-5, 0, 5, 10]);
    expect(Object.is(gridTicks(-3, 12)[0], -0)).toBe(false);
  });
});
