import {
  ConversationView,
  type ConversationState,
} from "@/features/conversas/components/conversation-view";
import { CURRENT_CONVERSATION } from "@/features/conversas/data";
import { threads } from "@/features/conversas/threads";

export default async function ConversaAtualPage({ searchParams }: PageProps<"/conversas">) {
  const { estado } = await searchParams;
  return (
    <ConversationView
      thread={threads[CURRENT_CONVERSATION]}
      estado={typeof estado === "string" ? (estado as ConversationState) : undefined}
    />
  );
}
