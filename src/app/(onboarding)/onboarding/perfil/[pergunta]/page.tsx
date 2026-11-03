import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import {
  OnboardingActions,
  OnboardingShell,
  stepFrame,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import {
  ProfileQuestionFields,
  QuestionContinue,
  RequireEarlierAnswers,
} from "@/features/onboarding/components/profile-question";
import { onboardingSteps, profileQuestions } from "@/features/onboarding/data";

export function generateStaticParams() {
  return profileQuestions.map((_, i) => ({ pergunta: String(i + 1) }));
}

/** Onboarding 3 · uma pergunta do perfil de investidor. Obrigatório: não há "responder depois". */
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
      {...stepFrame}
      mobileTop={<MobileHeader title="Perfil de investidor" back={back} balanced />}
      mobileActions={
        <MobileActionBar>
          <QuestionContinue scope="onboarding" numero={numero} href={next} className="grow" />
        </MobileActionBar>
      }
    >
      <RequireEarlierAnswers before={numero} />
      <OnboardingSteps current={3} steps={onboardingSteps} />
      <ProfileQuestionFields
        question={question}
        numero={numero}
        total={total}
        name={`pergunta-${numero}`}
        scope="onboarding"
      />
      <OnboardingActions>
        <ButtonLink href={back} variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <QuestionContinue scope="onboarding" numero={numero} href={next} />
      </OnboardingActions>
    </OnboardingShell>
  );
}
