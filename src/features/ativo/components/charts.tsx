import {
  AxisLabel,
  ChartSvg,
  GridLines,
  chartColors,
  roundedBar,
} from "@/components/charts/primitives";

import { assetFrames, assetSeries, petr4Series } from "../series";

export type Variant = "desktop" | "tablet" | "mobile";
const f = (n: number) => n.toFixed(1);

const priceFrames: Record<Variant, { width: number; height: number; x1: number; bottom: number }> =
  {
    desktop: { width: 1100, height: 300, x1: 1016, bottom: 274 },
    tablet: { width: 620, height: 260, x1: 536, bottom: 234 },
    mobile: { width: 340, height: 230, x1: 256, bottom: 204 },
  };

const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

/** Cotação da ação nos últimos 6 meses, com o seu preço médio, mínima e máxima. */
export function StockPriceChart({
  variant,
  averagePrice,
  maxLabel,
  minLabel,
}: {
  variant: Variant;
  averagePrice: number;
  /** Máxima e mínima do período (textos dos marcadores). */
  maxLabel: string;
  minLabel: string;
}) {
  const { width, height, x1, bottom } = priceFrames[variant];
  const x0 = 50;
  const top = 16;
  const prices = petr4Series.map((t) => 41 - t * 10);
  const step = (x1 - x0) / (prices.length - 1);
  const x = (i: number) => x0 + i * step;
  const y = (v: number) => bottom - ((v - 31) / 10) * (bottom - top);
  const line = prices.map((p, i) => `${i ? "L" : "M"}${f(x(i))},${f(y(p))}`).join(" ");
  const last = prices.length - 1;
  const maxI = prices.indexOf(Math.max(...prices));
  const minI = prices.indexOf(Math.min(...prices));
  const months = ["abr", "mai", "jun", "jul", "ago", "set"];

  return (
    <ChartSvg
      width={width}
      height={height}
      label="Cotação de PETR4 nos últimos 6 meses: de R$ 34,20 em abril a R$ 37,82 hoje. Mínima de R$ 33,40 e máxima de R$ 39,90 no período."
    >
      <GridLines
        ticks={[31, 33, 35, 37, 39, 41].map((v) => ({ value: v, label: String(v) }))}
        x0={x0}
        x1={x1}
        y={y}
        labelX={42}
      />
      <path
        d={`${line} L${f(x(last))},${bottom} L${x0},${bottom} Z`}
        fill={chartColors.arara}
        fillOpacity=".12"
      />
      <path
        d={line}
        fill="none"
        stroke={chartColors.arara}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1={x0}
        x2={x1}
        y1={f(y(averagePrice))}
        y2={f(y(averagePrice))}
        stroke={chartColors.tucano}
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <text
        x="56"
        y={f(y(averagePrice) - 6)}
        fontSize="12"
        fontWeight="700"
        fill={chartColors.mist}
      >
        Seu preço médio {brl(averagePrice)}
      </text>
      <circle
        cx={f(x(maxI))}
        cy={f(y(prices[maxI] ?? 0))}
        r="4"
        fill={chartColors.card}
        stroke={chartColors.mist}
        strokeWidth="2"
      />
      <text
        x={f(x(maxI))}
        y={f(y(prices[maxI] ?? 0) - 10)}
        textAnchor="middle"
        fontSize="12"
        fill={chartColors.mist}
      >
        máx {maxLabel}
      </text>
      <circle
        cx={f(x(minI))}
        cy={f(y(prices[minI] ?? 0))}
        r="4"
        fill={chartColors.card}
        stroke={chartColors.mist}
        strokeWidth="2"
      />
      <text
        x={f(x(minI) + 10)}
        y={f(y(prices[minI] ?? 0) + 4)}
        textAnchor="start"
        fontSize="12"
        fill={chartColors.mist}
      >
        mín {minLabel}
      </text>
      <circle
        cx={f(x(last))}
        cy={f(y(prices[last] ?? 0))}
        r="5"
        fill={chartColors.arara}
        stroke={chartColors.card}
        strokeWidth="2"
      />
      <text
        x={f(x(last) + 10)}
        y={f(y(prices[last] ?? 0) + 4)}
        fontSize="13"
        fontWeight="800"
        fill={chartColors.sand}
      >
        R$ 37,82
      </text>
      <line x1={x0} x2={x1} y1={bottom} y2={bottom} stroke={chartColors.axis} />
      {months.map((m, i) => (
        <AxisLabel key={m} x={x0 + ((x1 - x0) / 5) * i} y={bottom + 18}>
          {m}
        </AxisLabel>
      ))}
    </ChartSvg>
  );
}

const dividendFrames: Record<
  Variant,
  {
    width: number;
    height: number;
    x1: number;
    base: number;
    one: number;
    bar: number;
    shift: number;
    every: number;
  }
