"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";

/* Cotação e busca de ativos da B3 e dos EUA, pela API (os formulários de posição e alerta). */

/** Mercado do ativo: B3 ou bolsas dos EUA. */
export type Market = "b3" | "us";

/** Bolsas dos EUA que cotamos, com o nome que a pessoa conhece (MIC ISO 10383). */
export const US_EXCHANGES = [
  { mic: "XNAS", label: "Nasdaq" },
  { mic: "XNYS", label: "NYSE" },
  { mic: "ARCX", label: "NYSE Arca" },
  { mic: "BATS", label: "Cboe" },
  { mic: "XASE", label: "NYSE American" },
] as const;
export type UsMic = (typeof US_EXCHANGES)[number]["mic"];

export const exchangeLabel = (mic: string | null | undefined) =>
  mic ? (US_EXCHANGES.find((e) => e.mic === mic)?.label ?? mic) : "B3";

const decimal = z.string().regex(/^-?\d+(\.\d+)?$/);

export const AssetQuoteSchema = z.object({
  symbol: z.string(),
  micCode: z.string().nullable(),
  currency: z.string().nullable(),
  price: decimal.nullable(),
  priceBrlCents: z.number().int().nullable(),
  fx: z.object({ rate: z.string(), date: z.string() }).loose().nullable(),
  asOf: z.string().nullable(),
  source: z.string().nullable(),
});
export type AssetQuote = z.infer<typeof AssetQuoteSchema>;

const TICKER = /^[A-Z0-9^.-]{1,20}$/;

/** Ticker normalizado, ou `null` enquanto não parece um ticker. */
export function normalizeTicker(text: string): string | null {
  const ticker = text.trim().toUpperCase();
  return TICKER.test(ticker) ? ticker : null;
}

/** Cotação do ativo (B3 sem `mic`; EUA com o MIC). Dado ausente vem `null` da API. */
export function useAssetQuote(
  symbol: string | null,
  mic: UsMic | null,
  { enabled }: { enabled: boolean },
) {
  return useQuery({
    queryKey: ["mercado", "cotacao", symbol, mic],
    queryFn: ({ signal }) =>
      apiRequest(
        `/v1/market/assets/${encodeURIComponent(symbol!)}/quote${mic ? `?mic=${mic}` : ""}`,
        AssetQuoteSchema,
        { signal },
      ),
    enabled: enabled && symbol !== null,
    staleTime: 60_000,
    retry: false,
  });
}

const AssetSearchSchema = z.object({
  data: z.array(z.object({ symbol: z.string(), name: z.string(), assetType: z.string() }).loose()),
});

/** Ativo da B3 pelo ticker exato (nome e tipo no catálogo). */
export function useB3Asset(symbol: string | null, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: ["mercado", "ativo", symbol],
    queryFn: async ({ signal }) => {
      const found = await apiRequest(
        `/v1/market/assets?q=${encodeURIComponent(symbol!)}&limit=5`,
        AssetSearchSchema,
        { signal },
      );
      return found.data.find((asset) => asset.symbol === symbol) ?? null;
    },
    enabled: enabled && symbol !== null,
    staleTime: 10 * 60_000,
    retry: false,
  });
}
