"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { WarningBlock } from "@/features/acesso/components/auth-parts";
import { useSession } from "@/features/acesso/session";
import { useActivatePlan } from "@/features/perfil/api";
import { planById, plans, type PlanId } from "@/features/perfil/planos";
import { cn } from "@/lib/utils";

import { onboardingSteps } from "../data";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  OnboardingSteps,
} from "./onboarding-shell";

/**
 * Onboarding 1 · Plano. Todo plano é pago; enquanto não há pagamento, o ambiente de teste da API
 * ativa o plano escolhido na hora. No protótipo, só avança.
 */
export function PlanStep() {
  const router = useRouter();
  const { live, refresh } = useSession();
  const activate = useActivatePlan();
  const [selected, setSelected] = useState<PlanId>("plus");
  const plan = planById(selected);
  const label = activate.isPending ? "Assinando…" : `Assinar o ${plan.nome}`;

  function choose() {
    if (!live) return router.push("/onboarding/bancos");
    activate.mutate(selected, {
      onSuccess: async () => {
        await refresh();
        router.push("/onboarding/bancos");
      },
    });
  }

  const action = (
    <Button variant="primary" size="xl" block disabled={activate.isPending} onClick={choose}>
      <span>{label}</span>
    </Button>
  );

  return (
    <OnboardingShell
      zoom={1.37}
      mobileTop={<MobileHeader back="/boas-vindas" />}
      mobileActions={
        <MobileActionBar>
          <div className="grow">{action}</div>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={1} steps={onboardingSteps} />
      <OnboardingIntro title="Escolha seu plano">
        Todos os planos são mensais. Dá para trocar ou cancelar quando quiser, em Meu perfil.
      </OnboardingIntro>
      {activate.error && (
        <WarningBlock icon="alert-triangle">{activate.error.message}</WarningBlock>
      )}
      <div role="radiogroup" aria-label="Planos" className="flex flex-col gap-3">
        {plans.map((item) => {
          const checked = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${item.nome}, ${item.preco} por mês`}
              onClick={() => setSelected(item.id)}
              className={cn(
                "flex flex-col gap-3 rounded-card bg-field p-4 text-left",
                checked ? "border-2 border-tucano" : "border border-line",
              )}
            >
              <span className="flex items-center justify-between gap-2.5">
                <strong className="grow font-display text-20">{item.nome}</strong>
                <span className="font-display text-20 font-extrabold tabular-nums">
                  {item.preco}
                  <span className="text-14 font-medium text-mist"> /mês</span>
                </span>
              </span>
              <span className="text-14 font-bold">{`${item.bancos} · ${item.perguntas}`}</span>
              <span className="flex flex-col gap-1.5">
                {item.recursos.map((recurso) => (
                  <span key={recurso} className="flex items-start gap-2 text-14 text-mist">
                    <span className="mt-0.5 text-folha">
                      <Icon name="check" size={16} strokeWidth={2.2} />
                    </span>
                    {recurso}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <OnboardingActions>
        <div className="grow" />
        <div>{action}</div>
      </OnboardingActions>
    </OnboardingShell>
  );
}
