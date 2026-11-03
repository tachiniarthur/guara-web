"use client";

import { useEffect, useRef, useState } from "react";

/** Troca de um perfil para outro: rápido o bastante para não atrasar quem compara. */
const DURATION = 650;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** Os testes leem o valor final na hora. */
const SKIP = process.env.NODE_ENV === "test";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Os `values` a caminho do valor novo: quando mudam (outro perfil), cada um anda do que está na
 * tela até o novo, em vez de pular. Na primeira vez vale o valor como veio (a entrada de cada
 * gráfico é dele). "Reduzir movimento" do sistema e os testes pulam direto.
 */
export function useTween(values: readonly number[], duration = DURATION): number[] {
  const key = values.join("|");
  const [shown, setShown] = useState<readonly number[]>(values);
  // O que está na tela agora, para a próxima troca partir dele (lido só nos efeitos).
  const current = useRef(shown);
  useEffect(() => {
    current.current = shown;
  }, [shown]);

  useEffect(() => {
    const to = key.split("|").map(Number);
    const from = current.current;
    if (from.length !== to.length || SKIP || reducedMotion()) {
      setShown(to);
      return;
    }
    if (from.every((value, i) => value === to[i])) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOut(t);
      setShown(t >= 1 ? to : to.map((value, i) => from[i]! + (value - from[i]!) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [key, duration]);

  return shown.length === values.length ? [...shown] : [...values];
}

/** Um número a caminho do valor novo (ver `useTween`), já arredondado enquanto anda. */
export function useTweenNumber(value: number): number {
  const [shown = value] = useTween([value]);
  return shown === value ? value : Math.round(shown);
}
