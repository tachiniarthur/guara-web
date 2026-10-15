"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Card: tem fundo ou borda, cantos arredondados e altura de card (botões e pílulas ficam fora). */
function isCard(element: HTMLElement) {
  const style = getComputedStyle(element);
  if (style.display === "contents" || element.offsetHeight < 64) return false;
  const hasBackground =
    !/rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor) ||
    style.backgroundImage !== "none";
  const hasBorder = parseFloat(style.borderTopWidth) > 0;
  return (hasBackground || hasBorder) && parseFloat(style.borderTopLeftRadius) >= 12;
}

/**
 * Carregando (`?estado=carregando`): cada card da área continua no mesmo tamanho e lugar, com um
 * círculo girando no centro no lugar do conteúdo (estilos em `globals.css`, `[data-skeleton]`).
 * O que fica fora dos cards some, guardando o espaço; partes marcadas com `data-skeleton-skip`
 * (títulos de grupo, por exemplo) continuam visíveis.
 */
export function Skeleton({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return children;
  return <LoadingArea>{children}</LoadingArea>;
}

function LoadingArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Marca os cards de fora para dentro: um card dentro de outro não ganha círculo próprio.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards: HTMLElement[] = [];
    for (const element of root.querySelectorAll<HTMLElement>("*")) {
      if (element.closest("[data-skeleton-skip], svg")) continue;
      if (cards.some((card) => card.contains(element))) continue;
      if (!isCard(element)) continue;
      cards.push(element);
    }
    for (const card of cards) {
      card.classList.add("loading-card");
      if (getComputedStyle(card).position === "static") card.classList.add("loading-card-relative");
    }
    return () => {
      for (const card of cards) card.classList.remove("loading-card", "loading-card-relative");
    };
  }, []);

  return (
    <div ref={ref} data-skeleton="" className="contents">
      {children}
    </div>
  );
}

/** Aviso para leitores de tela enquanto a tela carrega. */
export function LoadingStatus() {
  return (
    <p role="status" className="sr-only m-0">
      Carregando…
    </p>
  );
}
