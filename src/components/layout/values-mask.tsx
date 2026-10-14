"use client";

import { useEffect } from "react";

import { usePrivacy } from "@/stores/privacy";

/** "R$ 1.249,90", "R$ 3,0 milhões", "R$ 46 mil" → "R$ •••". */
const MONEY = /R\$([\s ])\d[\d.,]*(?:[\s ](?:mil|milhões|milhão)\b)?/g;

/**
 * Esconde os valores em reais da tela inteira enquanto "ocultar valores" estiver ligado:
 * troca o texto, guarda o original e acompanha o que aparecer depois (navegação, menus).
 */
export function ValuesMask() {
  const hidden = usePrivacy((state) => state.hidden);

  useEffect(() => {
    if (!hidden) return;
    const originals = new Map<Text, string>();
    const mask = (node: Node) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (
        let text = walker.nextNode() as Text | null;
        text;
        text = walker.nextNode() as Text | null
      ) {
        const value = text.nodeValue ?? "";
        if (!value.includes("R$") || value.includes("•••")) continue;
        const masked = value.replace(MONEY, "R$$$1•••");
        if (masked !== value) {
          originals.set(text, value);
          text.nodeValue = masked;
        }
      }
    };
    mask(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") mask(record.target);
        record.addedNodes.forEach(mask);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      originals.forEach((value, text) => {
        if (text.isConnected) text.nodeValue = value;
      });
    };
  }, [hidden]);

  return null;
}
