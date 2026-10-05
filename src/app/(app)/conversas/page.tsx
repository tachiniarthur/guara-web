import { ConversationView } from "@/features/conversas/components/conversation-view";
import { CURRENT_CONVERSATION } from "@/features/conversas/data";
import { threads } from "@/features/conversas/threads";

export default function ConversaAtualPage() {
  return <ConversationView thread={threads[CURRENT_CONVERSATION]} />;
}
