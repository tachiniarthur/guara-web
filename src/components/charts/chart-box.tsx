"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Espaço de um gráfico que acompanha o bloco: na altura natural, a proporção do desenho
 * (`width` × `height` do viewBox); se o bloco ficou mais alto (layout editável), o gráfico ocupa a
 * altura que sobrou. `children` recebe o tamanho do viewBox a usar (nunca menor que o natural), e
 * o gráfico redistribui os eixos nele, sem esticar o texto. `stretchX`: o viewBox acompanha a
 * largura de verdade (1 unidade = 1 px, a partir de `minWidth`), então o texto fica sempre no
 * tamanho de leitura em vez de crescer ou encolher com o bloco.
 *
 * O desenho fica por cima de um espaçador com a proporção natural: a altura da caixa vem do
 * layout (espaçador ou o que sobra no card), nunca do SVG, então medir não realimenta a medida.
 */
export function ChartBox({
  width,
  height,
  stretchX = false,
  minWidth = width,
  className,
  children,
}: {
  width: number;
  height: number;
  stretchX?: boolean;
  /** Com `stretchX`: abaixo desta largura (px), o desenho volta a encolher por inteiro. */
  minWidth?: number;
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
      const nextWidth = stretchX ? Math.max(minWidth, Math.round(px / 2) * 2) : width;
      const nextHeight = Math.max(height, Math.round((pxHeight * nextWidth) / px / 2) * 2);
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height, stretchX, minWidth]);

  return (
    <div ref={ref} className={cn("relative flex w-full grow flex-col", className)}>
      {/* Com `stretchX`, a altura natural é a mesma em px em qualquer largura. */}
      <div
        aria-hidden="true"
        style={
          stretchX
            ? { aspectRatio: `${minWidth} / ${height}`, maxHeight: height }
            : { aspectRatio: `${width} / ${height}` }
        }
      />
      <div className="absolute inset-0">{children(size)}</div>
    </div>
  );
}
