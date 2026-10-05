import { ChartSvg, chartColors } from "@/components/charts/primitives";

import type { ProjectionSeries } from "../projection";

export type ChartVariant = "desktop" | "tablet" | "mobile";

const boxes: Record<
  ChartVariant,
  { width: number; height: number; goalFont: number; axisFont: number }
> = {
  desktop: { width: 900, height: 240, goalFont: 13, axisFont: 12 },
  tablet: { width: 720, height: 260, goalFont: 13, axisFont: 12 },
  mobile: { width: 340, height: 220, goalFont: 12, axisFont: 11 },
};

const TOP = 30;
const PAD_X = 8;
/** Folga acima do maior valor. */
const HEADROOM = 1.08;

export type ProjectionChartProps = {
  variant: ChartVariant;
  series: ProjectionSeries;
  color: "arara" | "folha";
  /** Linha tracejada da meta e o rótulo dela. */
  goal?: { value: number; label: string };
  ticks: { index: number; label: string }[];
  label: string;
};

/** Patrimônio projetado (área com degradê) contra o que foi depositado (tracejado), com a meta. */
export function ProjectionChart({
  variant,
  series,
  color,
  goal,
  ticks,
  label,
}: ProjectionChartProps) {
  const { width, height, goalFont, axisFont } = boxes[variant];
  const bottom = height - 26;
  const last = series.projected.length - 1;
  const max = Math.max(...series.projected) * HEADROOM;
  const x = (i: number) => PAD_X + (i * (width - PAD_X * 2)) / last;
  const y = (v: number) => bottom - (v / max) * (bottom - TOP);
  const line = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = (values: number[]) =>
    `${line(values)} L${x(last).toFixed(1)},${bottom} L${PAD_X}.0,${bottom} Z`;
  const stroke = chartColors[color];
  const gradient = `projecao-${variant}-${color}`;
  const endY = y(series.projected[last] ?? 0);

  return (
    <ChartSvg width={width} height={height} label={label}>
      <defs>
        <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity=".35" />
          <stop offset="1" stopColor={stroke} stopOpacity=".03" />
        </linearGradient>
      </defs>
      <path d={area(series.deposited)} fill={chartColors.grid} opacity=".9" />
      <path d={area(series.projected)} fill={`url(#${gradient})`} />
      <path
        d={line(series.deposited)}
        fill="none"
        stroke={chartColors.label}
        strokeWidth="1.6"
        strokeDasharray="5 4"
      />
      <path
        d={line(series.projected)}
        fill="none"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {goal && (
        <>
          <line
            x1={PAD_X}
            x2={width - PAD_X}
            y1={y(goal.value).toFixed(1)}
            y2={y(goal.value).toFixed(1)}
            stroke={chartColors.tucano}
            strokeWidth="1.6"
            strokeDasharray="3 4"
          />
          <text
            x="12"
            y={(y(goal.value) - 8).toFixed(1)}
            fontSize={goalFont}
            fontWeight="700"
            fill={chartColors.tucano}
          >
            {goal.label}
          </text>
        </>
      )}
      <circle
        cx={x(last).toFixed(1)}
        cy={endY.toFixed(1)}
        r="5"
        fill={chartColors.card}
        stroke={stroke}
        strokeWidth="2.4"
      />
      <line x1={PAD_X} x2={width - PAD_X} y1={bottom} y2={bottom} stroke={chartColors.axis} />
      {ticks.map((tick) => (
        <text
          key={tick.index}
          x={x(tick.index).toFixed(1)}
          y={height - 8}
          textAnchor={tick.index === 0 ? "start" : tick.index === last ? "end" : "middle"}
          fontSize={axisFont}
          fill={chartColors.label}
        >
          {tick.label}
        </text>
      ))}
    </ChartSvg>
  );
}
