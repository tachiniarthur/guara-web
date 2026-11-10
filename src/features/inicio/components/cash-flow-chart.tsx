"use client";

import { ChartBox } from "@/components/charts/chart-box";
import { ChartInspector, InspectorLayer, type InspectPoint } from "@/components/charts/inspector";
import { formatCurrency, formatReais } from "@/lib/format";

import { cashFlow, type CashFlowData } from "../data";

/** Área do gráfico em unidades do viewBox (iguais ao protótipo, no tamanho natural). */
const X0 = 52;
const Y_TOP = 14;
/** Tamanho natural do viewBox: largo (rótulos à direita) e compacto (celular). */
const WIDE = { width: 660, height: 170 } as const;
const COMPACT = { width: 538, height: 180 } as const;
/** Espaço à direita da área para os rótulos (largo) e a borda (compacto). */
const WIDE_LABELS = 150;
/** Distância mínima entre os rótulos de entradas e saídas (uma linha de texto). */
const LABEL_GAP = 17;
const ENTRADAS = "#6DB3EC";
const SAIDAS = "#E0935A";

const FONT = "var(--font-figtree), Figtree, system-ui, sans-serif";

function scale(diasNoMes: number, maximo: number, x1: number, y0: number) {
  const step = (x1 - X0) / (diasNoMes - 1);
  return {
    x: (dia: number) => X0 + (dia - 1) * step,
    y: (valor: number) => y0 - (valor / maximo) * (y0 - Y_TOP),
  };
}

/**
 * Altura (y) dos rótulos de entradas e saídas à direita: no ponto de cada linha, afastados quando
 * os valores são parecidos (com espaço para a "previsão" embaixo do de saídas).
 */
export function endLabels(entradas: number, saidas: number, note: boolean) {
  if (entradas <= saidas) {
    // Entradas em cima: a nota da previsão fica embaixo das saídas, sem conflito.
    if (saidas - entradas >= LABEL_GAP) return { entradas, saidas };
    const mid = (entradas + saidas) / 2;
    return { entradas: mid - LABEL_GAP / 2, saidas: mid + LABEL_GAP / 2 };
  }
  // Saídas em cima: a nota fica entre as duas.
  const need = LABEL_GAP + (note ? 16 : 0);
  if (entradas - saidas >= need) return { entradas, saidas };
  const mid = (entradas + saidas) / 2;
  return { saidas: mid - need / 2, entradas: mid + need / 2 };
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
 * Ocupa a largura e a altura do bloco (o largo alarga sem aumentar o texto).
 */
export function CashFlowChart({
  variant,
  data = cashFlow,
}: {
  variant: "wide" | "compact";
  data?: CashFlowData;
}) {
  const natural = variant === "compact" ? COMPACT : WIDE;
  return (
    <ChartBox width={natural.width} height={natural.height} stretchX={variant === "wide"}>
      {(size) => <CashFlowSvg variant={variant} data={data} size={size} />}
    </ChartBox>
  );
}

function CashFlowSvg({
  variant,
  data,
  size,
}: {
  variant: "wide" | "compact";
  data: CashFlowData;
  size: { width: number; height: number };
}) {
  const { diasNoMes, hoje, entradas, saidas, eixo, maximo, sobrou, descricao } = data;
  const compact = variant === "compact";
  const extra = size.height - (compact ? COMPACT.height : WIDE.height);
  const X1 = compact ? 510 : size.width - WIDE_LABELS;
  const Y0 = 140 + extra;
  const { x, y } = scale(diasNoMes, maximo, X1, Y0);
  const fontSize = compact ? 19 : 12;
  const xHoje = x(hoje);
  // Pílula "Sobrou" à esquerda de hoje; no começo do mês, encosta no início do gráfico.
  const pillLeft = (width: number) => Math.max(4, xHoje - width - 10);
  const ultimaEntrada = entradas[entradas.length - 1] ?? 0;
  const ultimaSaida = saidas[saidas.length - 1] ?? 0;
  // Sem previsão (sem teto total), a linha de saídas segue reta até o fim do mês.
  const previsaoSaidas = data.previsaoSaidas ?? ultimaSaida;
  const labels = endLabels(
    y(ultimaEntrada) + 5,
    y(previsaoSaidas) + 5,
    data.previsaoSaidas !== null,
  );

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

  // Dia que encostaria no "hoje" sai (o "hoje" fica).
  const ticks = [...new Set([1, 10, 20, hoje, diasNoMes])].filter(
    (dia) => dia === hoje || Math.abs(x(dia) - xHoje) >= (compact ? 34 : 24),
  );
  // Leitura dia a dia (até hoje): entradas e saídas acumuladas.
  const points: InspectPoint[] = entradas.map((entrada, i) => {
    const saida = saidas[i] ?? 0;
    return {
      x: x(i + 1),
      title: i + 1 === hoje ? `Hoje, dia ${hoje}` : `Dia ${i + 1}`,
      rows: [
        { label: "Entradas", value: formatReais(entrada), color: ENTRADAS, y: y(entrada) },
        { label: "Saídas", value: formatReais(saida), color: SAIDAS, y: y(saida) },
      ],
    };
  });

  return (
    <ChartInspector
      className="size-full"
      points={points}
      label="Entradas e saídas do mês, dia a dia"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={compact ? `-8 0 ${size.width} ${size.height}` : `0 0 ${size.width} ${size.height}`}
        role="img"
        aria-label={descricao}
        className="block animate-reveal-x"
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
            <text x={X1 + 10} y={labels.entradas} fontSize="13" fontWeight="800" fill={ENTRADAS}>
              Entradas {formatCurrency(Math.round(ultimaEntrada * 100)).replace(/,\d{2}$/, "")}
            </text>
            <text x={X1 + 10} y={labels.saidas} fontSize="13" fontWeight="800" fill={SAIDAS}>
              Saídas {formatCurrency(Math.round(previsaoSaidas * 100)).replace(/,\d{2}$/, "")}
            </text>
            {data.previsaoSaidas !== null && (
              <text x={X1 + 10} y={labels.saidas + 16} fontSize="12" fill="#93A198">
                previsão até dia {diasNoMes}
              </text>
            )}
          </>
        )}
        {compact ? (
          <>
            <rect x={pillLeft(200)} y="18" width="200" height="40" rx="20" fill="#F2EFE6" />
            <text
              x={pillLeft(200) + 100}
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
              x={pillLeft(140)}
              y={y(ultimaEntrada) + 1}
              width="140"
              height="30"
              rx="15"
              fill="#F2EFE6"
            />
            <text
              x={pillLeft(140) + 70}
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
            y={(compact ? 174 : 164) + extra}
            textAnchor="middle"
            fontSize={fontSize}
            fill={dia === hoje ? "#F2EFE6" : "#93A198"}
            fontWeight={dia === hoje ? 800 : 400}
          >
            {dia === hoje ? "hoje" : dia}
          </text>
        ))}
        <InspectorLayer x0={X0 - 8} x1={X1} top={Y_TOP - 6} bottom={Y0} />
      </svg>
    </ChartInspector>
  );
}

/** Legenda do gráfico compacto. */
export function CashFlowLegend({ data = cashFlow }: { data?: CashFlowData }) {
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
      {data.previsaoSaidas !== null && (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3.5 border-t-2 border-dashed border-caption" />
          Previsão até dia {data.diasNoMes}
        </span>
      )}
    </div>
  );
}
