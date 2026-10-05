import { notFound, redirect } from "next/navigation";

import { ConversationView } from "@/features/conversas/components/conversation-view";
import {
  CURRENT_CONVERSATION,
  conversationIds,
  type ConversationId,
} from "@/features/conversas/data";
import { threads } from "@/features/conversas/threads";

export const dynamicParams = false;

export function generateStaticParams() {
  return conversationIds.map((id) => ({ id }));
}

export default async function ConversaPage({ params }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  if (id === CURRENT_CONVERSATION) redirect("/conversas");
  const thread = threads[id as ConversationId];
  if (!thread) notFound();
  return <ConversationView thread={thread} />;
}
