"use client";

import { useChatPanel } from "@/stores/chat-panel";

import { threads } from "../threads";
import { GastosThread } from "./gastos-thread";
import { ChatDateChip } from "./messages";
import { SessionMessages } from "./session-messages";
import { NewConversationStart } from "./thread-status";

/** Conteúdo da conversa aberta no painel lateral (ou por cima da tela). */
export function PanelThread({ conversationId }: { conversationId: string | null }) {
  const started = useChatPanel((state) => state.started);
  const variant = useChatPanel((state) => state.variant);
  if (conversationId === null) return <NewConversationStart compact />;

  const thread = threads[conversationId as keyof typeof threads];
  const local = started.find((item) => item.id === conversationId);

  return (
    <>
      {variant === "nao-enviada" && thread?.unsentContent ? (
        thread.unsentContent
      ) : conversationId === "gastos-setembro" ? (
        <GastosThread />
      ) : thread?.ownDateChip ? (
        thread.content
      ) : thread ? (
        <>
          <ChatDateChip>{`${thread.time} · ${thread.title}`}</ChatDateChip>
          {thread.content}
        </>
      ) : (
        <ChatDateChip>Agora · {local?.titulo ?? "Conversa"}</ChatDateChip>
      )}
      <SessionMessages conversationId={conversationId} variant="panel" />
    </>
  );
}
