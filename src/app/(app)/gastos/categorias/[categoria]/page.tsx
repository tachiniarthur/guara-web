import { CategoriaScreen } from "@/features/gastos/components/categoria-screen";

/** Uma categoria no mês (o id vem da API, então a página é montada a cada pedido). */
export default async function CategoriaPage({
  params,
}: PageProps<"/gastos/categorias/[categoria]">) {
  const { categoria } = await params;
  return <CategoriaScreen categoria={categoria} />;
}
