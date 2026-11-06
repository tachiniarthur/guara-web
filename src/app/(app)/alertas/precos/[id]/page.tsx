import { AlertaPrecoScreen } from "@/features/alertas/components/preco-screen";
import { priceAlertDetails } from "@/features/alertas/price-alerts";

export function generateStaticParams() {
  return priceAlertDetails.map((alert) => ({ id: alert.id }));
}

/** Um alerta de preço. Os do protótipo saem no build; os da API, na hora. */
export default async function AlertaPrecoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  return <AlertaPrecoScreen id={(await params).id} estado={(await searchParams).estado} />;
}
