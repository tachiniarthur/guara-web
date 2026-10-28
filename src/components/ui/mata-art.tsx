import type { CSSProperties, Ref } from "react";

import { cn } from "@/lib/utils";

/** Lâminas da textura Mata: verdes da mata e o âmbar do tucano, sobrepostos. */
const SHARDS: { points: string; fill: string; opacity?: number }[] = [
  { points: "0,0 280,0 0,250", fill: "#10211A" },
  { points: "0,70 340,190 0,320", fill: "#143023", opacity: 0.95 },
  { points: "30,0 310,175 180,0", fill: "#1A3D2C" },
  { points: "0,400 250,250 320,460 0,460", fill: "#234A33", opacity: 0.7 },
  { points: "300,120 445,30 525,265", fill: "#5C7A3C", opacity: 0.4 },
  { points: "330,0 475,0 425,310", fill: "#275038", opacity: 0.9 },
  { points: "385,0 455,0 478,235", fill: "#4D7A4A", opacity: 0.75 },
  { points: "380,235 605,0 695,0 525,460 400,460", fill: "#C28A2F", opacity: 0.85 },
  { points: "470,150 640,0 705,0 565,305", fill: "#D9A441", opacity: 0.55 },
  { points: "250,330 420,250 470,460 300,460", fill: "#7A7434", opacity: 0.35 },
  { points: "120,460 350,300 430,460", fill: "#0B140F", opacity: 0.85 },
  { points: "600,120 720,50 720,460 560,460", fill: "#0B1511", opacity: 0.85 },
  { points: "690,0 720,0 720,140 650,210", fill: "#1D3A2B", opacity: 0.9 },
];

const ALIGN = {
  center: "xMidYMid slice",
  right: "xMaxYMid slice",
  top: "xMidYMin slice",
} as const;

/**
 * Textura Mata em vetor (nítida em qualquer tamanho), com um grão leve de papel. Preenche o
 * contêiner como um `object-cover`; `align` escolhe o lado que fica visível quando corta.
 */
/**
 * Movimento de cada lâmina na versão animada: quanto ela flutua (unidades do desenho), quanto
 * gira, em quanto tempo e a profundidade no parallax (as âmbar, na frente, andam mais).
 */
function motionOf(index: number, fill: string): CSSProperties {
  const front = fill === "#C28A2F" || fill === "#D9A441";
  const sign = index % 2 === 0 ? 1 : -1;
  return {
    "--dx": `${sign * (5 + (index % 4) * 2)}px`,
    "--dy": `${-sign * (4 + (index % 3) * 2)}px`,
    "--rot": `${sign * (0.6 + (index % 3) * 0.4)}deg`,
    "--dur": `${13 + (index % 5) * 2.5}s`,
    "--delay": `${-index * 1.7}s`,
    "--depth": front ? 22 : 5 + (index % 4) * 4,
  } as CSSProperties;
}

export function MataArt({
  className,
  align = "center",
  animated = false,
  svgRef,
}: {
  className?: string;
  align?: keyof typeof ALIGN;
  /**
   * Lâminas flutuando devagar, cada uma no seu ritmo; com `--mx`/`--my` no svg (de −1 a 1), as
   * camadas acompanham o ponteiro em profundidade (veja `MataArtLive`). Sem nada com "reduzir
   * movimento".
   */
  animated?: boolean;
  svgRef?: Ref<SVGSVGElement>;
}) {
  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 720 460"
      preserveAspectRatio={ALIGN[align]}
      className={cn("block", className)}
    >
      <defs>
        <filter id="mata-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.12 0" />
        </filter>
        <radialGradient id="mata-vignette" cx="0.55" cy="0.45" r="0.75">
          <stop offset="0.45" stopColor="#0B110E" stopOpacity="0" />
          <stop offset="1" stopColor="#0B110E" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="720" height="460" fill="#0D1813" />
      {animated ? (
        // Um pouco maior que a moldura: as lâminas se mexem sem mostrar a borda.
        <g transform="translate(360 230) scale(1.06) translate(-360 -230)">
          {SHARDS.map((shard, index) => (
            <g key={shard.points} className="mata-layer" style={motionOf(index, shard.fill)}>
              <polygon
                className="mata-shard"
                points={shard.points}
                fill={shard.fill}
                opacity={shard.opacity}
              />
            </g>
          ))}
        </g>
      ) : (
        SHARDS.map((shard) => (
          <polygon
            key={shard.points}
            points={shard.points}
            fill={shard.fill}
            opacity={shard.opacity}
          />
        ))
      )}
      <rect width="720" height="460" fill="url(#mata-vignette)" />
      <rect width="720" height="460" filter="url(#mata-grain)" />
    </svg>
  );
}
