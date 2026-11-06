"use client";

import { createContext, useContext, type ReactNode } from "react";

import { categorySpending, otherSpending, type CategorySpending } from "./data";
import { monthTotals, transactionDays, type TransactionDay } from "./lancamentos";

/**
 * Dados da lista de lançamentos. No protótipo, os de exemplo; com login, os da API
 * (`live-lancamentos.ts`), no mesmo formato.
 */
export interface LancamentosData {
  days: TransactionDay[];
  /** "Todos os bancos" primeiro. */
  banks: string[];
  /** Mostra a marca do banco ao lado do nome (só os do protótipo têm). */
  bankMarks: boolean;
  totals: { entrou: string; saiu: string; sobrou: string };
  resumo: string;
  /** "Setembro 2026". */
  mes: string;
  categorias: CategorySpending[];
  outros: string;
  /** Aviso da compra fora do padrão (Quero-quero); `null` sem nenhuma. */
  foraDoPadrao: string | null;
  /** Carregar dias anteriores; `null` quando não há mais. */
  loadMore: { onClick: () => void; pending: boolean } | null;
}

export const prototypeLancamentos: LancamentosData = {
  days: transactionDays,
  banks: ["Todos os bancos", "Nubank", "Itaú"],
  bankMarks: true,
  totals: monthTotals,
  resumo: `${monthTotals.lancamentos} lançamentos em setembro · Nubank e Itaú`,
  mes: "Setembro 2026",
  categorias: categorySpending,
  outros: otherSpending.valorFormatado,
  foraDoPadrao:
    "A compra de R$ 1.249,90 às 02:14 está fora do seu padrão. Clique nela para confirmar se foi você.",
  loadMore: { onClick: () => {}, pending: false },
};

const LancamentosContext = createContext<LancamentosData>(prototypeLancamentos);

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
