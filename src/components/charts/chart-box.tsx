"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Espaço de um gráfico que acompanha o bloco: na altura natural, a proporção do desenho
 * (`width` × `height` do viewBox); se o bloco ficou mais alto (layout editável), o gráfico ocupa a
 * altura que sobrou. `children` recebe o tamanho do viewBox a usar (nunca menor que o natural), e
 * o gráfico redistribui os eixos nele, sem esticar o texto. `stretchX`: mais largo que o natural,
 * o viewBox também alarga (1 unidade = 1 px), em vez de aumentar o desenho todo.
 *
 * O desenho fica por cima de um espaçador com a proporção natural: a altura da caixa vem do
 * layout (espaçador ou o que sobra no card), nunca do SVG, então medir não realimenta a medida.
 */
export function ChartBox({
  width,
  height,
  stretchX = false,
  className,
  children,
}: {
  width: number;
  height: number;
  stretchX?: boolean;
  className?: string;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width, height });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width: px, height: pxHeight } = entry.contentRect;
      if (px <= 0) return;
      // Em unidades do viewBox, em passos de 2 para não redesenhar a cada fração de pixel.
      const nextWidth = stretchX ? Math.max(width, Math.round(px / 2) * 2) : width;
      const nextHeight = Math.max(height, Math.round((pxHeight * nextWidth) / px / 2) * 2);
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height, stretchX]);

  return (
    <div ref={ref} className={cn("relative flex w-full grow flex-col", className)}>
      {/* Mais largo que o natural com `stretchX`: a altura natural fica a mesma em px. */}
      <div
        aria-hidden="true"
        style={
          stretchX
            ? { aspectRatio: `${width} / ${height}`, maxHeight: height }
            : { aspectRatio: `${width} / ${height}` }
        }
      />
      <div className="absolute inset-0">{children(size)}</div>
    </div>
  );
}
