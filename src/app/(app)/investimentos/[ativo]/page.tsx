import { assets } from "@/features/ativo/data";

import { AtivoScreen } from "./ativo-screen";

export function generateStaticParams() {
  return Object.keys(assets).map((ativo) => ({ ativo }));
}

/** Gerada no build para cada ativo (sem `searchParams`). */
export default async function AtivoPage({ params }: PageProps<"/investimentos/[ativo]">) {
  const { ativo } = await params;
  return <AtivoScreen ativo={ativo} />;
}
