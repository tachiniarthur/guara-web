"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Igual a `--duration-exit` (globals.css), com folga para o último quadro. */
const EXIT_MS = 190;
/** Igual a `--duration-panel-exit`: painéis do chat saindo pela borda. */
export const PANEL_EXIT_MS = 400;
/** Igual a `--duration-panel`: painéis do chat entrando pela borda. */
export const PANEL_ENTER_MS = 580;

/**
 * Mantém um overlay na tela enquanto ele sai. Com `show` falso, o conteúdo que estava aberto fica
 * mais um instante com `data-presence="closing"` (sem receber cliques nem foco) e as peças marcadas
 * com `data-motion` saem pelo mesmo caminho por onde entraram (globals.css); depois some de vez.
 *
 * ```tsx
 * <Presence show={open}>{open && <ConfirmDialog … />}</Presence>
 * ```
 */
export function Presence({
  show,
  exitMs = EXIT_MS,
  children,
}: {
  show: boolean;
  /** Quanto tempo a saída dura (os painéis do chat saem mais devagar: `PANEL_EXIT_MS`). */
  exitMs?: number;
  children: ReactNode;
}) {
  // O último conteúdo aberto: é ele que aparece saindo, mesmo que o pai já não o renderize.
  const [kept, setKept] = useState<ReactNode>(show ? children : null);
  if (show && kept !== children) setKept(children);

  useEffect(() => {
    if (show || kept === null) return;
    // Com "reduzir movimento" a saída também acontece (só esmaece), então o tempo é o mesmo.
    const timer = setTimeout(() => setKept(null), exitMs);
    return () => clearTimeout(timer);
  }, [show, kept, exitMs]);

  if (!show && kept === null) return null;
  return (
    <div data-presence={show ? "open" : "closing"} inert={!show} className="contents">
      {show ? children : kept}
    </div>
  );
}

/**
 * Camada de baixo que espera a de cima terminar de entrar antes de sair da tela (ex.: o histórico
 * do chat enquanto a conversa desliza por cima dele). Com `covered` falso, aparece na hora; com
 * `covered` verdadeiro, continua montada por `enterMs` e depois some (já está escondida).
 */
export function useStaysUnder(covered: boolean, enterMs = PANEL_ENTER_MS) {
  const [under, setUnder] = useState(!covered);
  if (!covered && !under) setUnder(true);

  useEffect(() => {
    if (!covered) return;
    const timer = setTimeout(() => setUnder(false), enterMs);
    return () => clearTimeout(timer);
  }, [covered, enterMs]);

  return !covered || under;
}