> = {
  desktop: { width: 520, height: 230, x1: 512, base: 206, one: 61.4, bar: 34, shift: 0, every: 1 },
  tablet: { width: 620, height: 210, x1: 612, base: 186, one: 56.8, bar: 30, shift: -2, every: 1 },
  mobile: {
    width: 340,
    height: 200,
    x1: 332,
    base: 176,
    one: 54.5,
    bar: 18.4,
    shift: -2,
    every: 2,
  },
};

/** Proventos por ação nos últimos pagamentos; o mais recente em destaque. */
export function DividendsChart({
  variant,
  bars,
}: {
  variant: Variant;
  bars: { rotulo: string; valor: number }[];
}) {
  const { width, height, x1, base, one, bar, shift, every } = dividendFrames[variant];
  const x0 = 44;
  const slot = (x1 - x0) / bars.length;
  const y = (v: number) => base - v * (base - one);
  const last = bars.length - 1;

  return (
    <ChartSvg
      width={width}
      height={height}
      label="Proventos por ação nos últimos 8 pagamentos, de R$ 0,48 a R$ 1,12. Último: R$ 0,72 em agosto de 2026."
    >
      <GridLines
        ticks={[
          { value: 0, label: "0,00" },
          { value: 0.5, label: "0,50" },
          { value: 1, label: "1,00" },
        ]}
        x0={x0}
        x1={x1}
        y={y}
        labelX={38}
      />
      {bars.map((b, i) => {
        const bx = x0 + slot * i + (slot - bar) / 2 + shift;
        const cx = bx + bar / 2;
        const current = i === last;
        return (
          <g key={b.rotulo}>
            <path
              d={roundedBar(bx, y(b.valor), bar, base)}
              fill={chartColors.folha}
              fillOpacity={current ? 1 : 0.5}
            >
              <title>{`${b.rotulo}: R$ ${b.valor.toFixed(2).replace(".", ",")} por ação`}</title>
            </path>
            {current && (
              <text
                x={f(cx)}
                y={f(y(b.valor) - 6)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill={chartColors.sand}
              >
                R$ {b.valor.toFixed(2).replace(".", ",")}
              </text>
            )}
            {(i % every === every - 1 || every === 1) && (
              <text
                x={f(cx)}
                y={base + 16}
                textAnchor="middle"
                fontSize="11"
                fill={current ? chartColors.sand : chartColors.label}
              >
                {b.rotulo}
              </text>
            )}
          </g>
        );
      })}
      <line x1={x0} x2={x1} y1={base} y2={base} stroke={chartColors.axis} />
    </ChartSvg>
  );
}

/** Ativo × CDI em 12 meses (linha verde com área e CDI tracejado). */
export function ComparedChart({
  variant,
  seriesKey,
  name,
}: {
  variant: Variant;
  seriesKey: string;
  name: string;
}) {
  const frame = assetFrames[seriesKey]?.[variant];
  const series = assetSeries[seriesKey];
  if (!frame || !series) return null;
  const x0 = 4;
  const [top, , bottom] = frame.grid as [number, number, number];
  const n = series.line.length;
  const x = (i: number) => x0 + (i / (n - 1)) * (frame.x1 - x0);
  const y = (t: number) => top + t * (bottom - top);
  const path = (values: number[]) =>
    values.map((t, i) => `${i ? "L" : "M"}${f(x(i))},${f(y(t))}`).join(" ");
  const lastY = y(series.line[n - 1] ?? 0);
  const areaBottom = frame.height - 34;
  const gradientId = `g-${seriesKey}-${variant}`;

  return (
    <ChartSvg
      width={frame.width}
      height={frame.height}
      label={`${name} em 12 meses comparado ao CDI`}
      className="block h-auto w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={chartColors.folha} stopOpacity=".22" />
          <stop offset="1" stopColor={chartColors.folha} stopOpacity="0" />
        </linearGradient>
      </defs>
      {frame.grid.map((gy, i) => (
        <g key={gy}>
          <line x1={x0} x2={frame.x1} y1={f(gy)} y2={f(gy)} stroke={chartColors.grid} />
          <text
            x={frame.labelX}
            y={f(gy + frame.font * 0.375)}
            textAnchor="end"
            fontSize={frame.font}
            fill={chartColors.label}
          >
            {frame.gridLabels[i]}
          </text>
        </g>
      ))}
      <path
        d={`${path(series.line)} L${f(frame.x1)},${areaBottom} L${f(x0)},${areaBottom} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={path(series.cdi)}
        fill="none"
        stroke={chartColors.label}
        strokeWidth="1.6"
        strokeDasharray="6 4"
      />
      <path
        d={path(series.line)}
        fill="none"
        stroke={chartColors.folha}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx={f(frame.x1)} cy={f(lastY)} r="7" fill={chartColors.folha} opacity=".25" />
      <circle cx={f(frame.x1)} cy={f(lastY)} r="4" fill={chartColors.folha} />
      {frame.xLabels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor as "start" | "middle" | "end"}
          fontSize={frame.font}
          fill={chartColors.label}
        >
          {label.text}
        </text>
      ))}
    </ChartSvg>
  );
}
