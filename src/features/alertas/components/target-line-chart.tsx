/**
 * Preço dos últimos 30 dias com a linha tracejada do alvo (detalhe de um alerta de preço).
 * Celular e tablet: 340×170 · desktop: 700×230.
 */
export function TargetLineChart({
  prices,
  low,
  high,
  target,
  tickLabel,
  label,
  lastLabel = "23/09",
  wide,
}: {
  prices: number[];
  /** Faixa do eixo (linha de baixo e de cima). */
  low: number;
  high: number;
  target: { value: number; label: string };
  tickLabel: (v: number) => string;
  label: string;
  /** Rótulo do último ponto ("23/09" ou "hoje" quando o alerta disparou). */
  lastLabel?: string;
  wide?: boolean;
}) {
  const width = wide ? 700 : 340;
  const height = wide ? 230 : 170;
  const x0 = 52;
  const x1 = width - 10;
  const yLow = wide ? 190.9 : 135.5;
  const yHigh = wide ? 40.2 : 30.9;
  const bottom = wide ? 206 : 146;
  const x = (i: number) => x0 + (i * (x1 - x0)) / (prices.length - 1);
  const y = (v: number) => yLow - ((v - low) / (high - low)) * (yLow - yHigh);
  const f = (n: number) => n.toFixed(1);
  const line = prices.map((p, i) => `${i ? "L" : "M"}${f(x(i))},${f(y(p))}`).join(" ");
  const area = `${line} L${f(x1)},${bottom} L${f(x0)},${bottom} Z`;
  const ticks = [low, (low + high) / 2, high];
  const dates = [
    { i: 0, text: "24/08", anchor: "start" },
    { i: 10, text: "03/09", anchor: "middle" },
    { i: 20, text: "13/09", anchor: "middle" },
    { i: prices.length - 1, text: lastLabel, anchor: "end" },
  ] as const;
  const last = prices.length - 1;
  const text = { fontSize: 10, style: { fontFamily: "var(--font-sans)" } } as const;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
    >
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x0} x2={x1} y1={f(y(v))} y2={f(y(v))} stroke="#25322B" />
          <text x={x0 - 6} y={f(y(v) + 4)} textAnchor="end" fill="#93A198" {...text}>
            {tickLabel(v)}
          </text>
        </g>
      ))}
      <line
        x1={x0}
        x2={x1}
        y1={f(y(target.value))}
        y2={f(y(target.value))}
        stroke="#6CC08E"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <text
        x={x1}
        y={f(y(target.value) - 5)}
        textAnchor="end"
        fontWeight="700"
        fill="#6CC08E"
        {...text}
      >
        {target.label}
      </text>
      <path d={area} fill="#F2C230" opacity=".12" />
      <path
        d={line}
        fill="none"
        stroke="#F2C230"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={f(x(last))} cy={f(y(prices[last] ?? low))} r="3.5" fill="#F2C230" />
      {dates.map((d) => (
        <text
          key={d.text}
          x={f(x(d.i))}
          y={height - 6}
          textAnchor={d.anchor}
          fill="#93A198"
          {...text}
        >
          {d.text}
        </text>
      ))}
    </svg>
  );
}
