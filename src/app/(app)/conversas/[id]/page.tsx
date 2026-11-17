import { ConversaScreen } from "../conversas-screen";

/** Uma conversa (o id vem da API, então a página é montada a cada pedido). */
export default async function ConversaPage({ params }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  return <ConversaScreen id={id} />;
}
