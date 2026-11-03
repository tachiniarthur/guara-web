import { ChartInspector, InspectorLayer } from "@/components/charts/inspector";
import { buildBar, ChartSvg, chartColors, roundedBar } from "@/components/charts/primitives";
import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

import { allocation, portfolio } from "../data";

type Variant = "desktop" | "tablet" | "mobile";

/** Meses do gráfico de 12 meses (o rótulo do eixo mostra um sim, um não). */
const MONTHS = ["out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set"];
const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;

const perfLayout: Record<
  Variant,
  {
    width: number;
    height: number;
    x1: number;
    zero: number;
    scale: number;
    labelX: number;
    carteiraDy: number;
    cdiDy: number;
    font: number;
    monthFont: number;
    monthY: number;
    dot: number;
    fixed?: boolean;
  }
> = {
  desktop: {
    width: 560,
    height: 280,
    x1: 550,
    zero: 233.4,
    scale: 17.333,
    labelX: 542,
    carteiraDy: -20,
    cdiDy: 36,
    font: 9,
    monthFont: 8.5,
    monthY: 270,
    dot: 4.5,
  },
  tablet: {
    width: 290,
    height: 150,
    x1: 280,
    zero: 105.3,
    scale: 7.333,
    labelX: 274,
    carteiraDy: -10,
    cdiDy: 18,
    font: 12,
    monthFont: 11,
    monthY: 146,
    dot: 0,
    fixed: true,
  },
  mobile: {
    width: 320,
    height: 150,
    x1: 310,
    zero: 105.3,
    scale: 7.333,
    labelX: 300,
    carteiraDy: -11,
    cdiDy: 39.3,
    font: 12,
    monthFont: 11,
    monthY: 146,
    dot: 4,
  },
};

/** Rentabilidade acumulada da carteira (verde) contra o CDI (tracejado). */
export function PerformanceChart({ variant }: { variant: Variant }) {
  const l = perfLayout[variant];
  const { carteira, cdi, meses } = portfolio.rentabilidade;
  const step = (l.x1 - 10) / (carteira.length - 1);
  const x = (i: number) => 10 + i * step;
  const y = (v: number) => l.zero - v * l.scale;
  const path = (values: number[]) =>
    values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = carteira.length - 1;
  const f = (n: number) => n.toFixed(1);
  const points = carteira.map((v, i) => ({
    x: x(i),
    title: `Até ${MONTHS[i] ?? ""}`,
    rows: [
      { label: "Carteira", value: pct(v), color: chartColors.folha, y: y(v) },
      { label: "CDI", value: pct(cdi[i] ?? 0), color: chartColors.label, y: y(cdi[i] ?? 0) },
    ],
  }));

  return (
    <ChartInspector points={points} label="Rentabilidade da carteira contra o CDI, mês a mês">
      <svg
        width={l.fixed ? rem(l.width) : "100%"}
        height={l.fixed ? rem(l.height) : undefined}
        viewBox={`0 0 ${l.width} ${l.height}`}
        role="img"
        aria-label="Rentabilidade em 12 meses: carteira +11,1%, CDI +9,9%"
        className={cn(l.fixed ? "block max-w-full" : "block h-auto w-full", "animate-reveal-x")}
        fontFamily="var(--font-figtree), Figtree, system-ui, sans-serif"
      >
        {[0, 5, 10].map((v) => (
          <line
            key={v}
            x1="0"
            x2={l.width}
            y1={f(y(v))}
            y2={f(y(v))}
            stroke={chartColors.grid}
            strokeDasharray="2 4"
          />
        ))}
        <path
          d={path(cdi)}
          fill="none"
          stroke={chartColors.label}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <path
          d={path(carteira)}
          fill="none"
          stroke={chartColors.folha}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {l.dot > 0 && (
          <circle
            cx={f(x(last))}
            cy={f(y(carteira[last] ?? 0))}
            r={l.dot}
            fill={chartColors.card}
            stroke={chartColors.folha}
            strokeWidth="2"
          />
        )}
        <text
          x={l.labelX}
          y={f(y(carteira[last] ?? 0) + l.carteiraDy)}
          textAnchor="end"
          fontSize={l.font}
          fontWeight="700"
          fill={chartColors.folha}
        >
          Carteira +11,1%
        </text>
        <text
          x={l.labelX}
          y={f(y(cdi[last] ?? 0) + l.cdiDy)}
          textAnchor="end"
          fontSize={l.font}
          fill={chartColors.mist}
        >
          CDI +9,9%
        </text>
        {meses.map((mes, i) => (
          <text
            key={mes}
            x={f(x(1 + i * 2))}
            y={l.monthY}
            textAnchor="middle"
            fontSize={l.monthFont}
            fill={chartColors.label}
          >
            {mes}
          </text>
        ))}
        <InspectorLayer x0={0} x1={l.width} top={4} bottom={l.zero + 8} />
      </svg>
    </ChartInspector>
  );
}

