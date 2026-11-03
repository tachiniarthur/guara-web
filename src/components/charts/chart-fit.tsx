"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const NARROW = 480;
const MEDIUM = 800;

/**
 * Escolhe a variante do gráfico pela largura que ele ganha de verdade, não pela largura da tela:
 * no desktop, um gráfico numa coluna estreita usaria a variante larga e os textos encolheriam
 * para 4–6px. Estreito abaixo de 480px, médio até 800px, largo daí para cima (`medium` ausente:
 * vale o largo).
 *
 * O gráfico se desenha uma vez, ao abrir a tela. Se a largura muda depois (o chat abriu ao lado) e
 * outra variante aparece, ela já entra pronta (`data-chart-settled`, globals.css), sem se
 * redesenhar do zero.
 */
export function ChartFit({
  narrow,
  medium,
  wide,
  className,
}: {
  narrow: ReactNode;
  medium?: ReactNode;
  wide: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const hasMedium = Boolean(medium);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const variant = (width: number) => (width < NARROW ? 0 : hasMedium && width < MEDIUM ? 1 : 2);
    let first: number | null = null;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const current = variant(entry.contentRect.width);
      if (first === null) first = current;
      else if (current !== first) {
        setSettled(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMedium]);

  return (
    <div
      ref={ref}
      data-chart-settled={settled || undefined}
      className={cn("@container w-full", className)}
    >
      <div className="@min-[480px]:hidden">{narrow}</div>
      {medium ? (
        <>
          <div className="hidden @min-[480px]:block @min-[800px]:hidden">{medium}</div>
          <div className="hidden @min-[800px]:block">{wide}</div>
        </>
      ) : (
        <div className="hidden @min-[480px]:block">{wide}</div>
      )}
    </div>
  );
}
