"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { TransactionDay } from "./lancamentos";
import type { CategorySpending } from "./types";

/** Dados da lista de lançamentos, montados com a API (`live-lancamentos.ts`). */
export interface LancamentosData {
  days: TransactionDay[];
  /** "Todos os bancos" primeiro. */
  banks: string[];
  totals: { entrou: string; saiu: string; sobrou: string };
  resumo: string;
  /** "Setembro 2026". */
  mes: string;
  categorias: CategorySpending[];
  outros: string;
  /** Aviso da compra fora do padrão (Guará); `null` sem nenhuma. */
  foraDoPadrao: string | null;
  /** Carregar dias anteriores; `null` quando não há mais. */
  loadMore: { onClick: () => void; pending: boolean } | null;
}

/** Enquanto a API responde: a forma da tela, sem lançamentos nem números. */
export const EMPTY_LANCAMENTOS: LancamentosData = {
  days: [],
  banks: ["Todos os bancos"],
  totals: { entrou: "—", saiu: "—", sobrou: "—" },
  resumo: "",
  mes: "",
  categorias: [],
  outros: "—",
  foraDoPadrao: null,
  loadMore: null,
};

const LancamentosContext = createContext<LancamentosData>(EMPTY_LANCAMENTOS);

export function LancamentosDataProvider({
  value,
  children,
}: {
  value: LancamentosData;
  children: ReactNode;
}) {
  return <LancamentosContext value={value}>{children}</LancamentosContext>;
}

export function useLancamentosData(): LancamentosData {
  return useContext(LancamentosContext);
}
