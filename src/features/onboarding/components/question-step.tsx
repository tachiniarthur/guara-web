"use client";

import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { useSession } from "@/features/acesso/session";

import { onboardingSteps } from "../data";
import { useQuestionnaire } from "../questionnaire";
import { OnboardingActions, OnboardingShell, OnboardingSteps, stepFrame } from "./onboarding-shell";
import { ProfileQuestionFields, QuestionContinue, RequireEarlierAnswers } from "./profile-question";

/** Onboarding 3 · uma pergunta do perfil de investidor (texto da API). Obrigatório. */
export function OnboardingQuestionStep({ numero }: { numero: number }) {
  const { live } = useSession();
  const questionnaire = useQuestionnaire({ enabled: live });
  const total = questionnaire.data?.questions.length;
  const question = questionnaire.data?.questions[numero - 1];
  if (total !== undefined && !question) notFound();

  const back = numero === 1 ? "/onboarding/bancos" : `/onboarding/perfil/${numero - 1}`;
  const next =
    numero === total ? "/onboarding/perfil/resultado" : `/onboarding/perfil/${numero + 1}`;
  const failed = !live || questionnaire.error;

  return (
    <OnboardingShell
      {...stepFrame}
      mobileTop={<MobileHeader title="Perfil de investidor" back={back} balanced />}
      mobileActions={
        question && (
          <MobileActionBar>
            <QuestionContinue scope="onboarding" numero={numero} href={next} className="grow" />
          </MobileActionBar>
        )
      }
    >
      <RequireEarlierAnswers before={numero} />
      <OnboardingSteps current={3} steps={onboardingSteps} />
      {failed ? (
        <ErrorBlock />
      ) : !question || total === undefined ? (
        <LoadingStatus />
      ) : (
        <ProfileQuestionFields
          question={question}
          numero={numero}
          total={total}
          name={`pergunta-${numero}`}
          scope="onboarding"
        />
      )}
      <OnboardingActions>
        <ButtonLink href={back} variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        {question && <QuestionContinue scope="onboarding" numero={numero} href={next} />}
      </OnboardingActions>
    </OnboardingShell>
  );
}

/** Cabeçalho do resultado no celular: volta para a última pergunta do questionário da API. */
export function ResultHeader() {
  const { live } = useSession();
  const total = useQuestionnaire({ enabled: live }).data?.questions.length ?? 1;
  return (
    <MobileHeader title="Perfil de investidor" back={`/onboarding/perfil/${total}`} balanced />
  );
}
