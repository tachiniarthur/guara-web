import { DetalhesScreen } from "./detalhes-screen";

/** Mais detalhes do ativo: a ficha da posição e do mercado (o segmento é o id da posição). */
export default async function DetalhesPage({
  params,
}: PageProps<"/investimentos/[ativo]/detalhes">) {
  const { ativo } = await params;
  return <DetalhesScreen id={ativo} />;
}
