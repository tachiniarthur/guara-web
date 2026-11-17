"use client";

import { notFound } from "next/navigation";

import { ConversationView } from "@/features/conversas/components/conversation-view";
import { isConversationId } from "@/features/conversas/api";

/** `/conversas` (e `/conversas/nova`): uma conversa nova, criada na primeira pergunta. */
export function ConversaNovaScreen() {
  return <ConversationView conversationId={null} />;
}

/** Uma conversa da pessoa (`/conversas/<id>`). */
export function ConversaScreen({ id }: { id: string }) {
  if (id === "nova") return <ConversationView conversationId={null} />;
  if (!isConversationId(id)) notFound();
  return <ConversationView key={id} conversationId={id} />;
}
