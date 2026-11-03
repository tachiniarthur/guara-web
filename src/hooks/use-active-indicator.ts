"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Posição da opção marcada de um grupo (segmentado, pílulas), para um indicador que desliza até
 * ela em vez de a cor pular de uma opção para outra. A opção marcada tem `aria-pressed="true"`.
 * Antes de medir (`ready` falso), quem usa mostra o fundo na própria opção.
 */
export function useActiveIndicator(active: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    const measure = () => {
      const option = group.querySelector<HTMLElement>('[aria-pressed="true"]');
      setBox(option ? { left: option.offsetLeft, width: option.offsetWidth } : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // Fonte carregando ou a largura do grupo mudando mexem nas medidas.
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, [active]);

  const style: CSSProperties | undefined = box
    ? { width: box.width, transform: `translateX(${box.left}px)` }
    : undefined;
  return { ref, ready: box !== null, style };
}
