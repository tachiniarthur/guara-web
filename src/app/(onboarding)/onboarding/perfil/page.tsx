import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import {
  OnboardingActions,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { onboardingSteps, riskQuestion } from "@/features/onboarding/data";

const laterClass =
  "flex h-13 items-center text-15 font-semibold whitespace-nowrap text-mist underline underline-offset-3 hover:text-sand";

export default function PerfilInvestidorPage() {
  return (
    <OnboardingShell
      mobileTop={
        <MobileHeader
          title="Perfil de investidor"
          back="/onboarding/bancos"
          actions={
            <IconButtonLink href="/" icon="x" label="Sair do questionário" variant="ghost" />
          }
        />
      }
      mobileActions={
        <MobileActionBar>
          <Link href="/onboarding/assistentes" className={`${laterClass} px-1.5`}>
            Responder depois
          </Link>
          <ButtonLink href="/onboarding/assistentes" variant="light" size="xl" className="grow">
            <span>Continuar</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={2} steps={onboardingSteps} />
      <fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
        <legend className="mb-4 p-0">
          <span className="mb-2 block">
            <span className="text-13 text-caption">
              Pergunta {riskQuestion.numero} de {riskQuestion.total}
            </span>
          </span>
          <span className="block font-display text-24 leading-[1.3] font-bold tracking-[-0.01em] md:text-28 md:font-extrabold">
            {riskQuestion.pergunta}
          </span>
        </legend>
        {riskQuestion.opcoes.map((opcao, i) => (
          <label
            key={opcao}
            htmlFor={`queda-${i}`}
            className="flex min-h-15 cursor-pointer items-center gap-3.5 rounded-bubble border border-line-strong bg-field px-4 text-16 font-medium has-checked:border-2 has-checked:border-sand has-checked:font-bold"
          >
            <input
              id={`queda-${i}`}
              type="radio"
              name="queda"
              defaultChecked={i === riskQuestion.escolhida}
              className="m-0 size-5.5 shrink-0 accent-sand"
            />
            {opcao}
          </label>
        ))}
      </fieldset>
      <details open className="border-t border-line pt-2">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-15 font-bold">
          <Icon name="info-lg" size={18} />
          Por que perguntamos isso?
        </summary>
        <p className="m-0 mt-1 text-14 leading-[1.6] text-mist">
          Seu perfil ajuda a montar simulações que combinam com você. Ele vale só para Investimentos
          e pode ser refeito quando quiser em Meu perfil.
        </p>
      </details>
      <OnboardingActions>
        <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <Link href="/onboarding/assistentes" className={`${laterClass} px-3`}>
          Responder depois
        </Link>
        <ButtonLink href="/onboarding/assistentes" variant="light" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </OnboardingActions>
    </OnboardingShell>
  );
}
