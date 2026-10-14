import type { ChartLine } from "../more";

/**
 * Linhas mensais com grade (a primeira com área) e rótulos de mês embaixo. A área do gráfico
 * vai de x=34 até a borda menos 8 e de y=10 até a base menos 24, como nos protótipos.
 */
export function LineChart({
  lines,
  domain,
  ticks,
  tickLabel = String,
  xLabels,
  label,
  width,
  height,
  target,
}: {
  lines: ChartLine[];
  domain: [number, number];
  /** Valores com linha de grade. */
  ticks: number[];
  tickLabel?: (value: number) => string;
  /** Rótulos embaixo, pelo índice do ponto. */
  xLabels: { index: number; label: string }[];
  label: string;
  width: number;
  height: number;
  /** Linha tracejada da meta, com rótulo no canto direito. */
  target?: { value: number; label: string; color: string };
}) {
  const [min, max] = domain;
  const left = 34;
  const right = width - 8;
  const bottom = height - 24;
  const count = lines[0]?.valores.length ?? 2;
  const x = (i: number) => left + (i * (right - left)) / (count - 1);
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - 10);
  const font = { fontFamily: "var(--font-sans)" };
  const points = (values: number[]) =>
    values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={right} y1={y(t)} y2={y(t)} stroke="#25322B" />
          <text x={28} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#93A198" style={font}>
            {tickLabel(t)}
          </text>
        </g>
      ))}
      {target && (
        <>
          <line
            x1={left}
            x2={right}
            y1={y(target.value)}
            y2={y(target.value)}
            stroke={target.color}
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text
            x={right}
            y={y(target.value) - 5}
            textAnchor="end"
            fontSize="10"
            fontWeight="700"
            fill={target.color}
            style={font}
          >
            {target.label}
          </text>
        </>
      )}
      {lines.map((line, n) => {
        const pts = points(line.valores);
        const last = pts[pts.length - 1]?.split(",") ?? ["0", "0"];
        return (
          <g key={line.nome}>
            {n === 0 && (
              <path
                d={`M${pts.join(" L")} L${right.toFixed(1)},${bottom} L${left.toFixed(1)},${bottom} Z`}
                fill={line.cor}
                opacity=".12"
              />
            )}
            <path
              d={`M${pts.join(" L")}`}
              fill="none"
              stroke={line.cor}
              strokeWidth={line.tracejada ? 1.8 : 2.4}
              strokeDasharray={line.tracejada ? "5 4" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={last[0]} cy={last[1]} r="3.5" fill={line.cor} />
          </g>
        );
      })}
      {xLabels.map((item) => (
        <text
          key={item.label}
          x={x(item.index).toFixed(1)}
          y={height - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#93A198"
          style={font}
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
}

const twelveMonths = [
  { index: 0, label: "out/25" },
  { index: 3, label: "jan/26" },
  { index: 6, label: "abr/26" },
  { index: 9, label: "jul/26" },
  { index: 11, label: "set/26" },
];

/** 12 meses do ativo (e do índice comparado): 340×180 no celular e tablet, 900×300 no desktop. */
export function LineCompareChart({
  lines,
  domain,
  ticks,
  label,
  size,
}: {
  lines: ChartLine[];
  domain: [number, number];
  ticks: number[];
  label: string;
  size: "compact" | "wide";
}) {
  const [width, height] = size === "wide" ? [900, 300] : [340, 180];
  return (
    <LineChart
      lines={lines}
      domain={domain}
      ticks={ticks}
      xLabels={twelveMonths}
      label={label}
      width={width}
      height={height}
    />
  );
}
