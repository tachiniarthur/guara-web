import { CategoriaScreen } from "@/features/gastos/components/categoria-screen";
import { categorySpending, tetos } from "@/features/gastos/data";
import { ledgerForCategory } from "@/features/gastos/lancamentos";

export function generateStaticParams() {
  return categorySpending.map((c) => ({ categoria: c.id }));
}

/** Uma categoria no mês. As categorias do protótipo saem no build; as da API, na hora. */
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const summary = categorySpending.find((c) => c.id === categoria);
  return (
    <CategoriaScreen
      categoria={categoria}
      prototype={summary ? ledgerForCategory(categoria, summary) : null}
      prototypeHasCeiling={tetos.some((t) => t.id === categoria)}
    />
  );
}
