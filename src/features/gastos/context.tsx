"use client";

import { createContext, useContext, type ReactNode } from "react";

import type {
  CategorySpending,
  LedgerEntry,
  MonthForecastData,
  MonthlySpending,
  SpendingPace,
  TetoProgress,
  WeekdaySpending,
} from "./types";

/**
 * Dados da tela Gastos, montados com a API (`live.ts`). Os gráficos leem daqui; enquanto a API
 * responde, a tela usa `EMPTY_GASTOS` (a forma dos cards, sem números).
 */
export interface GastosData {
  spendingPace: SpendingPace;
  monthlySpending: MonthlySpending;
  weekdaySpending: WeekdaySpending;
  categorySpending: CategorySpending[];
  otherSpending: { valor: number; valorFormatado: string; cor: string };
  totalSaidas: string;
  ledger: LedgerEntry[];
  tetos: TetoProgress[];
  monthForecast: MonthForecastData;
}

/** Enquanto a API responde: gráficos sem pontos e listas vazias (os cards guardam o lugar). */
export const EMPTY_GASTOS: GastosData = {
  spendingPace: {
    hoje: 0,
    atual: [],
    anterior: [],
    nomeAtual: "",
    nomeAnterior: "",
    maximo: 1,
    descricao: "",
  },
  monthlySpending: {
    meses: [],
    previsao: null,
    media: null,
    rotuloMedia: "",
    rotuloPrevisao: "",
    maximo: 1,
    descricao: "",
  },
  weekdaySpending: { dias: [], maximo: 1, descricao: "" },
  categorySpending: [],
  otherSpending: { valor: 0, valorFormatado: "—", cor: "#34443B" },
  totalSaidas: "—",
  ledger: [],
  tetos: [],
  monthForecast: {
    fechado: false,
    hoje: 0,
    diasNoMes: 30,
    diasRestantes: 30,
    ateHoje: 0,
    porDia: 0,
    previsao: null,
    media: null,
    contraMedia: null,
    nomeAnterior: "",
    anteriorMesmoDia: null,
    contraAnterior: null,
    restante: null,
  },
};

const GastosContext = createContext<GastosData>(EMPTY_GASTOS);

export function GastosDataProvider({
  value,
  children,
}: {
  value: GastosData;
  children: ReactNode;
}) {
  return <GastosContext value={value}>{children}</GastosContext>;
}

export function useGastosData(): GastosData {
  return useContext(GastosContext);
}

/** Marcas da escala em reais: 0, um terço, dois terços e o topo ("2 mil", "4 mil"…). */
export function moneyTicks(maximo: number) {
  return [0, 1, 2, 3].map((i) => {
    const value = (maximo / 3) * i;
    const label =
      value === 0
        ? "0"
        : value >= 1000
          ? `${(value / 1000).toLocaleString("pt-BR")} mil`
          : `${value}`;
    return { value, label };
  });
}

/** Topo da escala: o maior valor arredondado para cima (múltiplo de `step`), nunca menor que `min`. */
export function scaleTop(values: number[], step: number, min: number) {
  const peak = Math.max(0, ...values);
  return Math.max(min, Math.ceil(peak / step) * step);
}
