"use client";

import { createContext, useContext, type ReactNode } from "react";

import { portfolioAllocation } from "./data";

/** A carteira nos 5 grupos do design: a de exemplo no protótipo; a da API com login. */
export type PortfolioAllocation = typeof portfolioAllocation;

const AlocacaoContext = createContext<PortfolioAllocation>(portfolioAllocation);

export function AlocacaoDataProvider({
  value,
  children,
}: {
  value: PortfolioAllocation;
  children: ReactNode;
}) {
  return <AlocacaoContext value={value}>{children}</AlocacaoContext>;
}

export function usePortfolioAllocation(): PortfolioAllocation {
  return useContext(AlocacaoContext);
}
