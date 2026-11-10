"use client";

import {
  AxisLabel,
  ChartSvg,
  GridLines,
  chartColors,
  buildAfter,
  buildBar,
  halo,
  roundedBar,
  textWidth,
} from "@/components/charts/primitives";
import { ChartBox } from "@/components/charts/chart-box";
import { ChartInspector, InspectorLayer } from "@/components/charts/inspector";
import { formatReais } from "@/lib/format";

import { moneyTicks, useGastosData } from "../context";

/** Altura natural dos gráficos (viewBox) e linha de base das barras nela. */
const HEIGHT = 230;
const BASE = 190;

type PaceVariant = "desktop" | "tablet" | "mobile";

/**
 * Desenho de cada variante na largura natural (`width`); `right` é o espaço à direita da área,
 * para os rótulos. Na largura de verdade, a área estica e o texto fica do mesmo tamanho.
 */
const paceLayout: Record<
  PaceVariant,
  { width: number; x0: number; right: number; labelSide: "left" | "right"; showClose: boolean }
> = {
  desktop: { width: 540, x0: 48, right: 70, labelSide: "left", showClose: true },
  tablet: { width: 540, x0: 48, right: 70, labelSide: "right", showClose: true },
  mobile: { width: 360, x0: 40, right: 122, labelSide: "right", showClose: false },
};

/** Abaixo desta largura (px), o gráfico encolhe por inteiro em vez de apertar a área. */
const MIN_WIDTH = 300;

type Size = { width: number; height: number };

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;
/** Valor da leitura (os dados do design estão em reais inteiros). */
const brl = (reais: number) => formatReais(reais);

/** Gasto acumulado do mês contra o mês anterior (linha tracejada). */
export function SpendingPaceChart({ variant }: { variant: PaceVariant }) {
  return (
    <ChartBox width={paceLayout[variant].width} height={HEIGHT} stretchX minWidth={MIN_WIDTH}>
      {(size) => <PaceChart variant={variant} size={size} />}
    </ChartBox>
  );
}

