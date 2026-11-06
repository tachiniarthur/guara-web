import { TetosScreen } from "@/features/gastos/components/tetos-screen";

/** Tetos de gasto (e o caso sem nenhum teto no protótipo: `?vazio`). */
export default async function TetosPage({
  searchParams,
}: {
  searchParams: Promise<{ vazio?: string }>;
}) {
  return <TetosScreen vazio={(await searchParams).vazio !== undefined} />;
}
