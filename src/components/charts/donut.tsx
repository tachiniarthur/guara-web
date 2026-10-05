import type { ReactNode } from "react";

import { rem } from "@/lib/rem";

export type DonutSegment = { value: number; color: string; title?: string };

type DonutProps = {
  segments: DonutSegment[];
  /** Lado em px. */
  size: number;
  /** Tamanho do viewBox, raio e espessura do anel. */
  box?: number;
  radius?: number;
  strokeWidth?: number;
  /** Respiro entre segmentos (em unidades do viewBox). */
  gap?: number;
  /** Cor do trilho por baixo dos segmentos (opcional). */
  track?: string;
  /** Rótulo acessível (sem ele a rosca é decorativa). */
  label?: string;
  /** Conteúdo no centro (ex.: "Saídas R$ 5.912"). */
  children?: ReactNode;
};

/** Rosca de participação, começando às 12h. */
export function Donut({
  segments,
  size,
  box = 180,
  radius = 79,
  strokeWidth = 22,
  gap = 3,
  track,
  label,
  children,
}: DonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const circumference = 2 * Math.PI * radius;
  const lengths = segments.map((s) => (s.value / total) * circumference);
  const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((sum, l) => sum + l, 0));
  const c = box / 2;

  return (
    <div className="relative shrink-0" style={{ width: rem(size), height: rem(size) }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${box} ${box}`}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className="block -rotate-90"
      >
        {track && (
          <circle
            cx={c}
            cy={c}
            r={radius.toFixed(2)}
            fill="none"
            stroke={track}
            strokeWidth={strokeWidth}
          />
        )}
        {segments.map((segment, i) => (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={radius.toFixed(2)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${((lengths[i] ?? 0) - gap).toFixed(2)} ${circumference.toFixed(2)}`}
            strokeDashoffset={(-(starts[i] ?? 0)).toFixed(2)}
          >
            {segment.title && <title>{segment.title}</title>}
          </circle>
        ))}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
