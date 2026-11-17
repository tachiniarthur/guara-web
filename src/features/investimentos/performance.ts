import type { PortfolioData } from "./data";

/*
 * Período do gráfico de rentabilidade (Patrimônio investido): 6 meses, 12 meses ou desde o
 * início. Os mesmos da API (`GET /v1/investments/evolution?period=`).
 */

export type PerformancePeriod = "6m" | "12m" | "all";

export const PERFORMANCE_PERIODS: { value: PerformancePeriod; label: string; texto: string }[] = [
  { value: "6m", label: "6M", texto: "em 6 meses" },
  { value: "12m", label: "12M", texto: "em 12 meses" },
  { value: "all", label: "Tudo", texto: "desde o início" },
];

/** "Rentabilidade em 6 meses", "Rentabilidade desde o início"… */
export function performanceTitle(period: PerformancePeriod = "12m") {
  const texto = PERFORMANCE_PERIODS.find((p) => p.value === period)?.texto ?? "em 12 meses";
  return `Rentabilidade ${texto}`;
}

export type Performance = {
  rentabilidade: PortfolioData["rentabilidade"];
  /** O card "Rentabilidade em…" das estatísticas (id `rent`). */
  rent: PortfolioData["stats"][number];
};

/** A carteira com a rentabilidade de outro período (gráfico e card `rent`). */
export function withPerformance(portfolio: PortfolioData, performance: Performance): PortfolioData {
  return {
    ...portfolio,
    rentabilidade: performance.rentabilidade,
    stats: portfolio.stats.map((stat) => (stat.id === "rent" ? performance.rent : stat)),
  };
}

const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;
const round = (v: number) => Math.round(v * 10) / 10;

/** Mesma série acumulada, recomeçando do zero em `start` (o mês antes da janela). */
function rebase(series: number[], start: number): number[] {
  const base = 1 + series[start]! / 100;
  return series.slice(start).map((v) => round(((1 + v / 100) / base - 1) * 100));
}

/** Meses da série do design (out a set). */
const PROTOTYPE_MONTHS = [
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
/** O ano antes do design, de out/2024 a out/2025 (13 pontos; o último é o zero do design). */
const PROTOTYPE_BEFORE = {
  carteira: [0, 0.8, 1.9, 1.2, 2.6, 3.9, 3.1, 4.8, 6.2, 5.5, 7.1, 8.4, 9.0],
  cdi: [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3, 7.3, 8.3, 9.3, 10.3, 11.3],
  rotulos: [
    "out/24",
    "nov/24",
    "dez/24",
    ...PROTOTYPE_MONTHS.slice(3).map((m) => `${m}/25`),
    "out/25",
  ],
};

/**
 * Rentabilidade do protótipo no período. 12M é a série do design; 6M é o fim dela recomeçando do
 * zero; "Tudo" junta um ano antes (exemplo) ao ano do design.
 */
export function prototypePerformance(
  portfolio: PortfolioData,
  period: PerformancePeriod,
): Performance {
  const { carteira, cdi } = portfolio.rentabilidade;
  const cdiValues = cdi.map((v) => v ?? 0);
  let serie: { carteira: number[]; cdi: number[]; rotulos: string[] };
  if (period === "6m") {
    const start = carteira.length - 7;
    serie = {
      carteira: rebase(carteira, start),
      cdi: rebase(cdiValues, start),
      rotulos: PROTOTYPE_MONTHS.slice(start),
    };
  } else if (period === "all") {
    // O ano do design começa (no zero dele) onde o ano anterior terminou: acumulado sobre acumulado.
    const chain = (before: number[], after: number[]) => [
      ...before,
      ...after.slice(1).map((v) => round(((1 + before.at(-1)! / 100) * (1 + v / 100) - 1) * 100)),
    ];
    serie = {
      carteira: chain(PROTOTYPE_BEFORE.carteira, carteira),
      cdi: chain(PROTOTYPE_BEFORE.cdi, cdiValues),
      rotulos: [
        ...PROTOTYPE_BEFORE.rotulos,
        ...PROTOTYPE_MONTHS.slice(1).map((m, i) => `${m}/${i < 2 ? "25" : "26"}`),
      ],
    };
  } else {
    serie = { carteira, cdi: cdiValues, rotulos: PROTOTYPE_MONTHS };
  }
  const last = serie.carteira.at(-1) ?? 0;
  const lastCdi = serie.cdi.at(-1) ?? 0;
  return {
    rentabilidade: { ...serie, periodo: period },
    rent: {
      id: "rent",
      rotulo: performanceTitle(period),
      valor: pct(last),
      detalhe: `CDI no período: ${pct(lastCdi)}`,
      ganho: last >= 0,
    },
  };
}

/** O período não veio da API: sem curva e o card com "—" (o gráfico mostra o aviso). */
export function emptyPerformance(period: PerformancePeriod): Performance {
  return {
    rentabilidade: { carteira: [], cdi: [], rotulos: [], periodo: period },
    rent: {
      id: "rent",
      rotulo: performanceTitle(period),
      valor: "—",
      detalhe: "CDI no período: —",
      ganho: true,
    },
  };
}
