"use client";

import { user } from "@/features/usuario/data";
import { useChatPanel } from "@/stores/chat-panel";

import { threads } from "../threads";
import { GastosThread } from "./gastos-thread";
import { AgentMessage, ChatDateChip, MessageText } from "./messages";
import { SessionMessages } from "./session-messages";

function NewConversationIntro() {
  return (
    <>
      <ChatDateChip>Nova conversa</ChatDateChip>
      <AgentMessage agent="capivara" tag="coordenação">
        <MessageText>
          Oi, {user.nome}! Pergunta do seu jeito: gastos, investimentos, alertas ou metas. Eu chamo
          o bicho certo para responder.
        </MessageText>
      </AgentMessage>
    </>
  );
}

/** Conteúdo da conversa aberta no painel lateral (ou por cima da tela). */
export function PanelThread({ conversationId }: { conversationId: string | null }) {
  const started = useChatPanel((state) => state.started);
  if (conversationId === null) return <NewConversationIntro />;

  const thread = threads[conversationId as keyof typeof threads];
  const local = started.find((item) => item.id === conversationId);

  return (
    <>
      {conversationId === "gastos-setembro" ? (
        <GastosThread />
      ) : thread ? (
        <>
          <ChatDateChip>
            {thread.time} · {thread.title}
          </ChatDateChip>
          {thread.content}
        </>
      ) : (
        <ChatDateChip>Agora · {local?.titulo ?? "Conversa"}</ChatDateChip>
      )}
      <SessionMessages conversationId={conversationId} variant="panel" />
    </>
  );
}
