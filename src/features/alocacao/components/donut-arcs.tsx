"use client";

import { useTween } from "@/hooks/use-tween";

/**
 * Os arcos da rosca por grupo. Quando os valores mudam (outro perfil), cada arco anda até o
 * tamanho novo em vez de a rosca ser redesenhada do zero.
 */
export function DonutArcs({
  arcs,
  center,
  radius,
  stroke,
}: {
  arcs: { id: string; color: string; value: number }[];
  center: number;
  radius: number;
  stroke: number;
}) {
  const shown = useTween(arcs.map((arc) => arc.value));
  const circumference = 2 * Math.PI * radius;
  const total = shown.reduce((sum, value) => sum + value, 0) || 1;
  const lengths = shown.map((value) => (value / total) * circumference);
  // Onde cada arco começa (soma dos anteriores).
  const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((sum, l) => sum + l, 0));
  return arcs.map((arc, i) => {
    const length = lengths[i] ?? 0;
    const offset = starts[i] ?? 0;
    // 2 de folga entre um arco e o seguinte.
    const dash = Math.max(0, length - 2);
    if (dash <= 0) return null;
    return (
      <circle
        key={arc.id}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={arc.color}
        strokeWidth={stroke}
        strokeDasharray={`${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}`}
        strokeDashoffset={(-offset).toFixed(1)}
        transform={`rotate(-90 ${center} ${center})`}
      />
    );
  });
}
