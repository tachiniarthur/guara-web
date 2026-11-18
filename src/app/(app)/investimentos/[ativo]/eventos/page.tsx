import { EventosScreen } from "./eventos-screen";

/** Proventos e eventos corporativos do ativo (o segmento é o id da posição). */
export default async function EventosPage({ params }: PageProps<"/investimentos/[ativo]/eventos">) {
  const { ativo } = await params;
  return <EventosScreen id={ativo} />;
}
