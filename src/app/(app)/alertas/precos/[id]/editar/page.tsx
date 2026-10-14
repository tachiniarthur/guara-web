import { notFound } from "next/navigation";

import { PriceAlertFormPage } from "@/features/alertas/components/price-alert-form-page";
import { findPriceAlert, priceAlertDetails } from "@/features/alertas/price-alerts";

export function generateStaticParams() {
  return priceAlertDetails.map((alert) => ({ id: alert.id }));
}

export default async function EditarAlertaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findPriceAlert(id)) notFound();
  return <PriceAlertFormPage mode="editar" />;
}
