"use client";

import { useSyncExternalStore } from "react";

import { useProfileAnswers, type QuestionnaireScope } from "@/stores/profile-answers";

import { profileQuestions } from "./data";
import { allAnswered, type ProfileAnswerMap } from "./profile";

const subscribeNothing = () => () => {};

/** As respostas marcadas no protótipo (o caminho do design): Moderado. */
const DESIGN_ANSWERS: ProfileAnswerMap = Object.fromEntries(
  profileQuestions.map((question, i) => [i + 1, question.escolhida]),
);

/**
 * Respostas que valem no resultado do questionário. As da pessoa ficam no navegador (aba), que o
 * servidor não vê: até a página hidratar, e quando faltam respostas (link direto no protótipo),
 * valem as do design.
 */
export function useResultAnswers(scope: QuestionnaireScope): ProfileAnswerMap {
  const stored = useProfileAnswers((state) => state.answers[scope]);
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return hydrated && allAnswered(stored) ? stored : DESIGN_ANSWERS;
}
