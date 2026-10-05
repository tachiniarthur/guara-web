"use client";

import { useChatPanel } from "@/stores/chat-panel";

import { AgentMessage, MessageText, UserBubble } from "./messages";
import { AgentReply, ReplyText, UserQuestion } from "./thread-parts";

/** Mensagens enviadas nesta sessão, no estilo do painel (bolhas) ou da página de conversa. */
export function SessionMessages({
  conversationId,
  variant,
}: {
  conversationId: string;
  variant: "panel" | "page";
}) {
  const messages = useChatPanel((state) => state.messages[conversationId]);
  if (!messages?.length) return null;

  return (
    <>
      {messages.map((message) =>
        message.role === "user" ? (
          variant === "panel" ? (
            <UserBubble key={message.id}>{message.text}</UserBubble>
          ) : (
            <UserQuestion key={message.id}>{message.text}</UserQuestion>
          )
        ) : variant === "panel" ? (
          <AgentMessage key={message.id} agent="capivara" tag="coordenação">
            <MessageText>{message.text}</MessageText>
          </AgentMessage>
        ) : (
          <AgentReply key={message.id} agent="capivara">
            <ReplyText>{message.text}</ReplyText>
          </AgentReply>
        ),
      )}
    </>
  );
}
