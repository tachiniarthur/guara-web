"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";

import type { BillingPeriod, PlanId } from "./planos";

const limit = z.number().int().nullable();
const counter = z.object({ used: z.number().int(), limit });

/** Resposta de `GET /v1/me/plan` (tudo `null` sem plano em vigor). */
export const MyPlanSchema = z.object({
  plan: z
    .object({
      id: z.enum(["basic", "plus", "pro", "private"]),
      name: z.string(),
      monthlyPriceCents: z.number().int().nullable(),
      limits: z
        .object({
          bankConnections: z.number().int(),
          aiQuestionsPerMonth: z.number().int(),
          specialists: z.number().int().nullable(),
        })
        .loose(),
    })
    .loose()
    .nullable(),
  subscription: z
    .object({
      status: z.enum(["active", "canceled"]),
      billingPeriod: z.enum(["monthly", "annual"]),
      currentPeriodEnd: z.string().nullable(),
    })
    .loose()
    .nullable(),
  usage: z.object({ month: z.string(), aiQuestions: counter, simulationRuns: counter }).nullable(),
  assistants: z
    .object({ chosen: z.array(z.string()), active: z.array(z.string()), limit })
    .nullable(),
});
export type MyPlan = z.infer<typeof MyPlanSchema>;

export const planKeys = { mine: ["plano", "meu"] as const };

export function fetchMyPlan(signal?: AbortSignal): Promise<MyPlan> {
  return apiRequest("/v1/me/plan", MyPlanSchema, { signal });
}

/** Plano do usuário, uso do mês e assistentes. */
export function useMyPlan({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: planKeys.mine,
    queryFn: ({ signal }) => fetchMyPlan(signal),
    enabled,
    staleTime: 30 * 60_000,
  });
}

/**
 * Escolhe o plano enquanto não há pagamento: no ambiente de teste a API ativa na hora
 * (`POST /v1/me/plan`); em produção ela recusa (403).
 */
export function useActivatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { planId: PlanId; billingPeriod: BillingPeriod }) =>
      apiRequest("/v1/me/plan", MyPlanSchema, { method: "POST", body }),
    onSuccess: (plan) => queryClient.setQueryData(planKeys.mine, plan),
  });
}

/** Troca entre mensal e anual (`PUT /v1/me/plan/billing-period`). */
export function useChangeBillingPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billingPeriod: BillingPeriod) =>
      apiRequest("/v1/me/plan/billing-period", MyPlanSchema, {
        method: "PUT",
        body: { billingPeriod },
      }),
    onSuccess: (plan) => queryClient.setQueryData(planKeys.mine, plan),
  });
}

/** Grava o nome do perfil (`PATCH /v1/me`), depois de criar a conta. */
export function saveDisplayName(displayName: string): Promise<unknown> {
  return apiRequest("/v1/me", z.unknown(), { method: "PATCH", body: { displayName } });
}

/** Troca os assistentes escolhidos (`PUT /v1/me/plan/assistants`), na ordem de preferência. */
export function useChooseAssistants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assistants: string[]) =>
      apiRequest("/v1/me/plan/assistants", MyPlanSchema, {
        method: "PUT",
        body: { assistants },
      }),
    onSuccess: (plan) => queryClient.setQueryData(planKeys.mine, plan),
  });
}
