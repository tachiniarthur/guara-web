"use client";

import { useEffect, useRef } from "react";

import { MataArt } from "./mata-art";

/**
 * Textura Mata viva: as lâminas flutuam devagar e as camadas acompanham o ponteiro em
 * profundidade (parallax), ao passar o mouse por qualquer lugar da tela. Escreve só variáveis
 * CSS no svg (sem re-render). Com "reduzir movimento", fica parada.
 */
export function MataArtLive({
  className,
  align = "center",
}: {
  className?: string;
  align?: "center" | "right" | "top";
}) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const element = svg.current;
    if (!element || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      element.style.setProperty("--mx", x.toFixed(3));
      element.style.setProperty("--my", y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      // Posição na janela, de −1 a 1 (centro = 0).
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <MataArt className={className} align={align} animated svgRef={svg} />;
}
