"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  ASSET_CLASSES,
  CLASS_COLOR,
  PROFILE_KINDS,
  type AssetClassId,
  type ProfileKind,
} from "@/features/alocacao/live";
import { apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi } from "@/lib/api-query";
import { apiPercent } from "@/lib/live-format";

/*
 * Questionário de perfil de investidor, todo da API: as perguntas e os textos
 * (`GET /v1/investor-profile/questionnaire`), o cálculo do perfil sem gravar (`/preview`) e o
 * envio (`POST /v1/investor-profile`), que grava o perfil e conclui a etapa do onboarding. Os
 * pontos ficam só na API. As respostas marcadas ficam na aba (`stores/profile-answers`), pelo
 * número da pergunta e a posição da opção.
 */

const ClassSchema = z.enum(ASSET_CLASSES);
const KindSchema = z.enum(PROFILE_KINDS);
const TargetSchema = z.array(
  z.object({ assetClass: ClassSchema, label: z.string(), targetPct: apiPercent }),
);

export const QuestionnaireSchema = z.object({
  version: z.string(),
  provisional: z.boolean(),
  questions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      summary: z.string(),
      why: z.string(),
      options: z.array(z.object({ id: z.string(), label: z.string(), short: z.string() })),
    }),
  ),
  profiles: z.array(
    z.object({
      profile: KindSchema,
      label: z.string(),
      description: z.string(),
      targetAllocation: TargetSchema,
    }),
  ),
});
export type Questionnaire = z.infer<typeof QuestionnaireSchema>;
export type Question = Questionnaire["questions"][number];

export const PreviewSchema = z.object({
  profile: KindSchema,
  label: z.string(),
  score: z.number().int(),
  targetAllocation: TargetSchema,
});

export const SavedProfileSchema = z
  .object({
    id: z.string(),
    profile: KindSchema,
    label: z.string(),
    suggestedProfile: KindSchema,
    chosenByUser: z.boolean(),
    createdAt: z.string(),
  })
  .loose();

/** Respostas marcadas: número da pergunta (1, 2…) → posição da opção (0, 1…). */
export type AnswerMap = Record<number, number>;

/** Um perfil do questionário, com a carteira-alvo por classe. */
export interface ProfileOption {
  kind: ProfileKind;
  nome: string;
  descricao: string;
  alvo: Record<AssetClassId, number>;
}

export const QUESTIONNAIRE_PATH = "/v1/investor-profile/questionnaire";

/** Todas as perguntas respondidas, com uma opção que existe. */
export function allAnswered(questionnaire: Questionnaire, answers: AnswerMap): boolean {
  return questionnaire.questions.every((question, i) => {
    const option = answers[i + 1];
    return option !== undefined && question.options[option] !== undefined;
  });
}

/** As respostas no formato da API (`{ horizon: "3_10y", … }`); `null` se falta alguma. */
export function toAnswerBody(
  questionnaire: Questionnaire,
  answers: AnswerMap,
): Record<string, string> | null {
  if (!allAnswered(questionnaire, answers)) return null;
  return Object.fromEntries(
    questionnaire.questions.map((question, i) => [
      question.id,
      question.options[answers[i + 1]!]!.id,
    ]),
  );
}

/** "Suas respostas": o rótulo curto da pergunta e a opção em poucas palavras. */
export function answersSummary(questionnaire: Questionnaire, answers: AnswerMap) {
  return questionnaire.questions.flatMap((question, i) => {
    const option = question.options[answers[i + 1] ?? -1];
    return option ? [{ pergunta: question.summary, resposta: option.short }] : [];
  });
}

/** Os perfis na ordem da API (do mais cuidadoso ao mais ousado), com o alvo por classe. */
export function toProfileOptions(questionnaire: Questionnaire): ProfileOption[] {
  return questionnaire.profiles.map((p) => ({
    kind: p.profile,
    nome: p.label,
    descricao: p.description,
    alvo: Object.fromEntries(
      ASSET_CLASSES.map((id) => [
        id,
        p.targetAllocation.find((t) => t.assetClass === id)?.targetPct ?? 0,
      ]),
    ) as Record<AssetClassId, number>,
  }));
}

/** Nome e cor de cada classe, na ordem da API. */
export function classesOf(questionnaire: Questionnaire) {
  const first = questionnaire.profiles[0]?.targetAllocation ?? [];
  return ASSET_CLASSES.map((id) => ({
    id,
    nome: first.find((t) => t.assetClass === id)?.label ?? id,
    cor: CLASS_COLOR[id],
  }));
}

/** Parte em renda variável e alternativos da carteira-alvo (o risco do perfil). */
export const riskShare = (profile: ProfileOption) =>
  profile.alvo.equities + profile.alvo.alternatives;

export function useQuestionnaire({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery(
    apiQuery(QUESTIONNAIRE_PATH, QuestionnaireSchema, { enabled, staleTime: 60 * 60_000 }),
  );
}

/** O perfil que as respostas indicam, calculado pela API sem gravar. */
export function useProfilePreview(
  version: string | undefined,
  answers: Record<string, string> | null,
) {
  return useQuery({
    queryKey: ["perfil-investidor", "previa", version, answers],
    queryFn: ({ signal }) =>
      apiRequest("/v1/investor-profile/preview", PreviewSchema, {
        method: "POST",
        body: { questionnaireVersion: version, answers },
        signal,
      }),
    enabled: Boolean(version && answers),
    staleTime: Infinity,
  });
}

export interface SaveProfileInput {
  version: string;
  answers: Record<string, string>;
  /** Outro perfil escolhido pela pessoa no lugar do indicado (com o termo aceito). */
  chosen: ProfileKind | null;
}

/** Grava o perfil (e conclui a etapa do onboarding); a alocação passa a usar o alvo dele. */
export function useSaveProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ version, answers, chosen }: SaveProfileInput) =>
      apiRequest("/v1/investor-profile", SavedProfileSchema, {
        method: "POST",
        body: {
          questionnaireVersion: version,
          answers,
          ...(chosen ? { chosenProfile: chosen, acceptedChangeTerm: true } : {}),
        },
      }),
    onSuccess: () =>
      invalidateApi(client, "/v1/investor-profile", "/v1/investments", "/v1/onboarding"),
  });
}
