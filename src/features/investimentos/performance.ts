import type { PortfolioData } from "./types";

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
