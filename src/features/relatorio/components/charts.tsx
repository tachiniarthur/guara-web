import { ChartSvg, chartColors } from "@/components/charts/primitives";

import { dailyBalance, weeklyFlow } from "../data";

export type ReportChartVariant = "desktop" | "tablet" | "mobile";

const boxes: Record<ReportChartVariant, { width: number; height: number; font: number }> = {
  desktop: { width: 900, height: 320, font: 12 },
  tablet: { width: 700, height: 280, font: 12 },
  mobile: { width: 340, height: 240, font: 11 },
};

const X0 = 52;
const TOP = 40;
/** Fundo da área sob o saldo (arara bem escura). */
const AREA_FILL = "#172838";

function frame(variant: ReportChartVariant) {
  const box = boxes[variant];
  return { ...box, x1: box.width - 16, bottom: box.height - 34 };
}

function GridLine({
  y,
  x1,
  label,
  font,
  solid,
}: {
  y: number;
  x1: number;
  label: string;
  font: number;
  solid?: boolean;
}) {
  return (
    <>
      <line
        x1={X0}
        x2={x1}
        y1={y.toFixed(1)}
        y2={y.toFixed(1)}
        stroke={solid ? chartColors.axis : chartColors.grid}
        strokeDasharray={solid ? "0" : "2 4"}
      />
      <text x="44" y={(y + 4).toFixed(1)} textAnchor="end" fontSize={font} fill={chartColors.label}>
        {label}
      </text>
    </>
  );
}

/** Saldo dia a dia, com projeção tracejada até o fim do mês e os movimentos que mais pesaram. */
export function BalanceChart({ variant }: { variant: ReportChartVariant }) {
  const { width, height, font, x1, bottom } = frame(variant);
  const { daysInMonth, today, values, projection, events, axisDays, label } = dailyBalance;
  const min = 8000;
  const max = 17000;
  const x = (day: number) => X0 + ((day - 1) * (x1 - X0)) / (daysInMonth - 1);
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - TOP);
  const points = (list: number[], firstDay: number) =>
    list
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(firstDay + i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
  const line = points(values, 1);
  const eventColor = { arara: chartColors.arara, urucum: chartColors.urucum };

  return (
    <ChartSvg width={width} height={height} label={label}>
      {[8000, 12000, 16000].map((tick) => (
        <GridLine key={tick} y={y(tick)} x1={x1} label={`${tick / 1000} mil`} font={font} />
      ))}
      <path d={`${line} L${x(today).toFixed(1)},${bottom} L${X0}.0,${bottom} Z`} fill={AREA_FILL} />
      <path
        d={line}
        fill="none"
        stroke={chartColors.arara}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d={points(projection, today)}
        fill="none"
        stroke={chartColors.arara}
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <line x1={X0} x2={x1} y1={bottom} y2={bottom} stroke={chartColors.axis} />
      {events.map((event) => {
        const cx = x(event.day);
        const cy = y(values[event.day - 1]!);
        const labelY = event.labelRow === 0 ? 26 : 46;
        return (
          <g key={event.day}>
            <line
              x1={cx.toFixed(1)}
              x2={cx.toFixed(1)}
              y1={(labelY + 6).toFixed(1)}
              y2={(cy - 7).toFixed(1)}
              stroke={eventColor[event.tone]}
              strokeWidth="1"
              opacity=".7"
            />
            <circle
              cx={cx.toFixed(1)}
              cy={cy.toFixed(1)}
              r="5.5"
              fill={chartColors.card}
              stroke={eventColor[event.tone]}
              strokeWidth="2.4"
            />
            <text
              x={cx.toFixed(1)}
              y={labelY.toFixed(1)}
              textAnchor="middle"
              fontSize={font}
              fontWeight="700"
              fill={event.tone === "urucum" ? chartColors.urucum : chartColors.sand}
            >
              {event.label}
            </text>
          </g>
        );
      })}
      {[
        ...axisDays.filter((day) => day < today),
        today,
        ...axisDays.filter((day) => day > today),
      ].map((day) => (
        <text
          key={day}
          x={x(day).toFixed(1)}
          y={height - 10}
          textAnchor="middle"
          fontSize={font}
          fill={day === today ? chartColors.sand : chartColors.label}
          fontWeight={day === today ? "700" : "400"}
        >
          {day === today ? "hoje" : day}
        </text>
      ))}
    </ChartSvg>
  );
}

const brl = (value: number) => value.toLocaleString("pt-BR");
const thousands = (value: number) => (value / 1000).toFixed(1).replace(".", ",");

/** Entradas e saídas por semana, em pares de barras. */
export function WeeklyFlowChart({ variant }: { variant: ReportChartVariant }) {
  const { width, height, font, x1, bottom } = frame(variant);
  const compact = variant === "mobile";
  const max = 8000;
  const y = (v: number) => bottom - (v / max) * (bottom - TOP);
  const group = (x1 - X0) / weeklyFlow.weeks.length;
  const bar = Math.min(46, group * 0.28);
  const format = compact ? thousands : brl;

  return (
    <ChartSvg width={width} height={height} label={weeklyFlow.label}>
      <GridLine y={y(0)} x1={x1} label="0" font={font} solid />
      <GridLine y={y(4000)} x1={x1} label={compact ? "4" : "4 mil"} font={font} />
      <GridLine y={y(8000)} x1={x1} label={compact ? "8" : "8 mil"} font={font} />
      {weeklyFlow.weeks.map((week, i) => {
        const center = X0 + (i + 0.5) * group;
        const bars = [
          { key: "entrou", value: week.entrou, x: center - 2 - bar, color: chartColors.arara },
          { key: "saiu", value: week.saiu, x: center + 2, color: chartColors.urucum },
        ];
        return (
          <g key={week.label}>
            {bars.map((item) =>
              item.value > 0 ? (
                <g key={item.key}>
                  <rect
                    x={item.x.toFixed(1)}
                    y={y(item.value).toFixed(1)}
                    width={bar.toFixed(1)}
                    height={(bottom - y(item.value)).toFixed(1)}
                    rx="5"
                    fill={item.color}
                  />
                  <text
                    x={(item.x + bar / 2).toFixed(1)}
                    y={(y(item.value) - 8).toFixed(1)}
                    textAnchor="middle"
                    fontSize={font}
                    fontWeight="700"
                    fill={item.color}
                  >
                    {format(item.value)}
                  </text>
                </g>
              ) : (
                <text
                  key={item.key}
                  x={(item.x + bar / 2).toFixed(1)}
                  y={(bottom - 8).toFixed(1)}
                  textAnchor="middle"
                  fontSize={font}
                  fill={chartColors.label}
                >
                  0
                </text>
              ),
            )}
            <text
              x={center.toFixed(1)}
              y={height - 10}
              textAnchor="middle"
              fontSize={font}
              fill={chartColors.label}
            >
              {compact ? week.short : week.label}
            </text>
          </g>
        );
      })}
    </ChartSvg>
  );
}
