"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { type ApiPath, apiQuery, invalidateApi } from "@/lib/api-query";

/**
 * Gastos futuros e projeção dos próximos meses (`/v1/planned-expenses`): o que a pessoa cadastra
 * (parcela do carro até 2031), as sugestões de gasto recorrente e a soma dos gastos fixos de cada
 * mês depois do atual (assinaturas ativas + gastos futuros). O mês atual nunca é projetado.
 */

const month = z.string().regex(/^\d{4}-\d{2}$/);

export const PlannedExpenseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    amountCents: z.number().int(),
    categoryId: z.string().nullable(),
    startMonth: month,
    endMonth: month.nullable(),
    source: z.enum(["manual", "detected"]),
  })
  .loose();
export type PlannedExpense = z.infer<typeof PlannedExpenseSchema>;

const PlannedListSchema = z.object({ data: z.array(PlannedExpenseSchema) }).loose();

export const SuggestionSchema = z
  .object({
    key: z.string(),
    name: z.string(),
    amountCents: z.number().int(),
    categoryId: z.string().nullable(),
    months: z.array(month),
  })
  .loose();
export type Suggestion = z.infer<typeof SuggestionSchema>;

const SuggestionListSchema = z.object({ data: z.array(SuggestionSchema) }).loose();

export const ProjectionItemSchema = z
  .object({
    kind: z.enum(["subscription", "planned"]),
    id: z.string(),
    name: z.string(),
    amountCents: z.number().int(),
  })
  .loose();
export type ProjectionItem = z.infer<typeof ProjectionItemSchema>;

export const ProjectedMonthSchema = z
  .object({
    month,
    totalCents: z.number().int(),
    subscriptionsCents: z.number().int(),
    plannedCents: z.number().int(),
    items: z.array(ProjectionItemSchema),
  })
  .loose();
export type ProjectedMonth = z.infer<typeof ProjectedMonthSchema>;

const ProjectionSchema = z
  .object({ currentMonth: month, months: z.array(ProjectedMonthSchema) })
  .loose();
export type Projection = z.infer<typeof ProjectionSchema>;

/** Quantos meses depois do atual a tela mostra (o seletor de mês e o bloco). */
export const PROJECTION_MONTHS = 12;

const BASE = "/v1/planned-expenses" as const;
export const plannedPaths = {
  list: BASE as ApiPath,
  suggestions: `${BASE}/suggestions` as ApiPath,
  projection: `${BASE}/projection?months=${PROJECTION_MONTHS}` as ApiPath,
};

export function usePlannedExpenses({ enabled }: { enabled: boolean }) {
  return useQuery(apiQuery(plannedPaths.list, PlannedListSchema, { enabled }));
}

export function useSuggestions({ enabled }: { enabled: boolean }) {
  // A detecção lê 12 meses de lançamentos: fresca por 30 minutos.
  return useQuery(
    apiQuery(plannedPaths.suggestions, SuggestionListSchema, { enabled, staleTime: 30 * 60_000 }),
  );
}

export function useProjection({ enabled }: { enabled: boolean }) {
  return useQuery(apiQuery(plannedPaths.projection, ProjectionSchema, { enabled }));
}

export interface PlannedExpenseInput {
  name: string;
  amountCents: number;
  startMonth?: string;
  endMonth: string | null;
  merchantKey?: string;
}

/** Cadastrar, editar, apagar e dispensar sugestão; depois, lista, sugestões e projeção recarregam. */
export function usePlannedMutations() {
  const client = useQueryClient();
  const refresh = () => invalidateApi(client, BASE);
  const create = useMutation({
    mutationFn: (body: PlannedExpenseInput) =>
      apiRequest(BASE, PlannedExpenseSchema, { method: "POST", body }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: Omit<PlannedExpenseInput, "merchantKey"> & { id: string }) =>
      apiRequest(`${BASE}/${id}`, PlannedExpenseSchema, { method: "PATCH", body }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`${BASE}/${id}`, z.undefined(), { method: "DELETE" }),
    onSuccess: refresh,
  });
  const dismiss = useMutation({
    mutationFn: (merchantKey: string) =>
      apiRequest(`${BASE}/suggestions/dismiss`, z.undefined(), {
        method: "POST",
        body: { merchantKey },
      }),
    onSuccess: refresh,
  });
  return { create, update, remove, dismiss };
}
