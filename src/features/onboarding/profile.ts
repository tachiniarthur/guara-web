/**
 * Perfil de investidor a partir das respostas do questionário (a mesma regra do app). É uma
 * estimativa mostrada logo depois das perguntas; a classificação oficial virá da API.
 */
import type { ProfileId } from "@/features/alocacao/data";

import { profileQuestions } from "./data";

/** Respostas: número da pergunta (1 a 6) → índice da opção (0 a 3). */
export type ProfileAnswerMap = Record<number, number>;

/** Pontos de cada opção, da mais cuidadosa (1) à mais ousada (4). */
const DEFAULT_POINTS = [1, 2, 3, 4];
/** Objetivo: "Renda extra todo mês" (4ª opção) é menos ousado que "Crescer no longo prazo". */
const POINTS: Record<number, number[]> = { 1: [1, 2, 4, 3] };
/** Experiência: só "Vários tipos, inclusive estruturados" (4ª opção) chega ao Sofisticado. */
const EXPERIENCE_QUESTION = 4;
const EXPERIENCED = 3;

/** Faixas da soma (6 a 24 pontos), da menor para a maior. */
const BANDS: { profile: ProfileId; max: number }[] = [
  { profile: "conservador", max: 11 },
  { profile: "moderado", max: 17 },
  { profile: "arrojado", max: 21 },
  { profile: "sofisticado", max: 24 },
];

export function profileScore(answers: ProfileAnswerMap): number {
  return profileQuestions.reduce((sum, _, i) => {
    const option = answers[i + 1];
    return option === undefined ? sum : sum + ((POINTS[i + 1] ?? DEFAULT_POINTS)[option] ?? 0);
  }, 0);
}

/**
 * Conservador até 11 pontos, Moderado de 12 a 17, Arrojado de 18 a 21, Sofisticado de 22 a 24.
 * Sem experiência com vários tipos de investimento, o perfil para no Arrojado.
 */
export function estimateProfile(answers: ProfileAnswerMap): ProfileId {
  const total = profileScore(answers);
  const profile = BANDS.find((band) => total <= band.max)?.profile ?? "sofisticado";
  if (profile === "sofisticado" && answers[EXPERIENCE_QUESTION] !== EXPERIENCED) return "arrojado";
  return profile;
}

export const allAnswered = (answers: ProfileAnswerMap) =>
  profileQuestions.every((_, i) => answers[i + 1] !== undefined);

const SUMMARY: Record<ProfileId, { lead: string; carteira: string }> = {
  conservador: {
    lead: "Você prefere proteger o dinheiro e aceita ganhar menos para evitar oscilações.",
    carteira: "uma carteira mais protegida",
  },
  moderado: {
    lead: "Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte do dinheiro protegida.",
    carteira: "uma carteira equilibrada",
  },
  arrojado: {
    lead: "Você aceita oscilações maiores em busca de mais retorno no longo prazo.",
    carteira: "uma carteira mais arrojada",
  },
  sofisticado: {
    lead: "Você conhece bem o mercado e aceita oscilações fortes, inclusive em investimentos mais complexos, em busca de mais retorno.",
    carteira: "uma carteira sofisticada",
  },
};

const RESGATE = [
  "a chance de precisar resgatar quase tudo",
  "a chance de resgatar mais da metade",
  "a parte pequena que talvez precise resgatar",
  "a reserva separada que você já tem",
];

/** "Você aceita alguma oscilação… Seu prazo de 3 a 10 anos e a parte pequena… combinam com…". */
export function profileDescription(profile: ProfileId, answers: ProfileAnswerMap): string {
  const { lead, carteira } = SUMMARY[profile];
  const prazo = answers[2] === undefined ? null : profileQuestions[1]?.curtas[answers[2]];
  const resgate = answers[6] === undefined ? null : RESGATE[answers[6]];
  if (!prazo || !resgate) return lead;
  return `${lead} Seu prazo de ${prazo.toLocaleLowerCase("pt-BR")} e ${resgate} combinam com ${carteira}.`;
}

/** "Suas respostas": a pergunta em uma palavra e a resposta curta ("—" se faltar). */
export function answersSummary(answers: ProfileAnswerMap) {
  return profileQuestions.map((question, i) => {
    const option = answers[i + 1];
    return {
      pergunta: question.resumo,
      resposta: option === undefined ? "—" : (question.curtas[option] ?? "—"),
    };
  });
}
