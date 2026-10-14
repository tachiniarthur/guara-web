import { notFound, redirect } from "next/navigation";

import {
  ConversationView,
  type ConversationState,
} from "@/features/conversas/components/conversation-view";
import {
  CURRENT_CONVERSATION,
  conversationIds,
  type ConversationId,
} from "@/features/conversas/data";
import { threads } from "@/features/conversas/threads";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...conversationIds, "nova"].map((id) => ({ id }));
}

/** Uma conversa (`/conversas/nova`: conversa nova, ainda sem mensagens). */
export default async function ConversaPage({ params, searchParams }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  const { estado } = await searchParams;
  const state = typeof estado === "string" ? (estado as ConversationState) : undefined;
  if (id === "nova") return <ConversationView thread={null} />;
  if (id === CURRENT_CONVERSATION && !state) redirect("/conversas");
  const thread = threads[id as ConversationId];
  if (!thread) notFound();
  return <ConversationView thread={thread} estado={state} />;
}
