import {
  AxisLabel,
  ChartSvg,
  GridLines,
  chartColors,
  roundedBar,
} from "@/components/charts/primitives";

import { monthlySpending, spendingPace, weekdaySpending } from "../data";

const BASE = 190;

type PaceVariant = "desktop" | "tablet" | "mobile";

const paceLayout: Record<
  PaceVariant,
  { width: number; x0: number; x1: number; labelSide: "left" | "right"; showClose: boolean }
> = {
  desktop: { width: 540, x0: 48, x1: 470, labelSide: "left", showClose: true },
  tablet: { width: 540, x0: 48, x1: 470, labelSide: "right", showClose: true },
  mobile: { width: 360, x0: 40, x1: 238, labelSide: "right", showClose: false },
};

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

/** Gasto acumulado do mês contra o mês anterior (linha tracejada). */
export function SpendingPaceChart({ variant }: { variant: PaceVariant }) {
  const { width, x0, x1, labelSide, showClose } = paceLayout[variant];
  const { setembro, agosto, hoje, descricao } = spendingPace;
  const step = (x1 - x0) / (agosto.length - 1);
  const x = (day: number) => x0 + (day - 1) * step;
  const y = (value: number) => BASE - (value / 6000) * 147.4;
  const line = (values: number[]) =>
    values.map((v, i) => `${i ? "L" : "M"}${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const xHoje = x(hoje);
  const setHoje = setembro[hoje - 1] ?? 0;
  const agoHoje = agosto[hoje - 1] ?? 0;
  const agoFim = agosto[agosto.length - 1] ?? 0;

  return (
    <ChartSvg width={width} height={230} label={descricao}>
      <GridLines
        ticks={[
          { value: 0, label: "0" },
          { value: 2000, label: "2 mil" },
          { value: 4000, label: "4 mil" },
          { value: 6000, label: "6 mil" },
        ]}
        x0={x0}
        x1={x1}
        y={y}
        labelX={x0 - 8}
      />
      <path
        d={line(agosto)}
        fill="none"
        stroke={chartColors.label}
        strokeWidth="2"
        strokeDasharray="6 5"
        strokeLinejoin="round"
      />
      <path
        d={`${line(setembro)} L${xHoje.toFixed(1)},${BASE} L${x0.toFixed(1)},${BASE} Z`}
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
      {setembro.map((v, i) => (
        <circle key={i} cx={x(i + 1).toFixed(1)} cy={y(v).toFixed(1)} r="9" fill="transparent">
          <title>{`Dia ${i + 1}: setembro ${fmt(v)} · agosto ${fmt(agosto[i] ?? 0)}`}</title>
        </circle>
      ))}
      <line
        x1={xHoje.toFixed(1)}
        x2={xHoje.toFixed(1)}
        y1="18"
        y2={BASE}
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
      {labelSide === "left" ? (
        <text
          x={(xHoje - 10).toFixed(1)}
          y={(y(setHoje) - 2).toFixed(1)}
          textAnchor="end"
          fontSize="13"
          fontWeight="800"
          fill={chartColors.sand}
        >
          Setembro {fmt(setHoje)}
        </text>
      ) : (
        <text
          x={(xHoje + 10).toFixed(1)}
          y={(y(setHoje) + 4).toFixed(1)}
          fontSize="13"
          fontWeight="800"
          fill={chartColors.sand}
        >
          Setembro {fmt(setHoje)}
        </text>
      )}
      <text
        x={(xHoje + 10).toFixed(1)}
        y={(y(agoHoje) + 14).toFixed(1)}
        fontSize="12"
        fill={chartColors.mist}
      >
        Agosto {fmt(agoHoje)}
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
      <line x1={x0} x2={x1} y1={BASE} y2={BASE} stroke={chartColors.axis} />
      {[1, 10, 20, hoje, agosto.length].map((day) => (
        <AxisLabel key={day} x={x(day)} y={208} highlight={day === hoje}>
          {day === hoje ? "hoje" : day}
        </AxisLabel>
      ))}
    </ChartSvg>
  );
}

type BarVariant = "wide" | "narrow";

function barLayout(
  variant: BarVariant,
  count: number,
  wide: { x0: number; bar: number },
  narrow: { x0: number; bar: number },
) {
  const width = variant === "wide" ? 540 : 360;
  const { x0, bar } = variant === "wide" ? wide : narrow;
  const x1 = variant === "wide" ? 520 : 352;
  const slot = (x1 - x0) / count;
  const shift = variant === "wide" ? 0 : -2;
  return { width, x0, x1, bar, barX: (i: number) => x0 + i * slot + (slot - bar) / 2 + shift };
}

/** Total gasto por mês, com a média dos meses anteriores e a previsão do mês atual. */
export function MonthlySpendingChart({ variant }: { variant: BarVariant }) {
  const { meses, previsao, media, descricao } = monthlySpending;
  const { width, x0, x1, bar, barX } = barLayout(
    variant,
    meses.length,
    { x0: 48, bar: 40 },
    { x0: 40, bar: 30 },
  );
  const y = (v: number) => BASE - (v / 6000) * 144;
  const maxIndex = meses
    .slice(0, -1)
    .reduce((best, m, i, arr) => (m.valor > (arr[best]?.valor ?? 0) ? i : best), 0);
  const last = meses.length - 1;

  return (
    <ChartSvg width={width} height={230} label={descricao}>
      <GridLines
        ticks={[
          { value: 0, label: "0" },
          { value: 2000, label: "2 mil" },
          { value: 4000, label: "4 mil" },
          { value: 6000, label: "6 mil" },
        ]}
        x0={x0}
        x1={x1}
        y={y}
        labelX={x0 - 8}
      />
      {meses.map((mes, i) => {
        const bx = barX(i);
        const cx = bx + bar / 2;
        const current = i === last;
        return (
          <g key={mes.rotulo}>
            {current && (
              <rect
                x={bx.toFixed(1)}
                y={y(previsao).toFixed(1)}
                width={bar}
                height={(BASE - y(previsao)).toFixed(1)}
                rx="4"
                fill="none"
                stroke={chartColors.saidas}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              >
                <title>{`Setembro: previsão de ${fmt(previsao)} no fim do mês`}</title>
              </rect>
            )}
            <path
              d={roundedBar(bx, y(mes.valor), bar, BASE)}
              fill={chartColors.saidas}
              fillOpacity={current ? 1 : 0.55}
            >
              <title>{`${mes.nome}: ${fmt(mes.valor)}${current ? " até o dia 23" : ""}`}</title>
            </path>
            {(i === maxIndex || current) && (
              <text
                x={cx.toFixed(1)}
                y={(y(current ? previsao : mes.valor) - (current ? 8 : 8)).toFixed(1)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill={chartColors.sand}
              >
                {fmt(mes.valor)}
              </text>
            )}
            <AxisLabel x={cx} y={208} highlight={current}>
              {mes.rotulo}
            </AxisLabel>
          </g>
        );
      })}
      <line
        x1={x0}
        x2={x1}
        y1={y(media).toFixed(1)}
        y2={y(media).toFixed(1)}
        stroke={chartColors.mist}
        strokeWidth="1.5"
        strokeDasharray="2 4"
      />
      <text x={x0 + 4} y={(y(media) - 6).toFixed(1)} fontSize="12" fill={chartColors.mist}>
        média {fmt(media)}
      </text>
      <line x1={x0} x2={x1} y1={BASE} y2={BASE} stroke={chartColors.axis} />
    </ChartSvg>
  );
}

/** Gasto médio por dia da semana; os dois dias mais caros ficam em destaque. */
export function WeekdaySpendingChart({ variant }: { variant: BarVariant }) {
  const { dias, descricao } = weekdaySpending;
  const { width, x0, x1, bar, barX } = barLayout(
    variant,
    dias.length,
    { x0: 48, bar: 36 },
    { x0: 36, bar: 26 },
  );
  const y = (v: number) => BASE - (v / 200) * 134.4;
  const top = [...dias]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 2)
    .map((d) => d.rotulo);

  return (
    <ChartSvg width={width} height={230} label={descricao}>
      <GridLines
        ticks={[
          { value: 0, label: "0" },
          { value: 100, label: "100" },
          { value: 200, label: "200" },
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
              d={roundedBar(bx, y(dia.valor), bar, BASE)}
              fill={chartColors.saidas}
              fillOpacity={highlight ? 1 : 0.45}
            >
              <title>{`${dia.nome}: ${fmt(dia.valor)} por dia, em média`}</title>
            </path>
            {highlight && (
              <text
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
            <AxisLabel x={cx} y={208} highlight={highlight}>
              {dia.rotulo}
            </AxisLabel>
          </g>
        );
      })}
      <line x1={x0} x2={x1} y1={BASE} y2={BASE} stroke={chartColors.axis} />
    </ChartSvg>
  );
}
