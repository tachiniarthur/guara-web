import { SubscriptionDetailScreen } from "@/features/assinaturas/components/subscription-detail-screen";

/** O id é o da API: a tela abre sob demanda. */
export default async function AssinaturaPage({ params }: PageProps<"/assinaturas/[id]">) {
  const { id } = await params;
  return <SubscriptionDetailScreen id={id} />;
}
