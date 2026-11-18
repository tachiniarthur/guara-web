import { BemScreen } from "./bem-screen";

/** Imóvel ou veículo: o segmento é o id do bem (a tela busca tudo na API). */
export default async function BemPage({ params }: PageProps<"/investimentos/bens/[bem]">) {
  const { bem } = await params;
  return <BemScreen id={bem} />;
}
