import type { ReactNode } from "react";

/** Cores fixas dos gráficos (os SVGs não leem as classes do Tailwind). */
export const chartColors = {
  grid: "#25322B",
  axis: "#34443B",
  label: "#93A198",
  mist: "#BDC6BE",
  sand: "#F2EFE6",
  card: "#121A16",
  canvas: "#0B110E",
  saidas: "#E0935A",
  arara: "#6DB3EC",
  folha: "#6CC08E",
  tucano: "#F2C230",
  urucum: "#FF6A50",
} as const;

export const CHART_FONT = "var(--font-figtree), Figtree, system-ui, sans-serif";

type ChartSvgProps = {
  width: number;
  height: number;
  label: string;
  /** Ocupa a largura do container (altura proporcional), como nos protótipos. */
  fluid?: boolean;
  viewBox?: string;
  className?: string;
  children: ReactNode;
};

export function ChartSvg({
  width,
  height,
  label,
  fluid = true,
  viewBox,
  className,
  children,
}: ChartSvgProps) {
  return (
    <svg
      width={fluid ? "100%" : width}
      height={fluid ? undefined : height}
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={className ?? "block h-auto"}
      fontFamily={CHART_FONT}
    >
      {children}
    </svg>
  );
}

/** Linhas de grade tracejadas com rótulos à esquerda. */
export function GridLines({
  ticks,
  x0,
  x1,
  y,
  labelX,
  fontSize = 12,
}: {
  ticks: { value: number; label: string }[];
  x0: number;
  x1: number;
  y: (value: number) => number;
  labelX: number;
  fontSize?: number;
}) {
  return (
    <>
      {ticks.map((tick) => (
        <g key={tick.value}>
          <line
            x1={x0}
            x2={x1}
            y1={y(tick.value).toFixed(1)}
            y2={y(tick.value).toFixed(1)}
            stroke={chartColors.grid}
            strokeDasharray="3 5"
          />
          <text
            x={labelX}
            y={(y(tick.value) + 4).toFixed(1)}
            textAnchor="end"
            fontSize={fontSize}
            fill={chartColors.label}
          >
            {tick.label}
          </text>
        </g>
      ))}
    </>
  );
}

/** Barra com cantos superiores arredondados (raio 4). */
export function roundedBar(x: number, top: number, width: number, base: number, r = 4) {
  const f = (n: number) => n.toFixed(1);
  return `M${f(x)},${base} V${f(top + r)} Q${f(x)},${f(top)} ${f(x + r)},${f(top)} H${f(x + width - r)} Q${f(x + width)},${f(top)} ${f(x + width)},${f(top + r)} V${base} Z`;
}

/** Rótulo de eixo X (o destaque fica em areia e negrito). */
export function AxisLabel({
  x,
  y,
  highlight,
  children,
}: {
  x: number;
  y: number;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <text
      x={x.toFixed(1)}
      y={y}
      textAnchor="middle"
      fontSize="12"
      fill={highlight ? chartColors.sand : chartColors.label}
      fontWeight={highlight ? 800 : 400}
    >
      {children}
    </text>
  );
}
