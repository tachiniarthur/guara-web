"use client";

import { ChartInspector, InspectorLayer } from "@/components/charts/inspector";
import { chartColors, halo, textWidth } from "@/components/charts/primitives";
import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

import { useInvestimentosData } from "../context";
import { performanceTitle } from "../performance";

type Variant = "desktop" | "tablet" | "mobile";

const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;

/** Até 7 rótulos no eixo, em passo fixo e sempre com o último mês (12 meses: um sim, um não). */
export function axisIndexes(count: number, max = 7): number[] {
  const step = Math.max(1, Math.ceil(count / max));
  const indexes: number[] = [];
  for (let i = count - 1; i >= 0; i -= step) indexes.unshift(i);
  return indexes;
}

/**
 * Quantos rótulos cabem no eixo (até 7) sem encostar: os das pontas encostam na borda e andam meia
 * largura para dentro, então a distância entre centros precisa de uma largura e meia mais a folga.
 */
export function axisFit(labels: string[], fontSize: number, span: number) {
  const widest = Math.max(0, ...labels.map((label) => textWidth(label, fontSize)));
  return Math.min(7, Math.max(2, Math.floor(span / (widest * 1.5 + 8)) + 1));
}

/** Rótulo do eixo centrado no ponto, ou encostado na borda quando passaria dela ("nov/25"). */
function axisAnchor(x: number, width: number, chartWidth: number) {
  if (x - width / 2 < 0) return "start";
  if (x + width / 2 > chartWidth) return "end";
  return "middle";
}

/** Linhas de grade em passo redondo (5, 10, 20…), no máximo 4 dentro da escala. */
export function gridTicks(lo: number, hi: number): number[] {
  const step =
    [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => (hi - lo) / s <= 4) ?? 1000;
  const ticks: number[] = [];
  // `|| 0`: sem "-0" quando a escala começa abaixo do zero.
  for (let v = Math.ceil(lo / step) * step || 0; v <= hi; v += step) ticks.push(v);
  return ticks;
}

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
  const {
    carteira,
    cdi: cdiRaw,
    rotulos = [],
    periodo,
  } = useInvestimentosData().portfolio.rentabilidade;
  // Sem CDI (fonte fora do plano), a linha tracejada some.
  const hasCdi = cdiRaw.some((v) => v !== null);
  const cdi = cdiRaw.map((v) => v ?? 0);
  // A escala do design vai de 0 a ~12%; acima disso, encolhe para caber. Rentabilidade negativa
  // desce o zero (até acima dos meses) em vez de sair do gráfico.
  const values = [...carteira, ...(hasCdi ? cdi : [])];
  const hi = Math.max(12, ...values);
  const lo = Math.min(0, ...values);
  const top = l.zero - l.scale * 12;
  const bottom = lo < 0 ? l.monthY - l.monthFont - 8 : l.zero;
  const step = (l.x1 - 10) / Math.max(carteira.length - 1, 1);
  const x = (i: number) => 10 + i * step;
  const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
  const path = (values: number[]) =>
    values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = carteira.length - 1;
  const f = (n: number) => n.toFixed(1);
  // Quem rendeu mais tem o rótulo em cima; o outro, embaixo, a uma linha de distância.
  const yCarteira = y(carteira[last] ?? 0);
  const yCdi = y(cdi[last] ?? 0);
  const carteiraOnTop = !hasCdi || yCarteira <= yCdi;
  const line = l.font * 1.4;
  let carteiraLabel = yCarteira + (carteiraOnTop ? l.carteiraDy : l.cdiDy);
  let cdiLabel = yCdi + (carteiraOnTop ? l.cdiDy : l.carteiraDy);
  if (hasCdi && Math.abs(carteiraLabel - cdiLabel) < line) {
    const mid = (carteiraLabel + cdiLabel) / 2;
    carteiraLabel = mid + (carteiraOnTop ? -line / 2 : line / 2);
    cdiLabel = mid + (carteiraOnTop ? line / 2 : -line / 2);
  }
  const inside = (v: number) => Math.min(l.monthY - l.monthFont - 4, Math.max(l.font + 2, v));
  carteiraLabel = inside(carteiraLabel);
  cdiLabel = inside(cdiLabel);
  const points = carteira.map((v, i) => ({
    x: x(i),
    title: `Até ${rotulos[i] ?? ""}`,
    rows: [
      { label: "Carteira", value: pct(v), color: chartColors.folha, y: y(v) },
      ...(hasCdi
        ? [{ label: "CDI", value: pct(cdi[i] ?? 0), color: chartColors.label, y: y(cdi[i] ?? 0) }]
        : []),
    ],
  }));

  return (
    <ChartInspector points={points} label="Rentabilidade da carteira contra o CDI, mês a mês">
      <svg
        width={l.fixed ? rem(l.width) : "100%"}
        height={l.fixed ? rem(l.height) : undefined}
        viewBox={`0 0 ${l.width} ${l.height}`}
        role="img"
        aria-label={`${performanceTitle(periodo)}: carteira ${pct(carteira[last] ?? 0)}${hasCdi ? `, CDI ${pct(cdi[last] ?? 0)}` : ""}`}
        className={cn(l.fixed ? "block max-w-full" : "block h-auto w-full", "animate-reveal-x")}
        fontFamily="var(--font-figtree), Figtree, system-ui, sans-serif"
      >
        {gridTicks(lo, hi).map((v) => (
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
        {hasCdi && (
          <path
            d={path(cdi)}
            fill="none"
            stroke={chartColors.label}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
        )}
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
          {...halo}
          x={l.labelX}
          y={f(carteiraLabel)}
          textAnchor="end"
          fontSize={l.font}
          fontWeight="700"
          fill={chartColors.folha}
        >
          Carteira {pct(carteira[last] ?? 0)}
        </text>
        {hasCdi && (
          <text
            {...halo}
            x={l.labelX}
            y={f(cdiLabel)}
            textAnchor="end"
            fontSize={l.font}
            fill={chartColors.mist}
          >
            CDI {pct(cdi[last] ?? 0)}
          </text>
        )}
        {axisIndexes(carteira.length, axisFit(rotulos, l.monthFont, l.x1 - 10)).map((i) => (
          <text
            key={i}
            x={f(x(i))}
            y={l.monthY}
            textAnchor={axisAnchor(x(i), textWidth(rotulos[i] ?? "", l.monthFont), l.width)}
            fontSize={l.monthFont}
            fill={chartColors.label}
          >
            {rotulos[i] ?? ""}
          </text>
        ))}
        <InspectorLayer x0={0} x1={l.width} top={4} bottom={l.zero + 8} />
      </svg>
    </ChartInspector>
  );
}
