import { MetaScreen } from "./meta-screen";

/** Uma meta: o segmento é o id da meta (a tela busca tudo na API). */
export default async function MetaPage({ params }: PageProps<"/metas/[id]">) {
  const { id } = await params;
  return <MetaScreen id={id} />;
}
