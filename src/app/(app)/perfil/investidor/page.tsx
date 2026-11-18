import { RedoQuestionScreen } from "@/features/perfil/components/redo-question";

/** Refazer o perfil de investidor, uma pergunta por vez (`?pergunta=2`…). */
export default async function RefazerPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ pergunta?: string }>;
}) {
  const numero = Number((await searchParams).pergunta) || 1;
  return <RedoQuestionScreen numero={numero} />;
}
