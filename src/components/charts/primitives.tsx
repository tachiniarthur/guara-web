import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

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

/**
 * Contorno da cor do card atrás de um texto do gráfico: continua legível quando passa por cima
 * de uma linha ou barra. Espalhe no `<text>`.
 */
export const halo = {
  stroke: chartColors.card,
  strokeWidth: 4,
  strokeLinejoin: "round",
  paintOrder: "stroke",
} as const;

/** Largura aproximada de um texto do gráfico (Figtree), para evitar rótulos sobrepostos. */
export const textWidth = (text: string, fontSize: number, bold = false) =>
  text.length * fontSize * (bold ? 0.6 : 0.54);

export const CHART_FONT = "var(--font-figtree), Figtree, system-ui, sans-serif";

type ChartSvgProps = {
  width: number;
  height: number;
  label: string;
  /** Ocupa a largura do container (altura proporcional), como nos protótipos. */
  fluid?: boolean;
  /** Ocupa a caixa inteira (dentro de um `ChartBox`, com o viewBox na proporção dela). */
  fill?: boolean;
  viewBox?: string;
  className?: string;
  /**
   * Como o gráfico se desenha ao entrar: `wipe` da esquerda para a direita (linhas, áreas),
   * `rise` de baixo para cima (barras) ou `none`.
   */
  reveal?: "wipe" | "rise" | "none";
  children: ReactNode;
};

/**
 * Construção desde o zero, no mesmo ritmo em todas as telas (o do relatório): cada barra cresce
 * da base, uma depois da outra; a linha principal se desenha; o resto (área, marcadores, rótulos)
 * aparece depois. Espalhe no elemento: `<path {...buildBar(i)} />`.
 */
export const buildBar = (index: number) => ({
  className: "build-bar",
  style: { animationDelay: `${index * 90}ms` },
});
export const buildLine = { pathLength: 1, className: "build-line" } as const;
export const buildAfter = { className: "build-after" } as const;

export const revealClass = {
  wipe: "animate-reveal-x",
  rise: "animate-reveal-y",
  none: "",
} as const;

export function ChartSvg({
  width,
  height,
  label,
  fluid = true,
  fill = false,
  viewBox,
  className,
  reveal = "wipe",
  children,
}: ChartSvgProps) {
  return (
    <svg
      width={fluid || fill ? "100%" : width}
      height={fill ? "100%" : fluid ? undefined : height}
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={cn(className ?? (fill ? "block" : "block h-auto"), revealClass[reveal])}
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
