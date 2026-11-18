"use client";

import { rem } from "@/lib/rem";

import { DonutArcs } from "./donut-arcs";
import { FittedText } from "./fitted-text";

export type DonutSize = { size: number; radius: number; stroke: number; value: number };

/** Tamanhos das roscas nos protótipos (lado, raio, espessura e corpo do número central). */
export const donutSizes = {
  lg: { size: 170, radius: 71, stroke: 24, value: 16 },
  md: { size: 160, radius: 66, stroke: 22, value: 16 },
  sm: { size: 128, radius: 50, stroke: 18, value: 14 },
  result: { size: 150, radius: 61, stroke: 21, value: 16 },
  card: { size: 132, radius: 52, stroke: 18, value: 14 },
  xl: { size: 180, radius: 76, stroke: 25, value: 16 },
  cardTablet: { size: 130, radius: 51, stroke: 18, value: 14 },
} satisfies Record<string, DonutSize>;

/** Rosca começando às 12h, com rótulo e valor no centro. */
export function Donut({
  arcs,
  dims,
  caption,
  value,
  label,
}: {
  arcs: { id: string; color: string; value: number }[];
  dims: DonutSize;
  /** Linha de cima do centro ("Atual", "Alvo"). */
  caption: string;
  /** Linha de baixo do centro ("12 ativos", "Moderado"). */
  value: string;
  /** Rótulo acessível. */
  label: string;
}) {
  const { size, radius, stroke } = dims;
  const c = size / 2;
  // Nome longo ("Conservador") diminui para caber no furo da rosca, com folga dos lados. A linha
  // fica abaixo do centro, onde o furo é mais estreito: vale a corda do círculo na linha de base.
  const inner = radius - stroke / 2;
  const baseline = 14;
  const chord = 2 * Math.sqrt(Math.max(inner ** 2 - baseline ** 2, 0));
  const maxWidth = chord * 0.84;
  // Estimativa para o primeiro desenho (Fraunces negrito ~0,66 em por letra); o FittedText mede.
  const valueSize = Math.min(dims.value, maxWidth / (Math.max(value.length, 1) * 0.66));
  return (
    <svg
      width={rem(size)}
      height={rem(size)}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className="block shrink-0 animate-sweep"
    >
      <circle cx={c} cy={c} r={radius} fill="none" stroke="#1A241F" strokeWidth={stroke} />
      <DonutArcs arcs={arcs} center={c} radius={radius} stroke={stroke} />
      <text
        x={c}
        y={c - 6}
        textAnchor="middle"
        fontSize="12"
        fill="#93A198"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {caption}
      </text>
      {/* O nome troca com um esmaecer quando a rosca muda de perfil. */}
      <FittedText
        key={value}
        className="animate-fade-in"
        x={c}
        y={c + baseline}
        textAnchor="middle"
        fontSize={valueSize}
        maxWidth={maxWidth}
        fontWeight="700"
        fill="#F2EFE6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </FittedText>
    </svg>
  );
}
