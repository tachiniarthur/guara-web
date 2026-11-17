import { SubscriptionDetailScreen } from "@/features/assinaturas/components/subscription-detail-screen";
import { subscriptions } from "@/features/assinaturas/data";

/** As do protótipo saem no build; com login, o id é o da API e a tela abre sob demanda. */
export function generateStaticParams() {
  return subscriptions.map((s) => ({ id: s.id }));
}

export default async function AssinaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SubscriptionDetailScreen id={id} />;
}
