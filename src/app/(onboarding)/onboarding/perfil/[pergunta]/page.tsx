import { notFound } from "next/navigation";

import { OnboardingQuestionStep } from "@/features/onboarding/components/question-step";

/** O questionário atual da API tem 6 perguntas; outro número abre sob demanda (e dá 404 se não existir). */
export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({ pergunta: String(i + 1) }));
}

/** Onboarding 3 · uma pergunta do perfil de investidor. Obrigatório: não há "responder depois". */
export default async function PerguntaPerfilPage({
  params,
}: {
  params: Promise<{ pergunta: string }>;
}) {
  const numero = Number((await params).pergunta);
  if (!Number.isInteger(numero) || numero < 1 || numero > 50) notFound();
  return <OnboardingQuestionStep numero={numero} />;
}
