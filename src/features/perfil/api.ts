"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { toE164 } from "@/lib/phone";

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

const MeSchema = z
  .object({
    id: z.string(),
    displayName: z.string().nullable(),
    /** CPF só com o miolo (`***.456.789-**`); `null` = ainda não informado. */
    cpfMasked: z.string().nullable(),
    /** Celular em E.164 (`+5511987654321`); `null` = ainda não informado. */
    phone: z.string().nullable().optional(),
  })
  .loose();
export type Me = z.infer<typeof MeSchema>;

export const meKeys = { me: ["perfil", "eu"] as const };

/** O usuário logado (`GET /v1/me`): nome e o CPF mascarado. */
export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: meKeys.me,
    queryFn: ({ signal }) => apiRequest("/v1/me", MeSchema, { signal }),
    enabled,
    staleTime: 30 * 60_000,
  });
}

/** Grava o CPF da conta (`PUT /v1/me/cpf`); ele não muda depois de informado. */
export function saveCpf(cpf: string): Promise<Me> {
  return apiRequest("/v1/me/cpf", MeSchema, { method: "PUT", body: { cpf } });
}

/** `saveCpf` como mutação: atualiza o `useMe` com a resposta. */
export function useSetCpf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCpf,
    onSuccess: (me) => queryClient.setQueryData(meKeys.me, me),
  });
}

/** Grava o nome do perfil (`PATCH /v1/me`), depois de criar a conta. */
export function saveDisplayName(displayName: string): Promise<unknown> {
  return apiRequest("/v1/me", z.unknown(), { method: "PATCH", body: { displayName } });
}

/** Grava o celular (`PATCH /v1/me`), com os 11 dígitos com DDD. */
export function savePhone(digits: string): Promise<Me> {
  return apiRequest("/v1/me", MeSchema, { method: "PATCH", body: { phone: toE164(digits) } });
}

/** `savePhone` como mutação: atualiza o `useMe` com a resposta. */
export function useSetPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePhone,
    onSuccess: (me) => queryClient.setQueryData(meKeys.me, me),
  });
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
