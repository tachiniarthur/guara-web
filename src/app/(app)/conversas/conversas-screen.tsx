import { notFound, redirect } from "next/navigation";

import {
  ConversationView,
  type ConversationState,
} from "@/features/conversas/components/conversation-view";
import { CURRENT_CONVERSATION, type ConversationId } from "@/features/conversas/data";
import { threads } from "@/features/conversas/threads";

const asState = (estado?: string) => (estado ? (estado as ConversationState) : undefined);

/** A conversa atual (`/conversas`). `estado`: estados do protótipo (ver `src/proxy.ts`). */
export function ConversaAtualScreen({ estado }: { estado?: string }) {
  return <ConversationView thread={threads[CURRENT_CONVERSATION]} estado={asState(estado)} />;
}

/** Uma conversa (`/conversas/nova`: conversa nova, ainda sem mensagens). */
export function ConversaScreen({ id, estado }: { id: string; estado?: string }) {
  const state = asState(estado);
  if (id === "nova") return <ConversationView thread={null} />;
  if (id === CURRENT_CONVERSATION && !state) redirect("/conversas");
  const thread = threads[id as ConversationId];
  if (!thread) notFound();
  return <ConversationView thread={thread} estado={state} />;
}
