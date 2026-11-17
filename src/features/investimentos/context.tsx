"use client";

import { createContext, useContext, type ReactNode } from "react";

import { priceAlerts, type PriceAlert } from "@/features/alertas/data";

import {
  allocation,
  countryExposure,
  otherAssets,
  portfolio,
  positionGroups,
  type AllocationSlice,
  type CountryExposure,
  type OtherAsset,
  type PortfolioData,
  type PositionGroup,
} from "./data";
import type { PerformancePeriod } from "./performance";

/**
 * Dados da tela Investimentos. No protótipo, os de exemplo (`data.ts`); com login, os da API
 * (`live.ts`), no mesmo formato. Os componentes leem daqui, nunca do `data.ts` direto.
 */
export interface InvestimentosData {
  portfolio: PortfolioData;
  positionGroups: PositionGroup[];
  allocation: AllocationSlice[];
  countryExposure: CountryExposure[];
  otherAssets: OtherAsset[];
  priceAlerts: PriceAlert[];
}

export const prototypeInvestimentos: InvestimentosData = {
  portfolio,
  positionGroups,
  allocation,
  countryExposure,
  otherAssets,
  priceAlerts,
};

const InvestimentosContext = createContext<InvestimentosData>(prototypeInvestimentos);

export function InvestimentosDataProvider({
  value,
  children,
}: {
  value: InvestimentosData;
  children: ReactNode;
}) {
  return <InvestimentosContext value={value}>{children}</InvestimentosContext>;
}

export function useInvestimentosData(): InvestimentosData {
  return useContext(InvestimentosContext);
}

/**
 * Período do gráfico de rentabilidade (6M, 12M, Tudo), um só para as variantes de celular, tablet
 * e desktop. `loading`: a curva na tela ainda é a do período anterior; `error`: o período não veio.
 */
export interface PerformancePeriodState {
  period: PerformancePeriod;
  setPeriod: (period: PerformancePeriod) => void;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

const PerformancePeriodContext = createContext<PerformancePeriodState>({
  period: "12m",
  setPeriod: () => {},
  loading: false,
  error: false,
  retry: () => {},
});

export const PerformancePeriodProvider = PerformancePeriodContext;

export function usePerformancePeriod(): PerformancePeriodState {
  return useContext(PerformancePeriodContext);
}
