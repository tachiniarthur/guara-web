import { AtivoScreen } from "./ativo-screen";

/** Página do ativo: o segmento é o id da posição (a tela busca tudo na API). */
export default async function AtivoPage({ params }: PageProps<"/investimentos/[ativo]">) {
  const { ativo } = await params;
  return <AtivoScreen id={ativo} />;
}
