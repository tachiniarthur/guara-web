import { LancamentoScreen } from "@/features/gastos/components/lancamento-screen";
import { allTransactions } from "@/features/gastos/lancamentos";

export function generateStaticParams() {
  return allTransactions.map((item) => ({ id: item.id }));
}

/** Um lançamento. Os do protótipo saem no build; os da API, na hora. */
export default async function LancamentoPage({
  params,
  searchParams,
}: PageProps<"/gastos/lancamentos/[id]">) {
  const { id } = await params;
  return <LancamentoScreen id={id} estado={(await searchParams).estado as string | undefined} />;
}
