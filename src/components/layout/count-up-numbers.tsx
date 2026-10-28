"use client";

import { useEffect } from "react";

import { usePrivacy } from "@/stores/privacy";

/** Primeiro número de um texto: "R$ 12.480,32" → "12.480,32"; "+11,1%" → "11,1". */
const NUMBER = /\d[\d.]*(?:,\d+)?/;
const DURATION = 1400;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Textos que já contaram (uma vez só, mesmo depois de ocultar e mostrar os valores). */
const counted = new WeakSet<Text>();

/** O número no mesmo formato do original (casas decimais e separador de milhar). */
function formatLike(value: number, decimals: number, grouped: boolean) {
  const [int = "0", fraction] = value.toFixed(decimals).split(".");
  const intText = grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : int;
  return fraction ? `${intText},${fraction}` : intText;
}

/** Número grande (Fraunces) em reais ou percentual: esses contam ao aparecer. */
function isBigNumber(text: Text) {
  const display = text.parentElement?.closest(".font-display");
  const content = display?.textContent ?? "";
  return content.includes("R$") || content.includes("%");
}

type Running = {
  final: string;
  render: (progress: number) => string;
  start: number;
  written: string;
};

/**
 * Os números grandes contam a partir de zero quando aparecem na tela (ao abrir uma tela ou quando
 * os dados chegam), como no app. Mexe só no texto já desenhado: se o React trocar o valor no meio,
 * vale o do React. Valores ocultos e "reduzir movimento" do sistema não contam. Fica antes do
 * `ValuesMask` na árvore, para terminar as contagens antes de ele guardar os originais.
 */
export function CountUpNumbers() {
  const hidden = usePrivacy((state) => state.hidden);

  useEffect(() => {
    if (hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const running = new Map<Text, Running>();
    let frame = 0;

    const tick = (now: number) => {
      running.forEach((state, text) => {
        if (!text.isConnected || text.nodeValue !== state.written) {
          running.delete(text);
          return;
        }
        const t = Math.min(1, (now - state.start) / DURATION);
        const next = t >= 1 ? state.final : state.render(easeOut(t));
        text.nodeValue = next;
        state.written = next;
        if (t >= 1) running.delete(text);
      });
      frame = running.size > 0 ? requestAnimationFrame(tick) : 0;
    };

    const count = (text: Text) => {
      if (counted.has(text) || !isBigNumber(text)) return;
      counted.add(text);
      const value = text.nodeValue ?? "";
      const match = NUMBER.exec(value);
      if (!match) return;
      const token = match[0];
      const target = Number(token.replace(/\./g, "").replace(",", "."));
      if (!Number.isFinite(target) || target === 0) return;
      const decimals = token.split(",")[1]?.length ?? 0;
      const grouped = token.includes(".");
      const before = value.slice(0, match.index);
      const after = value.slice(match.index + token.length);
      const render = (progress: number) =>
        `${before}${formatLike(target * progress, decimals, grouped)}${after}`;
      // Começa do zero já no primeiro quadro (sem piscar o valor final antes).
      const first = render(0);
      text.nodeValue = first;
      running.set(text, { final: value, render, start: performance.now(), written: first });
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const scan = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        count(node as Text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) count(text as Text);
    };

    // O que já veio do servidor conta no quadro seguinte, depois da hidratação.
    const initial = window.setTimeout(() => scan(document.body), 0);
    const observer = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(initial);
      cancelAnimationFrame(frame);
      // Termina o que estava contando (ex.: ligaram "ocultar valores" no meio).
      running.forEach((state, text) => {
        if (text.isConnected && text.nodeValue === state.written) text.nodeValue = state.final;
      });
    };
  }, [hidden]);

  return null;
}
