"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { chartColors } from "./primitives";

/** Uma linha da leitura: o valor em destaque, a série em segundo plano, a cor numa tira. */
export type InspectRow = {
  label: string;
  value: string;
  color: string;
  /** Altura do ponto da série nesse X (unidades do viewBox): ganha um marcador. */
  y?: number;
};

/** Um X que se pode ler: a posição no viewBox, o título ("Dia 12", "Março") e as séries. */
export type InspectPoint = { x: number; title: string; rows: InspectRow[] };

type Inspector = {
  points: InspectPoint[];
  active: number | null;
  setActive: (index: number | null) => void;
  svgRef: (svg: SVGSVGElement | null) => void;
};

const InspectorContext = createContext<Inspector | null>(null);

const nearest = (points: InspectPoint[], x: number) => {
  let best = 0;
  for (let i = 1; i < points.length; i += 1) {
    if (Math.abs(points[i]!.x - x) < Math.abs(points[best]!.x - x)) best = i;
  }
  return best;
};

const describe = (point: InspectPoint) =>
  `${point.title}: ${point.rows.map((row) => `${row.label} ${row.value}`).join(", ")}`;

/**
 * Leitura de um gráfico por ponteiro, toque e teclado (docs/ux/README.md). Envolve o gráfico; dentro
 * do SVG, `<InspectorLayer>` recebe o ponteiro e desenha o crosshair (linhas e áreas) ou a faixa
 * (barras). A leitura lista todas as séries daquele X, com o valor em destaque. Tab foca o gráfico,
 * as setas andam de um ponto a outro e Esc fecha. A leitura completa também vai para o leitor de
 * tela; o resumo do gráfico continua no `aria-label` do SVG.
 */
export function ChartInspector({
  points,
  label,
  className,
  children,
}: {
  points: InspectPoint[];
  /** Nome do gráfico para o teclado ("Entradas e saídas do mês"). */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const hintId = useId();
  const point = active === null ? null : points[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!points.length) return;
    const last = points.length - 1;
    const keys: Record<string, number | null> = {
      ArrowRight: active === null ? 0 : Math.min(last, active + 1),
      ArrowLeft: active === null ? last : Math.max(0, active - 1),
      Home: 0,
      End: last,
      Escape: null,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    setActive(keys[event.key] ?? null);
  };

  return (
    <InspectorContext.Provider value={{ points, active, setActive, svgRef: setSvg }}>
      <div
        ref={setWrapper}
        role="group"
        tabIndex={0}
        aria-label={label}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        className={cn("relative rounded-tile outline-offset-4", className)}
      >
        <span id={hintId} className="sr-only">
          Use as setas para ler cada ponto do gráfico.
        </span>
        {children}
        {point && svg && wrapper && <InspectorTooltip point={point} svg={svg} wrapper={wrapper} />}
        <span aria-live="polite" className="sr-only">
          {point ? describe(point) : ""}
        </span>
      </div>
    </InspectorContext.Provider>
  );
}

/**
 * A leitura em HTML, ao lado do X do ponto (à direita; à esquerda perto da borda) e sempre dentro
 * do gráfico: os cards cortam o que passa da borda.
 */
function InspectorTooltip({
  point,
  svg,
  wrapper,
}: {
  point: InspectPoint;
  svg: SVGSVGElement;
  wrapper: HTMLDivElement;
}) {
  const [width, setWidth] = useState(0);
  const box = svg.viewBox.baseVal;
  const svgRect = svg.getBoundingClientRect();
  const wrapRect = wrapper.getBoundingClientRect();
  const x = svgRect.left - wrapRect.left + ((point.x - box.x) / box.width) * svgRect.width;
  const gap = 12;
  const room = wrapRect.width;
  const left =
    x + gap + width <= room
      ? x + gap
      : x - gap - width >= 0
        ? x - gap - width
        : Math.max(0, Math.min(room - width, x - width / 2));
  return (
    <div
      ref={(node) => {
        if (node && node.offsetWidth !== width) setWidth(node.offsetWidth);
      }}
      aria-hidden="true"
      style={{ left, top: svgRect.top - wrapRect.top, visibility: width ? "visible" : "hidden" }}
      className="pointer-events-none absolute z-10 flex animate-fade-in flex-col gap-1.5 rounded-tile border border-line-strong bg-field px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,.45)] [animation-duration:var(--duration-popover)]"
    >
      <span className="text-12 whitespace-nowrap text-caption">{point.title}</span>
      {point.rows.map((row) => (
        <span key={row.label} className="flex items-center gap-2 leading-tight">
          <span
            aria-hidden="true"
            className="h-[3px] w-3 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <strong className="text-14 whitespace-nowrap tabular-nums">{row.value}</strong>
          <span className="text-12 whitespace-nowrap text-mist">{row.label}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Dentro do SVG, por último: a área que recebe o ponteiro (o plano todo, maior que as marcas) e o
 * destaque do ponto ativo. `line`: crosshair vertical e marcadores nas séries; `band`: faixa clara
 * na coluna (barras), com `bandWidth` em unidades do viewBox.
 */
export function InspectorLayer({
  x0,
  x1,
  top,
  bottom,
  mode = "line",
  bandWidth = 0,
}: {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  mode?: "line" | "band";
  bandWidth?: number;
}) {
  const inspector = useContext(InspectorContext);
  if (!inspector) return null;
  const { points, active, setActive, svgRef } = inspector;
  const point = active === null ? null : points[active];

  const pick = (event: PointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg || !points.length) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const x = (event.clientX - ctm.e) / ctm.a;
    setActive(nearest(points, x));
  };

  return (
    <g ref={(g) => svgRef(g?.ownerSVGElement ?? null)}>
      {point &&
        (mode === "band" ? (
          <rect
            x={point.x - bandWidth / 2}
            y={top}
            width={bandWidth}
            height={bottom - top}
            rx={4}
            fill={chartColors.sand}
            fillOpacity={0.07}
          />
        ) : (
          <>
            <line
              x1={point.x}
              x2={point.x}
              y1={top}
              y2={bottom}
              stroke={chartColors.mist}
              strokeOpacity={0.55}
              strokeDasharray="2 3"
            />
            {point.rows.map((row) =>
              row.y === undefined ? null : (
                <circle
                  key={row.label}
                  cx={point.x}
                  cy={row.y}
                  r={5}
                  fill={row.color}
                  stroke={chartColors.card}
                  strokeWidth={2}
                />
              ),
            )}
          </>
        ))}
      <rect
        x={x0}
        y={top}
        width={x1 - x0}
        height={bottom - top}
        fill="transparent"
        // Toque: o gesto vertical continua rolando a página; o toque lê o ponto.
        style={{ touchAction: "pan-y" }}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActive(null);
        }}
      />
    </g>
  );
}
