"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PriceAlert } from "@/features/alertas/data";
import type { PortfolioAllocation } from "@/features/alocacao/live";

import type { PerformancePeriod } from "./performance";
import type { CountryExposure, OtherAsset, PortfolioData, PositionGroup } from "./types";

/** Dados da tela Investimentos, montados com a API (`live.ts`). Os componentes leem daqui. */
export interface InvestimentosData {
  portfolio: PortfolioData;
  positionGroups: PositionGroup[];
  countryExposure: CountryExposure[];
  otherAssets: OtherAsset[];
  priceAlerts: PriceAlert[];
  alocacao: PortfolioAllocation;
}

/** Enquanto a API responde: a forma da tela com "—" (os cards guardam o lugar). */
export const EMPTY_INVESTIMENTOS: InvestimentosData = {
  portfolio: {
    patrimonio: "—",
    variacaoMes: "",
    totalComBens: "—",
    investido: "—",
    bens: "—",
    atualizacao: "",
    outras: { quantidade: 0, total: "—", percentual: "—" },
    rentabilidade: { carteira: [], cdi: [], rotulos: [] },
    stats: [],
  },
  positionGroups: [],
  countryExposure: [],
  otherAssets: [],
  priceAlerts: [],
  alocacao: {
    perfil: null,
    investidoCents: 0,
    total: "—",
    semValor: 0,
    classes: [],
    foraDoAlvo: [],
  },
};

const InvestimentosContext = createContext<InvestimentosData>(EMPTY_INVESTIMENTOS);

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
