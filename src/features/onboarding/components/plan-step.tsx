"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { WarningBlock } from "@/features/acesso/components/auth-parts";
import { useSession } from "@/features/acesso/session";
import { useActivatePlan } from "@/features/perfil/api";
import {
  featuredPlan,
  planFeatureRows,
  planPitch,
  plans,
  type Plan,
  type PlanId,
} from "@/features/perfil/planos";
import { cn } from "@/lib/utils";

import { onboardingSteps } from "../data";
import { OnboardingIntro, OnboardingShell, OnboardingSteps } from "./onboarding-shell";

function PlanColumn({
  plan,
  index,
  busy,
  onChoose,
}: {
  plan: Plan;
  index: number;
  busy: boolean;
  onChoose: () => void;
}) {
  const featured = plan.id === featuredPlan;
  return (
    <section
      aria-labelledby={`plano-${plan.id}`}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-card bg-card",
        featured ? "border-2 border-tucano" : "border border-line",
      )}
    >
      {featured && (
        <div className="bg-tucano py-1 text-center text-12 font-bold tracking-[0.06em] text-canvas uppercase">
          Mais popular
        </div>
      )}
      <div className="flex grow flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <h2 id={`plano-${plan.id}`} className="m-0 text-20 font-bold">
            {plan.nome}
          </h2>
          <p className="m-0 font-display text-34 leading-none font-extrabold tabular-nums">
            {plan.preco}
            <span className="ml-1 font-sans text-14 font-medium text-mist">/mês</span>
          </p>
          <p className="m-0 text-14 leading-normal text-mist">{planPitch[plan.id]}</p>
        </div>
        <ul className="m-0 flex grow list-none flex-col gap-2.5 p-0">
          {planFeatureRows.map((row) => {
            const value = row.values[index];
            return (
              <li
                key={row.off}
                className={cn(
                  "flex items-start gap-2.5 text-14 leading-snug",
                  value ? "text-sand" : "text-caption",
                )}
              >
                <span className={cn("mt-0.5", value ? "text-folha" : "text-caption")}>
                  <Icon name={value ? "check" : "x"} size={16} strokeWidth={2.2} />
                </span>
                {value ?? (
                  <span>
                    <span className="sr-only">Não inclui: </span>
                    {row.off}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <Button
          variant={featured ? "primary" : "secondary"}
          size="xl"
          block
          disabled={busy}
          onClick={onChoose}
        >
          <span>{`Assinar o ${plan.nome}`}</span>
        </Button>
      </div>
    </section>
  );
}

/**
 * Onboarding 1 · Plano: os três planos lado a lado, cada um com o próprio botão. Todo plano é
 * pago; enquanto não há pagamento, o ambiente de teste da API ativa o plano na hora. No
 * protótipo, só avança.
 */
export function PlanStep() {
  const router = useRouter();
  const { live, refresh } = useSession();
  const activate = useActivatePlan();
  const [choosing, setChoosing] = useState<PlanId | null>(null);

  function choose(planId: PlanId) {
    if (!live) return router.push("/onboarding/bancos");
    setChoosing(planId);
    activate.mutate(planId, {
      onSuccess: async () => {
        await refresh();
        router.push("/onboarding/bancos");
      },
      onSettled: () => setChoosing(null),
    });
  }

  return (
    <OnboardingShell
      wide
      zoom={1.2}
      mobileTop={<MobileHeader />}
      tabletWidth="md:w-[calc(100%-3rem)] md:max-w-[72rem]"
      desktopWidth="lg:max-w-[72rem]"
    >
      <OnboardingSteps current={1} steps={onboardingSteps} />
      <OnboardingIntro title="Escolha seu plano">
        Todos os planos são mensais e têm os assistentes de IA. Dá para trocar ou cancelar quando
        quiser, em Meu perfil.
      </OnboardingIntro>
      {activate.error && (
        <WarningBlock icon="alert-triangle">{activate.error.message}</WarningBlock>
      )}
      <div className="grid gap-4 min-[56rem]:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanColumn
            key={plan.id}
            plan={plan}
            index={index}
            busy={choosing !== null}
            onChoose={() => choose(plan.id)}
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
