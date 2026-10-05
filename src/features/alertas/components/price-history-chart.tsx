import { ChartSvg, chartColors } from "@/components/charts/primitives";

type Variant = "desktop" | "tablet" | "mobile";

const layout: Record<
  Variant,
  {
    width: number;
    height: number;
    x0: number;
    x1: number;
    yLow: number;
    yHigh: number;
    font: number;
    title: number;
    minGap: number;
  }
> = {
  desktop: {
    width: 1000,
    height: 440,
    x0: 70,
    x1: 984,
    yLow: 345.2,
    yHigh: 71.1,
    font: 15,
    title: 17,
    minGap: 25,
  },
  tablet: {
    width: 700,
    height: 340,
    x0: 74,
    x1: 684,
    yLow: 260,
    yHigh: 60,
    font: 13,
    title: 15,
    minGap: 23,
  },
  mobile: {
    width: 340,
    height: 270,
    x0: 60,
    x1: 324,
    yLow: 208.6,
    yHigh: 51.6,
    font: 11,
    title: 13,
    minGap: 21,
  },
};

type PriceHistoryChartProps = {
  variant: Variant;
  /** Preço diário (R$) dos últimos 30 dias; o último é o atual. */
  prices: number[];
  /** Faixa do eixo: preço da linha de baixo e do alerta (linha de cima). */
  low: number;
  alert: number;
  ticks: { index: number; label: string }[];
  label: string;
};

const mil = (v: number) =>
  `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;

/** Preço nos últimos 30 dias com a faixa até o alvo do alerta destacada em urucum. */
export function PriceHistoryChart({
  variant,
  prices,
  low,
  alert,
  ticks,
  label,
}: PriceHistoryChartProps) {
  const { width, height, x0, x1, yLow, yHigh, font, title, minGap } = layout[variant];
  const step = (x1 - x0) / (prices.length - 1);
  const x = (i: number) => x0 + i * step;
  const y = (v: number) => yLow - ((v - low) / (alert - low)) * (yLow - yHigh);
  const mid = (low + alert) / 2;
  const line = prices
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p).toFixed(1)}`)
    .join(" ");
  const last = prices.length - 1;
  const now = prices[last] ?? 0;
  const minIndex = prices.reduce((best, p, i) => (p < (prices[best] ?? Infinity) ? i : best), 0);
  const min = prices[minIndex] ?? 0;
  const f = (n: number) => n.toFixed(1);
  const gradientId = `price-gradient-${variant}`;

  return (
    <ChartSvg width={width} height={height} label={label} className="block h-auto w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={chartColors.sand} stopOpacity=".18" />
          <stop offset="1" stopColor={chartColors.sand} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[low, mid].map((v) => (
        <g key={v}>
          <line
            x1={x0}
            x2={x1}
            y1={f(y(v))}
            y2={f(y(v))}
            stroke={chartColors.grid}
            strokeDasharray="2 4"
          />
          <text
            x={x0 - 10}
            y={f(y(v) + font * 0.4)}
            textAnchor="end"
            fontSize={font}
            fill={chartColors.label}
          >
            {mil(v)}
          </text>
        </g>
      ))}
      <rect
        x={x0}
        y={f(y(alert))}
        width={x1 - x0}
        height={f(y(now) - y(alert))}
        fill={chartColors.urucum}
        opacity=".08"
      />
      <line
        x1={x0}
        x2={x1}
        y1={f(y(alert))}
        y2={f(y(alert))}
        stroke={chartColors.urucum}
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      <text
        x={x0 - 10}
        y={f(y(alert) + font * 0.4)}
        textAnchor="end"
        fontSize={font}
        fontWeight="700"
        fill={chartColors.urucum}
      >
        {mil(alert)}
      </text>
      <text
        x={x0 + 8}
        y={f(y(alert) - 10)}
        fontSize={title}
        fontWeight="700"
        fill={chartColors.urucum}
      >
        Alerta de venda: R$ {mil(alert)}
      </text>
      <path
        d={`${line} L${f(x(last))},${f(yLow)} L${f(x0)},${f(yLow)} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={line}
        fill="none"
        stroke={chartColors.sand}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle
        cx={f(x(last))}
        cy={f(y(now))}
        r="6"
        fill={chartColors.card}
        stroke={chartColors.sand}
        strokeWidth="2.5"
      />
      <circle cx={f(x(minIndex))} cy={f(y(min))} r="4" fill={chartColors.label} />
      <text
        x={f(x(minIndex))}
        y={f(y(min) + minGap)}
        textAnchor="middle"
        fontSize={font}
        fill={chartColors.mist}
      >
        mín. {mil(min)}
      </text>
      {ticks.map((tick) => (
        <text
          key={tick.index}
          x={f(x(tick.index))}
          y={height - 10}
          textAnchor={tick.index === 0 ? "start" : tick.index === last ? "end" : "middle"}
          fontSize={font}
          fill={chartColors.label}
        >
          {tick.label}
        </text>
      ))}
    </ChartSvg>
  );
}