/** `size`: o do viewBox; o que passa do natural vai para a área do gráfico. */
function PaceChart({ variant, size }: { variant: PaceVariant; size: Size }) {
  const { x0, right, labelSide, showClose } = paceLayout[variant];
  const { width, height } = size;
  const x1 = width - right;
  const extra = height - HEIGHT;
  const base = BASE + extra;
  const {
    atual: setembro,
    anterior: agosto,
    hoje,
    descricao,
    maximo,
    nomeAtual,
    nomeAnterior,
  } = useGastosData().spendingPace;
  const step = (x1 - x0) / (agosto.length - 1);
  const x = (day: number) => x0 + (day - 1) * step;
  const y = (value: number) => base - (value / maximo) * (147.4 + extra);
  const line = (values: number[]) =>
    values.map((v, i) => `${i ? "L" : "M"}${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const xHoje = x(hoje);
  const setHoje = setembro[hoje - 1] ?? 0;
  const agoHoje = agosto[hoje - 1] ?? 0;
  const agoFim = agosto[agosto.length - 1] ?? 0;
  const currentText = `${nomeAtual} ${fmt(setHoje)}`;
  const previousText = `${nomeAnterior} ${fmt(agoHoje)}`;
  const labels = paceLabels({
    current: y(setHoje),
    previous: y(agoHoje),
    // À esquerda de hoje só quando cabe antes do eixo (no começo do mês, vai para a direita).
    left: labelSide === "left" && xHoje - 10 - textWidth(currentText, 13, true) > x0,
    top: 14,
    bottom: base - 4,
  });

  const points = setembro.map((v, i) => ({
    x: x(i + 1),
    title: i + 1 === hoje ? `Hoje, dia ${hoje}` : `Dia ${i + 1}`,
    rows: [
      { label: nomeAtual, value: brl(v), color: chartColors.saidas, y: y(v) },
      {
        label: nomeAnterior,
        value: brl(agosto[i] ?? 0),
        color: chartColors.label,
        y: y(agosto[i] ?? 0),
      },
    ],
  }));

  return (
    <ChartInspector className="size-full" points={points} label="Ritmo de gastos do mês, dia a dia">
      <ChartSvg width={width} height={height} fill label={descricao}>
        <GridLines ticks={moneyTicks(maximo)} x0={x0} x1={x1} y={y} labelX={x0 - 8} />
        <path
          d={line(agosto)}
          fill="none"
          stroke={chartColors.label}
          strokeWidth="2"
          strokeDasharray="6 5"
          strokeLinejoin="round"
        />
        <path
          d={`${line(setembro)} L${xHoje.toFixed(1)},${base} L${x0.toFixed(1)},${base} Z`}
          fill={chartColors.saidas}
          fillOpacity=".12"
        />
        <path
          d={line(setembro)}
          fill="none"
          stroke={chartColors.saidas}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line
          x1={xHoje.toFixed(1)}
          x2={xHoje.toFixed(1)}
          y1="18"
          y2={base}
          stroke={chartColors.axis}
        />
        <circle
          cx={xHoje.toFixed(1)}
          cy={y(setHoje).toFixed(1)}
          r="5"
          fill={chartColors.saidas}
          stroke={chartColors.card}
          strokeWidth="2"
        />
        <text
          {...halo}
          x={(labels.left ? xHoje - 10 : xHoje + 10).toFixed(1)}
          y={labels.current.toFixed(1)}
          textAnchor={labels.left ? "end" : "start"}
          fontSize="13"
          fontWeight="800"
          fill={chartColors.sand}
        >
          {currentText}
        </text>
        <text
          {...halo}
          x={(xHoje + 10).toFixed(1)}
          y={labels.previous.toFixed(1)}
          fontSize="12"
          fill={chartColors.mist}
        >
          {previousText}
        </text>
        <circle
          cx={xHoje.toFixed(1)}
          cy={y(agoHoje).toFixed(1)}
          r="4"
          fill={chartColors.label}
          stroke={chartColors.card}
          strokeWidth="2"
        />
        {showClose && (
          <text x={x1 + 6} y={(y(agoFim) + 4).toFixed(1)} fontSize="12" fill={chartColors.label}>
            {fmt(agoFim)}
          </text>
        )}
        <line x1={x0} x2={x1} y1={base} y2={base} stroke={chartColors.axis} />
        {[...new Set([1, 10, 20, hoje, agosto.length])]
          // Dia que encostaria no "hoje" sai (o "hoje" fica).
          .filter((day) => day === hoje || Math.abs(x(day) - xHoje) >= 24)
          .map((day) => (
            <AxisLabel key={day} x={x(day)} y={208 + extra} highlight={day === hoje}>
              {day === hoje ? "hoje" : day}
            </AxisLabel>
          ))}
        <InspectorLayer x0={x0 - 6} x1={x1 + 6} top={14} bottom={base} />
      </ChartSvg>
    </ChartInspector>
  );
}

/**
 * Altura (y) dos rótulos de hoje no ritmo: o do mês que gastou mais fica acima do ponto e o outro
 * abaixo, sempre a uma linha de distância e dentro da área do gráfico.
 */
export function paceLabels({
  current,
  previous,
  left,
  top,
  bottom,
}: {
  current: number;
  previous: number;
  left: boolean;
  top: number;
  bottom: number;
}) {
  const LINE = 15;
  const clamp = (v: number) => Math.min(bottom, Math.max(top + 12, v));
  // Rótulo à esquerda não disputa espaço com o da direita: cada um ao lado do seu ponto.
  if (left) return { left, current: clamp(current - 2), previous: clamp(previous + 14) };
  // Menor y = valor maior = mais acima no gráfico.
  const currentAbove = current <= previous;
  let upper = (currentAbove ? current : previous) - 6;
  let lower = (currentAbove ? previous : current) + 16;
  if (lower - upper < LINE) {
    const mid = (upper + lower) / 2;
    upper = mid - LINE / 2;
    lower = mid + LINE / 2;
  }
  upper = clamp(upper);
  lower = Math.max(clamp(lower), upper + LINE);
  return currentAbove
    ? { left, current: upper, previous: lower }
    : { left, current: lower, previous: upper };
}

type BarVariant = "wide" | "narrow";

function barLayout(
  variant: BarVariant,
  width: number,
  count: number,
  wide: { x0: number; bar: number },
  narrow: { x0: number; bar: number },
) {
  const natural = variant === "wide" ? wide : narrow;
  const { x0 } = natural;
  const x1 = width - (variant === "wide" ? 20 : 8);
  const slot = (x1 - x0) / count;
  // A barra guarda a proporção do design dentro da faixa (sem ficar fina num bloco largo).
  const naturalSlot = ((variant === "wide" ? 520 : 352) - x0) / count;
  const bar = Math.min(56, Math.max(14, (natural.bar / naturalSlot) * slot));
  const shift = variant === "wide" ? 0 : -2;
  return {
    x0,
    x1,
    bar,
    slot,
    barX: (i: number) => x0 + i * slot + (slot - bar) / 2 + shift,
  };
}

/** Total gasto por mês, com a média dos meses anteriores e a previsão do mês atual. */
export function MonthlySpendingChart({ variant }: { variant: BarVariant }) {
  return (
    <ChartBox width={variant === "wide" ? 540 : 360} height={HEIGHT} stretchX minWidth={MIN_WIDTH}>
      {(size) => <MonthlyChart variant={variant} size={size} />}
    </ChartBox>
  );
}

function MonthlyChart({ variant, size }: { variant: BarVariant; size: Size }) {
  const { height } = size;
  const extra = height - HEIGHT;
  const base = BASE + extra;
  const { meses, previsao, media, descricao, maximo } = useGastosData().monthlySpending;
  const { x0, x1, bar, slot, barX } = barLayout(
    variant,
    size.width,
    meses.length,
    { x0: 48, bar: 40 },
    { x0: 40, bar: 30 },
  );
  const y = (v: number) => base - (v / maximo) * (144 + extra);
  const maxIndex = meses
    .slice(0, -1)
    .reduce((best, m, i, arr) => (m.valor > (arr[best]?.valor ?? 0) ? i : best), 0);
  const last = meses.length - 1;
  // "média R$ x" fica à esquerda, acima da linha; se encostar no valor de uma barra rotulada
  // (a mais alta ou a atual), vai para baixo da linha.
  const mediaLabelY =
    media === null
      ? null
      : (() => {
          const above = y(media) - 6;
          const width = textWidth(`média ${fmt(media)}`, 12);
          const hits = meses.some((mes, i) => {
            if (i !== maxIndex && i !== last) return false;
            const cx = barX(i) + bar / 2;
            const labelWidth = textWidth(fmt(mes.valor), 12, true);
            const overlapsX = cx + labelWidth / 2 > x0 + 4 && cx - labelWidth / 2 < x0 + 4 + width;
            return overlapsX && Math.abs(y(mes.valor) - 8 - above) < 14;
          });
          return hits ? y(media) + 15 : above;
        })();
  const points = meses.map((mes, i) => ({
    x: barX(i) + bar / 2,
    title: i === last ? `${mes.nome} (até hoje)` : mes.nome,
    rows: [
      { label: "Gasto", value: brl(mes.valor), color: chartColors.saidas },
      ...(i === last && previsao !== null
        ? [{ label: "Previsão do mês", value: brl(previsao), color: chartColors.saidas }]
        : []),
      ...(media !== null ? [{ label: "Média", value: brl(media), color: chartColors.mist }] : []),
    ],
  }));

  return (
    <ChartInspector className="size-full" points={points} label="Gasto por mês">
      <ChartSvg reveal="none" width={size.width} height={height} fill label={descricao}>
        <GridLines ticks={moneyTicks(maximo)} x0={x0} x1={x1} y={y} labelX={x0 - 8} />
        {meses.map((mes, i) => {
          const bx = barX(i);
          const cx = bx + bar / 2;
          const current = i === last;
          return (
            <g key={mes.rotulo}>
              {current && previsao !== null && (
                <rect
                  x={bx.toFixed(1)}
                  y={y(previsao).toFixed(1)}
                  width={bar}
                  height={(base - y(previsao)).toFixed(1)}
                  rx="4"
                  fill="none"
                  stroke={chartColors.saidas}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  {...buildAfter}
                />
              )}
              <path
                d={roundedBar(bx, y(mes.valor), bar, base)}
                fill={chartColors.saidas}
                fillOpacity={current ? 1 : 0.55}
                {...buildBar(i)}
              />
              {(i === maxIndex || current) && (
                <text
                  {...buildAfter}
                  {...halo}
                  x={cx.toFixed(1)}
                  // O valor fica em cima da barra dele (não da previsão tracejada, que é outro
                  // número e aparece na leitura e no rodapé).
                  y={(y(mes.valor) - 8).toFixed(1)}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  fill={chartColors.sand}
                >
                  {fmt(mes.valor)}
                </text>
              )}
              <AxisLabel x={cx} y={208 + extra} highlight={current}>
                {mes.rotulo}
              </AxisLabel>
            </g>
          );
        })}
        {media !== null && (
          <>
            <line
              x1={x0}
              x2={x1}
              y1={y(media).toFixed(1)}
              y2={y(media).toFixed(1)}
              stroke={chartColors.mist}
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
            <text
              {...halo}
              x={x0 + 4}
              y={(mediaLabelY ?? y(media) - 6).toFixed(1)}
              fontSize="12"
              fill={chartColors.mist}
            >
              média {fmt(media)}
            </text>
          </>
        )}
        <line x1={x0} x2={x1} y1={base} y2={base} stroke={chartColors.axis} />
        <InspectorLayer x0={x0} x1={x1} top={14} bottom={base} mode="band" bandWidth={slot} />
      </ChartSvg>
    </ChartInspector>
  );
}

/** Gasto médio por dia da semana; os dois dias mais caros ficam em destaque. */
export function WeekdaySpendingChart({ variant }: { variant: BarVariant }) {
  return (
    <ChartBox width={variant === "wide" ? 540 : 360} height={HEIGHT} stretchX minWidth={MIN_WIDTH}>
      {(size) => <WeekdayChart variant={variant} size={size} />}
    </ChartBox>
  );
}

function WeekdayChart({ variant, size }: { variant: BarVariant; size: Size }) {
  const { height } = size;
  const extra = height - HEIGHT;
  const base = BASE + extra;
  const { dias, descricao, maximo } = useGastosData().weekdaySpending;
  const { x0, x1, bar, slot, barX } = barLayout(
    variant,
    size.width,
    dias.length,
    { x0: 48, bar: 36 },
    { x0: 36, bar: 26 },
  );
  const y = (v: number) => base - (v / maximo) * (134.4 + extra);
  const top = [...dias]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 2)
    .map((d) => d.rotulo);
  const points = dias.map((dia, i) => ({
    x: barX(i) + bar / 2,
    title: dia.nome,
    rows: [{ label: "por dia, em média", value: brl(dia.valor), color: chartColors.saidas }],
  }));

  return (
    <ChartInspector className="size-full" points={points} label="Gasto médio por dia da semana">
      <ChartSvg reveal="none" width={size.width} height={height} fill label={descricao}>
        <GridLines
          ticks={[
            { value: 0, label: "0" },
            { value: maximo / 2, label: (maximo / 2).toLocaleString("pt-BR") },
            { value: maximo, label: maximo.toLocaleString("pt-BR") },
          ]}
          x0={x0}
          x1={x1}
          y={y}
          labelX={x0 - 8}
        />
        {dias.map((dia, i) => {
          const bx = barX(i);
          const cx = bx + bar / 2;
          const highlight = top.includes(dia.rotulo);
          return (
            <g key={dia.rotulo}>
              <path
                d={roundedBar(bx, y(dia.valor), bar, base)}
                fill={chartColors.saidas}
                fillOpacity={highlight ? 1 : 0.45}
                {...buildBar(i)}
              />
              {highlight && (
                <text
                  {...buildAfter}
                  {...halo}
                  x={cx.toFixed(1)}
                  y={(y(dia.valor) - 8).toFixed(1)}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  fill={chartColors.sand}
                >
                  {fmt(dia.valor)}
                </text>
              )}
              <AxisLabel x={cx} y={208 + extra} highlight={highlight}>
                {dia.rotulo}
              </AxisLabel>
            </g>
          );
        })}
        <line x1={x0} x2={x1} y1={base} y2={base} stroke={chartColors.axis} />
        <InspectorLayer x0={x0} x1={x1} top={14} bottom={base} mode="band" bandWidth={slot} />
      </ChartSvg>
    </ChartInspector>
  );
}
