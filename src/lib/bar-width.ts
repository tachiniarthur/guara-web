/**
 * Largura de barra em %, sempre entre 0 e 100. Gasto acima do teto (142%), carteira acima da
 * escala ou dado inválido não podem fazer a barra sair do card: o que passou do limite aparece
 * no número e no estado ("142% · apertado"), não no tamanho da barra.
 */
export function barWidth(percent: number): string {
  const safe = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  return `${safe.toFixed(1)}%`;
}
