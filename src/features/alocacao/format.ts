const pct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** "46%", "36,2%". */
export function formatPercent(value: number) {
  return `${pct.format(value)}%`;
}

/** Diferença em p.p. com sinal tipográfico ("+17,2 p.p.", "−2 p.p."). */
export function formatDiff(diff: number) {
  if (Math.abs(diff) < 0.05) return "no alvo";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${pct.format(Math.abs(diff))} p.p.`;
}

/** Cor da diferença: acima do alvo em urucum, abaixo em arara, perto (menos de 2 p.p.) neutra. */
export function diffColor(diff: number) {
  if (Math.abs(diff) < 2) return "#93A198";
  return diff > 0 ? "#FF6A50" : "#6DB3EC";
}
