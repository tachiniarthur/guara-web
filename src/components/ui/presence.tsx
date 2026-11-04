"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Igual a `--duration-exit` (globals.css), com folga para o último quadro. */
const EXIT_MS = 190;

/**
 * Mantém um overlay na tela enquanto ele sai. Com `show` falso, o conteúdo que estava aberto fica
 * mais um instante com `data-presence="closing"` (sem receber cliques nem foco) e as peças marcadas
 * com `data-motion` saem pelo mesmo caminho por onde entraram (globals.css); depois some de vez.
 *
 * ```tsx
 * <Presence show={open}>{open && <ConfirmDialog … />}</Presence>
 * ```
 */
export function Presence({ show, children }: { show: boolean; children: ReactNode }) {
  // O último conteúdo aberto: é ele que aparece saindo, mesmo que o pai já não o renderize.
  const [kept, setKept] = useState<ReactNode>(show ? children : null);
  if (show && kept !== children) setKept(children);

  useEffect(() => {
    if (show || kept === null) return;
    // Com "reduzir movimento" a saída também acontece (só esmaece), então o tempo é o mesmo.
    const timer = setTimeout(() => setKept(null), EXIT_MS);
    return () => clearTimeout(timer);
  }, [show, kept]);

  if (!show && kept === null) return null;
  return (
    <div data-presence={show ? "open" : "closing"} inert={!show} className="contents">
      {show ? children : kept}
    </div>
  );
}
