"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { MessageComposer } from "@/features/conversas/components/message-composer";
import { SessionMessages } from "@/features/conversas/components/session-messages";
import { NewConversationStart } from "@/features/conversas/components/thread-status";
import { threads, type Thread } from "@/features/conversas/threads";
import { useChatPanel } from "@/stores/chat-panel";

const promptClass =
  "h-9 shrink-0 rounded-full border border-line-strong bg-transparent px-4 text-14 whitespace-nowrap text-sand hover:bg-shade";

/**
 * Chat compacto por cima da tela (celular e tablet): título da conversa, histórico, tela cheia
 * e fechar; as mensagens e o campo com sugestões.
 */
export function ChatSheetBody() {
  const { conversationId, variant, draft, close, showHistory } = useChatPanel();
  const started = useChatPanel((state) => state.started);
  const thread: Thread | undefined = conversationId
    ? threads[conversationId as keyof typeof threads]
    : undefined;
  const local = started.find((item) => item.id === conversationId);
  const title = thread?.title ?? local?.titulo ?? "Nova conversa";
  const subtitle = thread?.subtitle ?? (local ? "Agora" : "Ainda sem mensagens");
  const unsent = variant === "nao-enviada" && thread?.unsentContent;
  const fullHref = conversationId
    ? thread
      ? `/conversas/${conversationId}${unsent ? "?estado=nao-enviada" : ""}`
      : "/conversas"
    : "/conversas/nova";

  return (
    <>
      <header className="flex min-h-16 shrink-0 items-center gap-1 border-b border-line pr-2 pl-4.5">
        <div className="flex min-w-0 grow flex-col leading-[1.3]">
          <strong className="font-display text-18">{title}</strong>
          <span className="text-12 text-caption">{subtitle}</span>
        </div>
        <IconButton
          icon="clock"
          label="Histórico de conversas"
          variant="ghost"
          onClick={showHistory}
        />
        <Link
          href={fullHref}
          aria-label="Abrir em tela cheia"
          onClick={close}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-mist hover:bg-shade"
        >
          <Icon name="expand" />
        </Link>
        <IconButton icon="x" label="Fechar o chat" variant="ghost" onClick={close} />
      </header>
      <div className="scrollbar-none flex grow flex-col gap-4 overflow-y-auto p-4">
        {thread ? (unsent ? thread.unsentContent : thread.content) : null}
        {!thread && !local && <NewConversationStart compact />}
        {conversationId && <SessionMessages conversationId={conversationId} variant="page" />}
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-canvas px-3 pt-2.5 pb-5">
        <MessageComposer
          key={`${conversationId ?? "nova"}-${variant ?? ""}-${draft}`}
          conversationId={conversationId ?? undefined}
          defaultValue={draft}
          placeholder="Pergunte qualquer coisa"
          typing={thread?.typing}
          attachmentFailed={thread?.attachmentFailed}
          header={
            thread?.prompts && (
              <div role="group" aria-label="Sugestões" className="-mr-3 flex gap-2 overflow-hidden">
                {thread.prompts.map((prompt) => (
                  <button key={prompt} type="button" className={promptClass}>
                    {prompt}
                  </button>
                ))}
              </div>
            )
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
