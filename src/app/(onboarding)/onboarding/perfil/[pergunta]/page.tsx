import Link from "next/link";
import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { IconButtonLink } from "@/components/ui/icon-button";
import {
  OnboardingActions,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { ProfileQuestionFields } from "@/features/onboarding/components/profile-question";
import { onboardingSteps, profileQuestions } from "@/features/onboarding/data";

const laterClass =
  "flex h-13 items-center text-15 font-semibold whitespace-nowrap text-mist underline underline-offset-3 hover:text-sand";

export function generateStaticParams() {
  return profileQuestions.map((_, i) => ({ pergunta: String(i + 1) }));
}

export default async function PerguntaPerfilPage({
  params,
}: {
  params: Promise<{ pergunta: string }>;
}) {
  const { pergunta } = await params;
  const numero = Number(pergunta);
  const question = profileQuestions[numero - 1];
  if (!question) notFound();

  const total = profileQuestions.length;
  const back = numero === 1 ? "/onboarding/bancos" : `/onboarding/perfil/${numero - 1}`;
  const next =
    numero === total ? "/onboarding/perfil/resultado" : `/onboarding/perfil/${numero + 1}`;

  return (
    <OnboardingShell
      mobileTop={
        <MobileHeader
          title="Perfil de investidor"
          back={back}
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
          <ButtonLink href={next} variant="light" size="xl" className="grow">
            <span>Continuar</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={2} steps={onboardingSteps} />
      <ProfileQuestionFields
        question={question}
        numero={numero}
        total={total}
        name={`pergunta-${numero}`}
      />
      <OnboardingActions>
        <ButtonLink href={back} variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <Link href="/onboarding/assistentes" className={`${laterClass} px-3`}>
          Responder depois
        </Link>
        <ButtonLink href={next} variant="light" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </OnboardingActions>
    </OnboardingShell>
  );
}
