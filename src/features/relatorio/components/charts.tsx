import { ChartInspector, InspectorLayer, type InspectPoint } from "@/components/charts/inspector";
import { ChartSvg, chartColors } from "@/components/charts/primitives";
import { formatReais } from "@/lib/format";

import type { BalanceSeries, FlowSeries } from "../view";

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

/** Passo "redondo" (1, 2 ou 5 vezes uma potência de 10) para cerca de `count` faixas. */
function niceStep(span: number, count: number) {
  const raw = Math.max(span, 1) / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
}

/** Escala que cobre os valores com folga e as linhas de grade nela (regra pura, testada). */
export function niceScale(input: number[], count = 3, fromZero = false) {
  const values = input.length > 0 ? input : [0];
  const lo = fromZero ? 0 : Math.min(...values);
  const hi = Math.max(...values, lo + 1);
  const step = niceStep(hi - lo, count);
  const min = fromZero ? 0 : Math.floor(lo / step) * step;
  const max = Math.max(Math.ceil(hi / step) * step, min + step);
  const ticks: number[] = [];
  for (let tick = min; tick <= max + step / 2; tick += step) ticks.push(tick);
  return { min, max, ticks };
}

/** "16 mil", "1,2 mi", "800", "−2 mil" (`compact`: "16", "1,2 mi"). */
export function axisMoney(value: number, compact = false) {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000)
    return `${sign}${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1000) {
    const k = (abs / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    return compact ? `${sign}${k}` : `${sign}${k} mil`;
  }
  return `${sign}${Math.round(abs)}`;
}

/** Saldo ponto a ponto, com projeção tracejada e os movimentos que mais pesaram. */
export function BalanceChart({
  variant,
  series,
}: {
  variant: ReportChartVariant;
  series: BalanceSeries;
}) {
  const { width, height, font, x1, bottom } = frame(variant);
  const { values, projection, titles, projectionTitles, events, axis, label } = series;
  const last = values.length - 1;
  const slots = Math.max(2, values.length + Math.max(0, projection.length - 1));
  const { min, max, ticks } = niceScale([...values, ...projection]);
  const x = (i: number) => X0 + (i * (x1 - X0)) / (slots - 1);
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - TOP);
  const points = (list: number[], first: number) =>
    list
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(first + i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
  const line = points(values, 0);
  const eventColor = { arara: chartColors.arara, urucum: chartColors.urucum };
  // Leitura: o saldo de cada ponto real; dali em diante, a previsão.
  const inspect: InspectPoint[] = [
    ...values.map((v, i) => ({
      x: x(i),
      title: titles[i] ?? "",
      rows: [
        { label: "Saldo", value: formatReais(v), color: chartColors.arara, y: y(v) },
        ...events
          .filter((event) => event.index === i)
          .map((event) => ({
            label: "pesou no saldo",
            value: event.label,
            color: eventColor[event.tone],
          })),
      ],
    })),
    ...projection.slice(1).map((v, i) => ({
      x: x(last + i + 1),
      title: projectionTitles[i] ?? "",
      rows: [{ label: "Saldo previsto", value: formatReais(v), color: chartColors.arara, y: y(v) }],
    })),
  ];

  return (
    <ChartInspector points={inspect} label="Saldo">
      <ChartSvg reveal="none" width={width} height={height} label={label}>
        {ticks.map((tick) => (
          <GridLine key={tick} y={y(tick)} x1={x1} label={axisMoney(tick)} font={font} />
        ))}
        {/* Construído desde o zero: a linha se desenha, depois vêm a área, a previsão e os eventos. */}
        <path
          d={`${line} L${x(last).toFixed(1)},${bottom} L${X0}.0,${bottom} Z`}
          fill={AREA_FILL}
          className="build-after"
        />
        <path
          d={line}
          pathLength={1}
          fill="none"
          stroke={chartColors.arara}
          strokeWidth="2.6"
          strokeLinejoin="round"
          className="build-line"
        />
        {projection.length > 1 && (
          <path
            d={points(projection, last)}
            fill="none"
            stroke={chartColors.arara}
            strokeWidth="2"
            strokeDasharray="5 5"
            className="build-after"
          />
        )}
        <line x1={X0} x2={x1} y1={bottom} y2={bottom} stroke={chartColors.axis} />
        {events.map((event) => {
          const cx = x(event.index);
          const cy = y(values[event.index] ?? 0);
          const labelY = event.labelRow === 0 ? 26 : 46;
          // Perto das bordas o texto cresce para dentro, para não sair do gráfico.
          const anchor = cx < X0 + 70 ? "start" : cx > x1 - 70 ? "end" : "middle";
          return (
            <g key={`${event.index}-${event.tone}`} className="build-after">
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
                textAnchor={anchor}
                fontSize={font}
                fontWeight="700"
                fill={event.tone === "urucum" ? chartColors.urucum : chartColors.sand}
              >
                {event.label}
              </text>
            </g>
          );
        })}
        {axis.map((tick) => (
          <text
            key={tick.index}
            x={x(tick.index).toFixed(1)}
            y={height - 10}
            textAnchor="middle"
            fontSize={font}
            fill={tick.strong ? chartColors.sand : chartColors.label}
            fontWeight={tick.strong ? "700" : "400"}
          >
            {tick.label}
          </text>
        ))}
        <InspectorLayer x0={X0 - 6} x1={x1 + 6} top={TOP - 10} bottom={bottom} />
      </ChartSvg>
    </ChartInspector>
  );
}

/** Entradas e saídas por grupo (dia, semana ou mês), em pares de barras. */
export function FlowChart({
  variant,
  series,
}: {
  variant: ReportChartVariant;
  series: FlowSeries;
}) {
  const { width, height, font, x1, bottom } = frame(variant);
  const compact = variant === "mobile";
  const { groups } = series;
  const { max, ticks } = niceScale(
    groups.flatMap((group) => [group.entrou, group.saiu]),
    2,
    true,
  );
  const y = (v: number) => bottom - (Math.max(0, v) / max) * (bottom - TOP);
  const group = (x1 - X0) / Math.max(1, groups.length);
  const bar = Math.min(46, group * 0.28);
  // Com muitos grupos o valor fica só na leitura do gráfico (os textos se encostariam).
  const showValues = group >= (compact ? 60 : 70);
  // Rótulos do eixo: todos se couberem, senão um sim, um não (o último sempre).
  const every = group >= (compact ? 34 : 56) ? 1 : 2;
  const inspect = groups.map((item, i) => ({
    x: X0 + (i + 0.5) * group,
    title: item.label.replace("*", " (até hoje)"),
    rows: [
      { label: "Entrou", value: formatReais(item.entrou), color: chartColors.arara },
      { label: "Saiu", value: formatReais(item.saiu), color: chartColors.urucum },
    ],
  }));

  return (
    <ChartInspector points={inspect} label="Entradas e saídas">
      <ChartSvg reveal="none" width={width} height={height} label={series.label}>
        {ticks.map((tick) => (
          <GridLine
            key={tick}
            y={y(tick)}
            x1={x1}
            label={axisMoney(tick, compact)}
            font={font}
            solid={tick === 0}
          />
        ))}
        {groups.map((item, i) => {
          const center = X0 + (i + 0.5) * group;
          const bars = [
            { key: "entrou", value: item.entrou, x: center - 2 - bar, color: chartColors.arara },
            { key: "saiu", value: item.saiu, x: center + 2, color: chartColors.urucum },
          ];
          const labelled = (groups.length - 1 - i) % every === 0;
          return (
            <g key={`${item.label}-${i}`}>
              {bars.map((entry) =>
                entry.value > 0 ? (
                  <g key={entry.key}>
                    {/* Cada barra cresce da base, uma depois da outra; o valor aparece depois. */}
                    <rect
                      x={entry.x.toFixed(1)}
                      y={y(entry.value).toFixed(1)}
                      width={bar.toFixed(1)}
                      height={(bottom - y(entry.value)).toFixed(1)}
                      rx={Math.min(5, bar / 2).toFixed(1)}
                      fill={entry.color}
                      className="build-bar"
                      style={{
                        animationDelay: `${(i * 2 + (entry.key === "saiu" ? 1 : 0)) * Math.min(90, 720 / groups.length)}ms`,
                      }}
                    />
                    {showValues && (
                      <text
                        className="build-after"
                        x={(entry.x + bar / 2).toFixed(1)}
                        y={(y(entry.value) - 8).toFixed(1)}
                        textAnchor="middle"
                        fontSize={font}
                        fontWeight="700"
                        fill={entry.color}
                      >
                        {compact ? thousands(entry.value) : brl(entry.value)}
                      </text>
                    )}
                  </g>
                ) : (
                  showValues && (
                    <text
                      key={entry.key}
                      x={(entry.x + bar / 2).toFixed(1)}
                      y={(bottom - 8).toFixed(1)}
                      textAnchor="middle"
                      fontSize={font}
                      fill={chartColors.label}
                    >
                      0
                    </text>
                  )
                ),
              )}
              {labelled && (
                <text
                  x={center.toFixed(1)}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize={font}
                  fill={chartColors.label}
                >
                  {compact || groups.length > 4 ? item.short : item.label}
                </text>
              )}
            </g>
          );
        })}
        <InspectorLayer
          x0={X0}
          x1={x1}
          top={TOP - 10}
          bottom={bottom}
          mode="band"
          bandWidth={group}
        />
      </ChartSvg>
    </ChartInspector>
  );
}

const brl = (value: number) => Math.round(value).toLocaleString("pt-BR");
const thousands = (value: number) => (value / 1000).toFixed(1).replace(".", ",");
