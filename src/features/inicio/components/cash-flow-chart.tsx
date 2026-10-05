import { rem } from "@/lib/rem";

import { cashFlow } from "../data";

/** Área do gráfico em unidades do viewBox (iguais ao protótipo). */
const X0 = 52;
const X1 = 510;
const Y0 = 140;
const Y_TOP = 14;
const ENTRADAS = "#6DB3EC";
const SAIDAS = "#E0935A";

const FONT = "var(--font-figtree), Figtree, system-ui, sans-serif";

function scale(diasNoMes: number, maximo: number) {
  const step = (X1 - X0) / (diasNoMes - 1);
  return {
    x: (dia: number) => X0 + (dia - 1) * step,
    y: (valor: number) => Y0 - (valor / maximo) * (Y0 - Y_TOP),
  };
}

/** Linha em degraus: cada dia é um patamar até o próximo lançamento. */
function stepPath(values: number[], x: (d: number) => number, y: (v: number) => number) {
  return values
    .map((value, i) =>
      i === 0
        ? `M${x(1).toFixed(1)},${y(value).toFixed(1)}`
        : `H${x(i + 1).toFixed(1)} V${y(value).toFixed(1)}`,
    )
    .join(" ");
}

/**
 * Entradas e saídas acumuladas no mês, com previsão tracejada até o fim.
 * "wide": rótulos à direita (desktop e tablet) · "compact": letras maiores e legenda fora (mobile).
 */
export function CashFlowChart({ variant }: { variant: "wide" | "compact" }) {
  const { diasNoMes, hoje, entradas, saidas, previsaoSaidas, eixo, maximo, sobrou, descricao } =
    cashFlow;
  const { x, y } = scale(diasNoMes, maximo);
  const compact = variant === "compact";
  const fontSize = compact ? 19 : 12;
  const xHoje = x(hoje);
  const ultimaEntrada = entradas[entradas.length - 1] ?? 0;
  const ultimaSaida = saidas[saidas.length - 1] ?? 0;

  // Área entre as duas linhas (sobra acumulada).
  const top = entradas.flatMap((v, i) => [
    [x(i + 1), y(v)],
    [x(i + 2 > hoje ? hoje : i + 2), y(v)],
  ]);
  const bottom = saidas
    .flatMap((v, i) => [
      [x(i + 1), y(v)],
      [x(i + 2 > hoje ? hoje : i + 2), y(v)],
    ])
    .reverse();
  const area = [...top, ...bottom]
    .map(([px, py]) => `${px!.toFixed(1)},${py!.toFixed(1)}`)
    .join(" ");

  const ticks = [1, 10, 20, hoje, diasNoMes];

  return (
    <svg
      width="100%"
      style={{ width: rem(compact ? 538 : 660) }}
      viewBox={compact ? "-8 0 538 180" : "0 0 660 170"}
      role="img"
      aria-label={descricao}
      className="block h-auto max-w-full"
      fontFamily={FONT}
    >
      {eixo.map((tick) => (
        <g key={tick.valor}>
          <line
            x1={X0}
            x2={X1}
            y1={y(tick.valor)}
            y2={y(tick.valor)}
            stroke="#25322B"
            strokeDasharray="3 5"
          />
          <text
            x={compact ? 44 : 42}
            y={y(tick.valor) + 4}
            textAnchor="end"
            fontSize={fontSize}
            fill="#93A198"
          >
            {tick.rotulo}
          </text>
        </g>
      ))}
      <polygon points={area} fill={ENTRADAS} fillOpacity=".14" />
      <path
        d={stepPath(entradas, x, y)}
        fill="none"
        stroke={ENTRADAS}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d={stepPath(saidas, x, y)}
        fill="none"
        stroke={SAIDAS}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d={`M${xHoje.toFixed(1)},${y(ultimaEntrada).toFixed(1)} H${X1}`}
        stroke={ENTRADAS}
        strokeWidth="2.5"
        strokeDasharray="6 6"
        fill="none"
      />
      <path
        d={`M${xHoje.toFixed(1)},${y(ultimaSaida).toFixed(1)} L${X1},${y(previsaoSaidas).toFixed(1)}`}
        stroke={SAIDAS}
        strokeWidth="2.5"
        strokeDasharray="6 6"
        fill="none"
      />
      {!compact && (
        <>
          <text x="520" y={y(ultimaEntrada) + 5} fontSize="13" fontWeight="800" fill={ENTRADAS}>
            Entradas R$ 8.200
          </text>
          <text x="520" y={y(previsaoSaidas) + 5} fontSize="13" fontWeight="800" fill={SAIDAS}>
            Saídas R$ 6.050
          </text>
          <text x="520" y={y(previsaoSaidas) + 21} fontSize="12" fill="#93A198">
            previsão até dia 30
          </text>
        </>
      )}
      {compact ? (
        <>
          <rect x={xHoje - 180} y="18" width="200" height="40" rx="20" fill="#F2EFE6" />
          <text
            x={xHoje - 80}
            y="45"
            textAnchor="middle"
            fontSize="19"
            fontWeight="800"
            fill="#0B110E"
          >
            Sobrou {sobrou}
          </text>
        </>
      ) : (
        <>
          <rect
            x={xHoje - 150}
            y={y(ultimaEntrada) + 1}
            width="140"
            height="30"
            rx="15"
            fill="#F2EFE6"
          />
          <text
            x={xHoje - 80}
            y={y(ultimaEntrada) + 21}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill="#0B110E"
          >
            Sobrou {sobrou}
          </text>
        </>
      )}
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="#34443B" />
      {ticks.map((dia) => (
        <text
          key={dia}
          x={x(dia)}
          y={compact ? 174 : 164}
          textAnchor="middle"
          fontSize={fontSize}
          fill={dia === hoje ? "#F2EFE6" : "#93A198"}
          fontWeight={dia === hoje ? 800 : 400}
        >
          {dia === hoje ? "hoje" : dia}
        </text>
      ))}
    </svg>
  );
}

/** Legenda do gráfico compacto. */
export function CashFlowLegend() {
  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-12 text-mist">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-[3px] w-3.5 rounded-xs bg-arara" />
        Entradas
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-[3px] w-3.5 rounded-xs bg-[#E0935A]" />
        Saídas
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-3.5 border-t-2 border-dashed border-caption" />
        Previsão até dia 30
      </span>
    </div>
  );
}
