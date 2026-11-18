"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { CLASS_COLOR, type AssetClassId } from "@/features/alocacao/live";
import { apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildView, percent } from "@/lib/live-format";

import {
  INSTRUMENT,
  INVESTIMENTOS_PATHS,
  PositionsSchema,
  RISK,
  positionHref,
  type ApiPosition,
  type Positions,
} from "./live";
import type { Risk } from "./types";

/** Todas as posições (tela Posições), da API, por classe. */

export type HoldingOrigin = "Open Finance" | "Cadastro manual";

export type Holding = {
  id: string;
  href: string;
  nome: string;
  descricao: string;
  instrumento: string;
  risco: Risk;
  origem: string;
  tipoOrigem: HoldingOrigin;
  total: string;
  valorCents: number;
  percentual: string;
  /** Rentabilidade sobre o custo (`null` sem valor). */
  retorno: number | null;
  rentabilidade: { valor: string; alta: boolean };
};

export type HoldingClass = {
  classe: string;
  cor: string;
  total: string;
  percentual: string;
  itens: Holding[];
};

export interface HoldingsData {
  classes: HoldingClass[];
  total: string;
  quantidade: number;
  /** "Valores de 16/11" (a data do valor mais recente). */
  atualizacao: string;
  porOrigem: { label: string; value: string }[];
}

export const RISK_API: Record<Risk, ApiPosition["risk"]> = {
  Baixo: "low",
  Médio: "medium",
  Alto: "high",
};

function toHolding(p: ApiPosition): Holding {
  const manual = p.source === "manual";
  return {
    id: p.id,
    href: positionHref(p.id),
    nome: p.symbol ?? p.name,
    descricao: p.symbol ? p.name : (INSTRUMENT[p.instrumentType] ?? p.instrumentType),
    instrumento: INSTRUMENT[p.instrumentType] ?? p.instrumentType,
    risco: RISK[p.risk],
    origem: manual ? "Cadastro manual" : "Open Finance",
    tipoOrigem: manual ? "Cadastro manual" : "Open Finance",
    total: formatCurrency(p.valueCents),
    valorCents: p.valueCents ?? 0,
    percentual: p.portfolioPct === null ? "—" : `${percent.format(p.portfolioPct)}%`,
    retorno: p.returnPct,
    rentabilidade:
      p.returnPct === null
        ? { valor: "—", alta: true }
        : { valor: `${percent.format(Math.abs(p.returnPct))}%`, alta: p.returnPct >= 0 },
  };
}

/** Converte a lista da API no que a tela Posições mostra (função pura, testada). */
export function toHoldings(r: Positions): HoldingsData {
  const all = r.data;
  const totalCents = all.reduce((sum, p) => sum + (p.valueCents ?? 0), 0);
  const classes = (r.groups ?? []).map((g) => ({
    classe: g.label,
    cor: CLASS_COLOR[g.assetClass as AssetClassId] ?? "#93A198",
    total: formatCurrency(g.valueCents),
    percentual: g.pct === null ? "—" : `${percent.format(g.pct)}%`,
    itens: g.positions.map(toHolding),
  }));
  const byOrigin = (origin: HoldingOrigin) => {
    const list = all.filter((p) => (p.source === "manual") === (origin === "Cadastro manual"));
    const cents = list.reduce((sum, p) => sum + (p.valueCents ?? 0), 0);
    return {
      label: origin,
      value: `${list.length === 1 ? "1 posição" : `${list.length} posições`} · ${formatCurrency(cents)}`,
    };
  };
  const latest = all
    .map((p) => p.valuedOn)
    .filter(Boolean)
    .sort()
    .at(-1);
  return {
    classes,
    total: formatCurrency(totalCents),
    quantidade: all.length,
    atualizacao: latest
      ? `valores de ${formatDate(`${latest}T12:00:00-03:00`, "dd/MM")}`
      : "sem valores atualizados",
    porOrigem: [byOrigin("Open Finance"), byOrigin("Cadastro manual")],
  };
}

/** As posições por classe (o mesmo endereço da tela Investimentos: cache compartilhado). */
export function useHoldings({ enabled }: { enabled: boolean }) {
  const query = useQuery(apiQuery(INVESTIMENTOS_PATHS.positions, PositionsSchema, { enabled }));
  if (!query.data) return { data: undefined, error: query.error };
  const data = query.data;
  return buildView("posicoes", () => toHoldings(data));
}

const UpdatedSchema = z.object({ id: z.string() }).loose();

/** Corrige o risco de uma posição (vale só para a carteira da pessoa). */
export function useUpdateRisk(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (risk: Risk) =>
      apiRequest(`/v1/investments/positions/${id}`, UpdatedSchema, {
        method: "PATCH",
        body: { risk: RISK_API[risk] },
      }),
    onSuccess: () => invalidateApi(client, "/v1/investments", "/v1/goals"),
  });
}
