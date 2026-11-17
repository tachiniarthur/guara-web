"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useSession } from "@/features/acesso/session";
import { useConversation } from "@/features/conversas/api";
import { QuickPrompts } from "@/features/conversas/components/chat-composer";
import { ChatThread, useThreadTick } from "@/features/conversas/components/chat-thread";
import { MessageComposer } from "@/features/conversas/components/message-composer";
import { startedLabel } from "@/features/conversas/format";
import { useChatSend } from "@/features/conversas/stream";
import { useChatPanel } from "@/stores/chat-panel";

/**
 * Chat compacto por cima da tela (celular e tablet): título da conversa, histórico, tela cheia
 * e fechar; as mensagens e o campo com sugestões.
 */
export function ChatSheetBody() {
  const { conversationId, draft, close, showHistory, conversationCreated } = useChatPanel();
  const { live } = useSession();
  const conversation = useConversation(live ? conversationId : null);
  const send = useChatSend();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tick = useThreadTick(conversationId);
  const ask = (text: string) => void send(conversationId, text, { onCreated: conversationCreated });

  useEffect(() => {
    const list = scrollRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [tick]);

  const title = conversationId ? (conversation.data?.title ?? "Conversa") : "Nova conversa";
  const subtitle = conversation.data
    ? startedLabel(conversation.data.createdAt, new Date())
    : conversationId
      ? ""
      : "Ainda sem mensagens";

  return (
    <>
      <header className="flex min-h-16 shrink-0 items-center gap-1 border-b border-line pr-2 pl-4.5">
        <div className="flex min-w-0 grow flex-col leading-[1.3]">
          <strong className="truncate font-display text-18">{title}</strong>
          <span className="text-12 text-caption">{subtitle}</span>
        </div>
        <IconButton
          icon="clock"
          label="Histórico de conversas"
          variant="ghost"
          onClick={showHistory}
        />
        <Link
          href={conversationId ? `/conversas/${conversationId}` : "/conversas"}
          aria-label="Abrir em tela cheia"
          onClick={close}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-mist hover:bg-shade"
        >
          <Icon name="expand" />
        </Link>
        <IconButton icon="x" label="Fechar o chat" variant="ghost" onClick={close} />
      </header>
      <div
        ref={scrollRef}
        key={conversationId ?? "nova"}
        className="scrollbar-none flex grow animate-chat-slide flex-col gap-4 overflow-y-auto p-4"
      >
        <ChatThread conversationId={conversationId} variant="page" compact onAsk={ask} />
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-canvas px-3 pt-2.5 pb-5">
        <MessageComposer
          key={`${conversationId ?? "nova"}-${draft}`}
          conversationId={conversationId}
          onCreated={conversationCreated}
          defaultValue={draft}
          placeholder="Pergunte qualquer coisa"
          header={
            conversationId && <QuickPrompts conversationId={conversationId} className="-mr-3" />
          }
          footer={
            <p className="m-0 text-center text-12 text-caption">
              A IA pode errar. Nada aqui é recomendação de investimento.
            </p>
          }
        />
      </div>
    </>
  );
}
