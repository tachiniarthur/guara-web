"use client";

import { ChartBox } from "./chart-box";
import { ChartInspector, InspectorLayer } from "./inspector";
import { ChartSvg, chartColors, halo, textWidth } from "./primitives";

/**
 * Linha de uma série no tempo (preço de fechamento, saldo projetado), com grade em passos
 * redondos que seguem o dado, rótulos do eixo que não se sobrepõem e leitura por ponteiro,
 * toque e teclado. Desenhado na largura real do bloco (`ChartBox stretchX`).
 */

export type SeriesPoint = { label: string; value: number };

/** Passo redondo (1, 2, 2,5 ou 5 × 10ⁿ) para no máximo `count` intervalos entre `lo` e `hi`. */
export function niceStep(lo: number, hi: number, count = 4): number {
  const span = Math.abs(hi - lo) || Math.abs(hi) || 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10;
  return step * magnitude;
}

/** Escala e linhas de grade: começa e termina num múltiplo do passo, com o dado dentro. */
export function niceScale(values: number[], count = 4) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = niceStep(lo, hi, count);
  const min = Math.floor(lo / step) * step;
  const max = Math.max(Math.ceil(hi / step) * step, min + step);
  const ticks: number[] = [];
  // Arredonda cada passo: 0,1 + 0,2 não pode virar 0,30000000000000004.
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return { min, max, ticks };
}

/** Até `max` índices do eixo, em passo fixo e sempre com o último ponto. */
export function axisPicks(count: number, max: number): number[] {
  const step = Math.max(1, Math.ceil(count / Math.max(1, max)));
  const picks: number[] = [];
  for (let i = count - 1; i >= 0; i -= step) picks.unshift(i);
  return picks;
}

export function LineSeries({
  points,
  label,
  format,
  tickFormat = format,
  color = chartColors.folha,
  target,
  height = 220,
}: {
  points: SeriesPoint[];
  /** Resumo para o leitor de tela e nome da leitura por teclado. */
  label: string;
  /** Valor na leitura ("R$ 38,42"). */
  format: (value: number) => string;
  /** Valor nas linhas de grade (mais curto, se quiser). */
  tickFormat?: (value: number) => string;
  color?: string;
  /** Linha tracejada de referência (ex.: a meta), com rótulo. */
  target?: { value: number; label: string };
  height?: number;
}) {
  const values = points.map((p) => p.value);
  const scale = niceScale(target ? [...values, target.value] : values);
  const tickLabels = scale.ticks.map(tickFormat);
  const left = Math.max(...tickLabels.map((t) => textWidth(t, 12))) + 10;

  return (
    <ChartBox width={340} height={height} stretchX minWidth={280}>
      {({ width, height: h }) => {
        const right = width - 6;
        const top = 10;
        const bottom = h - 26;
        const x = (i: number) =>
          points.length < 2
            ? (left + right) / 2
            : left + (i * (right - left)) / (points.length - 1);
        const y = (v: number) =>
          bottom - ((v - scale.min) / (scale.max - scale.min || 1)) * (bottom - top);
        const path = points
          .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
          .join(" ");
        const area = `${path} L${x(points.length - 1).toFixed(1)},${bottom} L${x(0).toFixed(1)},${bottom} Z`;
        const widest = Math.max(0, ...points.map((p) => textWidth(p.label, 12)));
        const fit = Math.max(2, Math.floor((right - left) / (widest * 1.5 + 8)) + 1);
        const last = points.length - 1;
        const inspect = points.map((p, i) => ({
          x: x(i),
          title: p.label,
          rows: [{ label: "Valor", value: format(p.value), color, y: y(p.value) }],
        }));
        return (
          <ChartInspector className="size-full" points={inspect} label={label}>
            <ChartSvg width={width} height={h} fill label={label}>
              {scale.ticks.map((t, i) => (
                <g key={t}>
                  <line
                    x1={left}
                    x2={right}
                    y1={y(t).toFixed(1)}
                    y2={y(t).toFixed(1)}
                    stroke={chartColors.grid}
                    strokeDasharray="3 5"
                  />
                  <text
                    x={left - 8}
                    y={(y(t) + 4).toFixed(1)}
                    textAnchor="end"
                    fontSize="12"
                    fill={chartColors.label}
                  >
                    {tickLabels[i]}
                  </text>
                </g>
              ))}
              {target && (
                <>
                  <line
                    x1={left}
                    x2={right}
                    y1={y(target.value).toFixed(1)}
                    y2={y(target.value).toFixed(1)}
                    stroke={chartColors.tucano}
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                  />
                  <text
                    {...halo}
                    x={right}
                    y={(y(target.value) - 6).toFixed(1)}
                    textAnchor="end"
                    fontSize="12"
                    fontWeight="700"
                    fill={chartColors.tucano}
                  >
                    {target.label}
                  </text>
                </>
              )}
              {points.length > 1 && <path d={area} fill={color} opacity="0.08" />}
              <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
              {last >= 0 && (
                <circle
                  cx={x(last).toFixed(1)}
                  cy={y(points[last]!.value).toFixed(1)}
                  r="4"
                  fill={chartColors.card}
                  stroke={color}
                  strokeWidth="2"
                />
              )}
              {axisPicks(points.length, fit).map((i) => {
                const text = points[i]!.label;
                const w = textWidth(text, 12);
                const anchor =
                  x(i) - w / 2 < left ? "start" : x(i) + w / 2 > width ? "end" : "middle";
                return (
                  <text
                    key={i}
                    x={x(i).toFixed(1)}
                    y={h - 6}
                    textAnchor={anchor}
                    fontSize="12"
                    fill={chartColors.label}
                  >
                    {text}
                  </text>
                );
              })}
              <InspectorLayer x0={left} x1={right} top={top} bottom={bottom} />
            </ChartSvg>
          </ChartInspector>
        );
      }}
    </ChartBox>
  );
}
