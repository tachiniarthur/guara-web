import { AlertasPrecoScreen } from "@/features/alertas/components/precos-screen";

/** Todos os alertas de preço (e o estado vazio, em /alertas/precos?vazio). */
export default async function AlertasPrecoPage({
  searchParams,
}: {
  searchParams: Promise<{ vazio?: string }>;
}) {
  return <AlertasPrecoScreen vazio={(await searchParams).vazio !== undefined} />;
}
