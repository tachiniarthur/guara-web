"use client";

import { createContext, useContext, type ReactNode } from "react";

import { OFFLINE_NOTE, type ScreenState } from "./screen-state";
import { ErrorBlock, NoDataBlock, StateSwap } from "./state-block";

const ScreenStateContext = createContext<ScreenState | null>(null);

/**
 * Estado da tela (`?estado=`) para os cards de telas longas (Início, Investimentos): cada card lê
 * o estado daqui, sem precisar receber por propriedade.
 */
export function ScreenStateProvider({
  state,
  children,
}: {
  state: ScreenState | null;
  children: ReactNode;
}) {
  return <ScreenStateContext value={state}>{children}</ScreenStateContext>;
}

export function useScreenState() {
  return useContext(ScreenStateContext);
}

/** Sem dados (erro ou vazio): os cards trocam o conteúdo e perdem ações e números do subtítulo. */
export function useNoData() {
  const state = useScreenState();
  return state === "erro" || state === "vazio";
}

/**
 * Conteúdo de um card: no erro, o aviso de falha; no vazio, o "—" (ou `main`, no card principal);
 * nos outros estados, o próprio conteúdo. Mantém a altura do card.
 */
export function CardBody({
  main,
  error,
  empty,
  className,
  overlayClassName,
  children,
}: {
  /** Aviso próprio do vazio (no maior card da tela). */
  main?: ReactNode;
  /** Variante do erro, quando não é a grande. */
  error?: ReactNode;
  /** Variante do vazio, quando não é a grande. */
  empty?: ReactNode;
  className?: string;
  overlayClassName?: string;
  children: ReactNode;
}) {
  const state = useScreenState();
  const replacement =
    state === "erro"
      ? (error ?? <ErrorBlock />)
      : state === "vazio"
        ? (main ?? empty ?? <NoDataBlock />)
        : null;
  return (
    <StateSwap replacement={replacement} className={className} overlayClassName={overlayClassName}>
      {children}
    </StateSwap>
  );
}

/**
 * Subtítulo de card: sem internet, vira a hora dos dados guardados; sem dados, some quando traz
 * valores (`numbers`).
 */
export function CardNote({ children, numbers }: { children: ReactNode; numbers?: boolean }) {
  const state = useScreenState();
  if (state === "sem-internet") return <span className="text-tucano">{OFFLINE_NOTE}</span>;
  if ((state === "erro" || state === "vazio") && numbers) return null;
  return children;
}

/** Ação do canto do card (some quando não há dados). */
export function CardAction({ children }: { children: ReactNode }) {
  return useNoData() ? null : children;
}

/** Mostra `children` só quando a tela está sem dados (erro ou vazio). */
export function WhenNoData({ children }: { children: ReactNode }) {
  return useNoData() ? children : null;
}

/** Mostra `children` só quando há dados (some no erro e no vazio). */
export function WhenHasData({ children }: { children: ReactNode }) {
  return useNoData() ? null : children;
}
