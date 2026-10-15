"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Esqueleto de carregamento: a própria tela com os textos trocados por barras, cards apagados e
 * ícones e imagens escondidos (estilos em `globals.css`, `[data-skeleton]`). Assim o esqueleto
 * tem sempre o mesmo desenho da tela carregada. Partes marcadas com `data-skeleton-skip`
 * (títulos de grupo, por exemplo) continuam visíveis.
 */
export function Skeleton({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return children;
  return <SkeletonArea>{children}</SkeletonArea>;
}

function SkeletonArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Cada trecho de texto ganha uma barra do tamanho dele (texto em si fica transparente).
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.textContent?.trim() &&
        !node.parentElement?.closest("svg, .skeleton-text, [data-skeleton-skip]")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const bars: HTMLSpanElement[] = [];
    for (const node of nodes) {
      // Trechos vizinhos ("74", "% · ", "atenção") formam uma barra só.
      const previous = node.previousSibling;
      if (previous instanceof HTMLSpanElement && previous.classList.contains("skeleton-text")) {
        previous.append(node);
        continue;
      }
      const bar = document.createElement("span");
      bar.className = "skeleton-text";
      bar.setAttribute("aria-hidden", "true");
      node.before(bar);
      bar.append(node);
      bars.push(bar);
    }
    return () => {
      for (const bar of bars) {
        if (bar.parentNode) bar.replaceWith(...bar.childNodes);
      }
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
