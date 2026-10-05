import { ChartSvg, chartColors } from "@/components/charts/primitives";

type Variant = "desktop" | "tablet" | "mobile";

const layout: Record<
  Variant,
  {
    width: number;
    height: number;
    base: number;
    scale: number;
    barRatio: number;
    valueSize: number;
    monthSize: number;
    inside: boolean;
  }
> = {
  desktop: {
    width: 1000,
    height: 380,
    base: 340,
    scale: 0.25333,
    barRatio: 0.5,
    valueSize: 18,
    monthSize: 17,
    inside: false,
  },
  tablet: {
    width: 700,
    height: 300,
    base: 260,
    scale: 0.18671,
    barRatio: 0.5,
    valueSize: 16,
    monthSize: 15,
    inside: false,
  },
  mobile: {
    width: 340,
    height: 230,
    base: 200,
    scale: 0.14329,
    barRatio: 0.72,
    valueSize: 12,
    monthSize: 11,
    inside: true,
  },
};

export type MonthValue = { rotulo: string; valor: number; atual?: boolean };

type CategoryHistoryChartProps = {
  variant: Variant;
  months: MonthValue[];
  teto: number;
  media: number;
  label: string;
};

const PAST = "#3E6A8C";
const fmt = (v: number) => v.toLocaleString("pt-BR");

/** Gasto mensal de uma categoria contra o teto novo e a média; o que passou do teto fica em urucum. */
export function CategoryHistoryChart({
  variant,
  months,
  teto,
  media,
  label,
}: CategoryHistoryChartProps) {
  const { width, height, base, scale, barRatio, valueSize, monthSize, inside } = layout[variant];
  const pad = 8;
  const slot = (width - pad * 2) / months.length;
  const bar = slot * barRatio;
  const y = (v: number) => base - v * scale;

  return (
    <ChartSvg width={width} height={height} label={label} className="block h-auto w-full">
      <line x1="0" x2={width} y1={base} y2={base} stroke={chartColors.axis} />
      <line
        x1="0"
        x2={width}
        y1={y(media).toFixed(1)}
        y2={y(media).toFixed(1)}
        stroke={chartColors.label}
        strokeWidth="1.5"
        strokeDasharray="2 5"
      />
      <line
        x1="0"
        x2={width}
        y1={y(teto).toFixed(1)}
        y2={y(teto).toFixed(1)}
        stroke={chartColors.tucano}
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      {months.map((m, i) => {
        const cx = pad + slot * i + slot / 2;
        const top = y(m.valor);
        const over = m.valor > teto;
        const fill = over ? chartColors.urucum : m.atual ? chartColors.arara : PAST;
        return (
          <rect
            key={m.rotulo}
            x={(cx - bar / 2).toFixed(1)}
            y={top.toFixed(1)}
            width={bar.toFixed(1)}
            height={(base - top).toFixed(1)}
            rx="6"
            fill={fill}
          />
        );
      })}
      {months.map((m, i) => {
        const cx = pad + slot * i + slot / 2;
        const top = y(m.valor);
        const over = m.valor > teto;
        const bright = over || m.atual;
        const valueColor = inside
          ? bright
            ? chartColors.canvas
            : chartColors.sand
          : over
            ? chartColors.urucum
            : chartColors.sand;
        return (
          <g key={m.rotulo}>
            <text
              x={cx.toFixed(1)}
              y={(inside ? top + 18 : top - 10).toFixed(1)}
              textAnchor="middle"
              fontSize={valueSize}
              fontWeight="700"
              fill={valueColor}
            >
              {fmt(m.valor)}
            </text>
            <text
              x={cx.toFixed(1)}
              y={height - 12}
              textAnchor="middle"
              fontSize={monthSize}
              fill={chartColors.label}
            >
              {m.rotulo}
            </text>
          </g>
        );
      })}
      <text
        x={width - 4}
        y={(y(teto) - 8).toFixed(1)}
        textAnchor="end"
        fontSize={monthSize}
        fontWeight="700"
        fill={chartColors.tucano}
      >
        teto novo {fmt(teto)}
      </text>
    </ChartSvg>
  );
}
