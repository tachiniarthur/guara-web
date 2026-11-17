import { LancamentoScreen } from "@/features/gastos/components/lancamento-screen";

/** Um lançamento (o id vem da API, então a página é montada a cada pedido). */
export default async function LancamentoPage({ params }: PageProps<"/gastos/lancamentos/[id]">) {
  const { id } = await params;
  return <LancamentoScreen id={id} />;
}
