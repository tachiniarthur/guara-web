import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Questionário do onboarding ou o "Refazer perfil" de Meu perfil (respostas separadas). */
export type QuestionnaireScope = "onboarding" | "refazer";

type ProfileAnswersState = {
  /** Opção escolhida em cada pergunta (número da pergunta → índice da opção). */
  answers: Record<QuestionnaireScope, Record<number, number>>;
  answer: (scope: QuestionnaireScope, question: number, option: number) => void;
};

/**
 * Respostas do questionário de perfil. Começam vazias: a pessoa escolhe cada uma, e só avança
 * escolhendo. Guardadas na aba, para voltar uma pergunta sem perder o que marcou.
 */
export const useProfileAnswers = create<ProfileAnswersState>()(
  persist(
    (set) => ({
      answers: { onboarding: {}, refazer: {} },
      answer: (scope, question, option) =>
        set((state) => ({
          answers: { ...state.answers, [scope]: { ...state.answers[scope], [question]: option } },
        })),
    }),
    { name: "guara-profile-answers", storage: createJSONStorage(() => sessionStorage) },
  ),
);
