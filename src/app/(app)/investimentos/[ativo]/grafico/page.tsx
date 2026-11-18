import { GraficoScreen } from "./grafico-screen";

/** Gráfico completo do ativo (o segmento é o id da posição). */
export default async function GraficoPage({ params }: PageProps<"/investimentos/[ativo]/grafico">) {
  const { ativo } = await params;
  return <GraficoScreen id={ativo} />;
}