const classLayout: Record<
  Variant,
  {
    width: number;
    height: number;
    x1: number;
    base: number;
    bar: number;
    showTarget: boolean;
    short: boolean;
  }
> = {
  desktop: { width: 760, height: 230, x1: 754, base: 204, bar: 26, showTarget: true, short: false },
  tablet: { width: 600, height: 220, x1: 594, base: 194, bar: 26, showTarget: true, short: false },
  mobile: { width: 330, height: 210, x1: 324, base: 184, bar: 17, showTarget: false, short: true },
};

const comparisonLabel =
  "Comparação por classe, sua carteira contra o alvo do perfil moderado: Renda fixa 46% contra 50%; Ações 22% contra 20%; FIIs 14% contra 15%; Cripto 10% contra 5%; Internacional 8% contra 10%.";

/** Classe por classe: barra cheia (carteira) ao lado da barra tracejada (alvo do perfil). */
export function ClassComparisonChart({ variant }: { variant: Variant }) {
  const l = classLayout[variant];
  const x0 = 40;
  const group = (l.x1 - x0) / allocation.length;
  const y = (pct: number) => l.base - (pct / 60) * (l.base - 14);
  const f = (n: number) => n.toFixed(1);
  const points = allocation.map((slice, i) => ({
    x: x0 + group * i + group / 2,
    title: slice.classe,
    rows: [
      { label: "sua carteira", value: `${slice.atual}%`, color: slice.cor },
      { label: "alvo do perfil", value: `${slice.alvo}%`, color: chartColors.mist },
    ],
  }));

  return (
    <ChartInspector points={points} label="Sua carteira contra o alvo, classe por classe">
      <ChartSvg reveal="none" width={l.width} height={l.height} label={comparisonLabel}>
        {[0, 20, 40, 60].map((v) => (
          <g key={v}>
            <line
              x1={x0}
              x2={l.x1}
              y1={f(y(v))}
              y2={f(y(v))}
              stroke={chartColors.grid}
              strokeDasharray="3 5"
            />
            <text x="34" y={f(y(v) + 4)} textAnchor="end" fontSize="12" fill={chartColors.label}>
              {v}%
            </text>
          </g>
        ))}
        {allocation.map((slice, i) => {
          const center = x0 + group * i + group / 2;
          const left = center - l.bar - 1;
          const right = center + 1;
          const over = slice.atual - slice.alvo >= 5;
          return (
            <g key={slice.classe}>
              <path
                d={roundedBar(left, y(slice.atual), l.bar, l.base)}
                fill={slice.cor}
                fillOpacity="1"
                {...buildBar(i * 2)}
              />
              <path
                d={roundedBar(right, y(slice.alvo), l.bar, l.base)}
                fill={slice.cor}
                fillOpacity="0.28"
                stroke={slice.cor}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                {...buildBar(i * 2 + 1)}
              />
              <text
                x={f(left + l.bar / 2)}
                y={f(y(slice.atual) - 6)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill={over ? chartColors.tucano : chartColors.sand}
              >
                {slice.atual}%
              </text>
              {l.showTarget && (
                <text
                  x={f(right + l.bar / 2)}
                  y={f(y(slice.alvo) - 6)}
                  textAnchor="middle"
                  fontSize="12"
                  fill={chartColors.mist}
                >
                  {slice.alvo}%
                </text>
              )}
              <text
                x={f(center)}
                y={l.base + 18}
                textAnchor="middle"
                fontSize="12"
                fill={chartColors.mist}
              >
                {l.short ? slice.curta : slice.classe}
              </text>
            </g>
          );
        })}
        <line x1={x0} x2={l.x1} y1={l.base} y2={l.base} stroke={chartColors.axis} />
        <InspectorLayer x0={x0} x1={l.x1} top={8} bottom={l.base} mode="band" bandWidth={group} />
      </ChartSvg>
    </ChartInspector>
  );
}
