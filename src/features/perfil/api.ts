"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";

import type { PlanId } from "./planos";

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
        .object({ bankConnections: z.number().int(), aiQuestionsPerMonth: z.number().int() })
        .loose(),
    })
    .loose()
    .nullable(),
  subscription: z
    .object({ status: z.enum(["active", "canceled"]), currentPeriodEnd: z.string().nullable() })
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
    mutationFn: (planId: PlanId) =>
      apiRequest("/v1/me/plan", MyPlanSchema, { method: "POST", body: { planId } }),
    onSuccess: (plan) => queryClient.setQueryData(planKeys.mine, plan),
  });
}
