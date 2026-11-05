"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";

/**
 * Texto de SVG que diminui só o necessário para caber em `maxWidth` (unidades do viewBox), medindo a
 * largura real depois que a fonte carrega. Ex.: "Conservador" no furo da rosca, sem encostar no anel.
 */
export function FittedText({
  maxWidth,
  fontSize,
  children,
  ...props
}: Omit<ComponentProps<"text">, "fontSize" | "children"> & {
  maxWidth: number;
  fontSize: number;
  children: string;
}) {
  const ref = useRef<SVGTextElement>(null);
  const [size, setSize] = useState(fontSize);

  useLayoutEffect(() => {
    const element = ref.current;
    // Sem medição (testes no jsdom), fica a estimativa de quem chamou.
    if (!element || typeof element.getComputedTextLength !== "function") return;
    let active = true;
    const fit = () => {
      if (!active) return;
      // Mede no tamanho pedido e reduz na proporção do que passou.
      element.setAttribute("font-size", String(fontSize));
      const width = element.getComputedTextLength();
      setSize(width > maxWidth ? (fontSize * maxWidth) / width : fontSize);
    };
    fit();
    void document.fonts?.ready.then(fit);
    return () => {
      active = false;
    };
  }, [fontSize, maxWidth, children]);

  return (
    <text ref={ref} fontSize={size} {...props}>
      {children}
    </text>
  );
}
