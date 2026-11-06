"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  categorySpending,
  ledger,
  monthForecast,
  monthlySpending,
  otherSpending,
  spendingPace,
  tetos,
  totalSaidas,
  weekdaySpending,
  type CategorySpending,
  type LedgerEntry,
  type MonthForecastData,
  type MonthlySpending,
  type SpendingPace,
  type TetoProgress,
  type WeekdaySpending,
} from "./data";

/**
 * Dados da tela Gastos. No protótipo, os de exemplo (`data.ts`); com login, os da API
 * (`live.ts`), no mesmo formato. Os componentes leem daqui, nunca do `data.ts` direto.
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

export const prototypeGastos: GastosData = {
  spendingPace,
  monthlySpending,
  weekdaySpending,
  categorySpending,
  otherSpending,
  totalSaidas,
  ledger,
  tetos,
  monthForecast,
};

const GastosContext = createContext<GastosData>(prototypeGastos);

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
