import { TetoScreen } from "@/features/gastos/components/teto-screen";
import { tetoDetails } from "@/features/gastos/tetos";

export function generateStaticParams() {
  return tetoDetails.map((teto) => ({ id: teto.id }));
}

/** Um teto de gasto. Os do protótipo saem no build; os da API, na hora. */
export default async function TetoPage({ params }: { params: Promise<{ id: string }> }) {
  return <TetoScreen id={(await params).id} />;
}
