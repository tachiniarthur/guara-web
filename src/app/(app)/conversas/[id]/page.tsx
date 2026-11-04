import { conversationIds } from "@/features/conversas/data";

import { ConversaScreen } from "../conversas-screen";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...conversationIds, "nova"].map((id) => ({ id }));
}

/** Gerada no build para cada conversa (sem `searchParams`). */
export default async function ConversaPage({ params }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  return <ConversaScreen id={id} />;
}
