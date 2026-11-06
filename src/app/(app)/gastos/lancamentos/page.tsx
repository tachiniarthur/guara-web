import { LancamentosScreen } from "@/features/gastos/components/lancamentos-screen";

/** Todos os lançamentos (e os estados do protótipo por `?estado=`). */
export default async function LancamentosPage({ searchParams }: PageProps<"/gastos/lancamentos">) {
  return <LancamentosScreen estado={(await searchParams).estado as string | undefined} />;
}
