"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ApiError, apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi, markApiStale, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { percent } from "@/lib/live-format";

/*
 * Bens (imóveis e veículos) com os dados da API (`/v1/belongings`). O valor é sempre o que a
 * pessoa informa: não há tabela de preços nem lembrete automático de atualização.
 */

const cents = z.number().int();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isBelongingId = (id: string) => UUID.test(id);

export type BelongingKind = "real_estate" | "vehicle";

export const KIND_LABEL: Record<BelongingKind, string> = {
  real_estate: "Imóvel",
  vehicle: "Veículo",
};

export const BelongingSchema = z.object({
  id: z.string(),
  kind: z.enum(["real_estate", "vehicle"]),
  name: z.string(),
  valueCents: cents,
  valueDate: z.string(),
  debtCents: cents.nullable(),
  netCents: cents,
  updatedAt: z.string().optional(),
});
export type Belonging = z.infer<typeof BelongingSchema>;

const NetWorthSchema = z.object({ totalNetWorthCents: cents });

export interface BelongingView {
  id: string;
  kind: BelongingKind;
  tipo: string;
  nome: string;
  linha: string;
  valor: string;
  /** "Informado em 12/08/2026". */
  atualizacao: string;
  financiado: boolean;
  saldo: string;
  liquido: string;
  /** Quanto do valor já é da pessoa (0–100), com financiamento. */
  quitado: number | null;
  /** Parte do patrimônio total (texto), quando o total é conhecido. */
  noPatrimonio: string | null;
  form: { name: string; valueCents: number; valueDate: string; debtCents: number | null };
}

const brDay = (day: string) => formatDate(`${day}T12:00:00-03:00`);

export function toBelongingView(b: Belonging, netWorthCents: number | null): BelongingView {
  const financed = (b.debtCents ?? 0) > 0;
  const share =
    netWorthCents && netWorthCents > 0
      ? `${percent.format(Math.max(0, (b.netCents / netWorthCents) * 100))}% do total`
      : null;
  return {
    id: b.id,
    kind: b.kind,
    tipo: KIND_LABEL[b.kind],
    nome: b.name,
    linha: `${KIND_LABEL[b.kind]} · ${financed ? "financiado" : "quitado"}`,
    valor: formatCurrency(b.valueCents),
    atualizacao: `Valor informado por você em ${brDay(b.valueDate)}`,
    financiado: financed,
    saldo: formatCurrency(b.debtCents ?? 0),
    liquido: formatCurrency(b.netCents),
    quitado:
      financed && b.valueCents > 0
        ? Math.min(100, Math.max(0, Math.round((b.netCents / b.valueCents) * 100)))
        : null,
    noPatrimonio: share,
    form: {
      name: b.name,
      valueCents: b.valueCents,
      valueDate: b.valueDate,
      debtCents: b.debtCents,
    },
  };
}

const retry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status !== null && error.status < 500) && count < 2;

export const BELONGINGS_PATH = "/v1/belongings" satisfies ApiPath;
const belongingPath = (id: string): ApiPath => `${BELONGINGS_PATH}/${encodeURIComponent(id)}`;

export function useBelonging(id: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    ...apiQuery(belongingPath(id), BelongingSchema, { enabled: enabled && isBelongingId(id) }),
    retry,
  });
}

/** O patrimônio total de hoje (investido + bens − dívidas), do resumo de Investimentos. */
export function useNetWorth({ enabled }: { enabled: boolean }) {
  return useQuery(apiQuery("/v1/investments/summary", NetWorthSchema, { enabled }));
}

export type BelongingInput = {
  name: string;
  valueCents: number;
  valueDate: string;
  debtCents: number | null;
};

const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  invalidateApi(client, BELONGINGS_PATH, "/v1/investments", "/v1/dashboard");

export function useCreateBelonging(kind: BelongingKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: BelongingInput) =>
      apiRequest(BELONGINGS_PATH, BelongingSchema, { method: "POST", body: { kind, ...body } }),
    onSuccess: () => invalidate(client),
  });
}

export function useUpdateBelonging(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<BelongingInput>) =>
      apiRequest(belongingPath(id), BelongingSchema, { method: "PATCH", body }),
    onSuccess: () => invalidate(client),
  });
}

export function useRemoveBelonging(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest(belongingPath(id), z.undefined(), { method: "DELETE" }),
    // Sem buscar agora: a página do item excluído ainda está aberta e pediria um 404.
    onSuccess: () => markApiStale(client, BELONGINGS_PATH, "/v1/investments", "/v1/dashboard"),
  });
}
