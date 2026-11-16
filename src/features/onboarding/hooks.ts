"use client";

import { useSession } from "@/features/acesso/session";
import { useMyPlan } from "@/features/perfil/api";
import { featuredPlan, planById } from "@/features/perfil/planos";

/** Nome e limite de bancos do plano: da API com login de verdade; no protótipo, o Plus. */
export function usePlanBanks(): { nome: string; limite: number } {
  const { live } = useSession();
  const mine = useMyPlan({ enabled: live });
  const prototype = planById(featuredPlan);
  const plan = live ? mine.data?.plan : null;
  if (plan) return { nome: plan.name, limite: plan.limits.bankConnections };
  return { nome: prototype.nome, limite: prototype.limiteBancos };
}
