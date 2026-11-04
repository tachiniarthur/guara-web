import { notFound } from "next/navigation";

import { TetoFormPage } from "@/features/gastos/components/teto-form-page";
import { findTeto, tetoDetails } from "@/features/gastos/tetos";

export function generateStaticParams() {
  return tetoDetails.map((teto) => ({ id: teto.id }));
}

export default async function EditarTetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teto = findTeto(id);
  if (!teto) notFound();
  return (
    <TetoFormPage mode="editar" parent={{ label: teto.categoria, href: `/alertas/tetos/${id}` }} />
  );
}
