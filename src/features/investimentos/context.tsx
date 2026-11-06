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
