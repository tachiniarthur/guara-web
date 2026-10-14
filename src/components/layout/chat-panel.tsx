"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ChatComposer } from "@/features/conversas/components/chat-composer";
import { PanelThread } from "@/features/conversas/components/panel-thread";
import { threads } from "@/features/conversas/threads";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

import { CHAT_WIDTH, HISTORY_WIDTH_MD } from "./chat-sizes";
import { ChatSheetBody } from "./chat-sheet";
import { HistoryPanel } from "./history-panel";

type Mode = "docked" | "overlay";

/** Cabeçalho, conversa e campo de mensagem. Igual nos dois modos; só os botões do topo mudam. */
function ChatPanelBody({ mode }: { mode: Mode }) {
  const { conversationId, draft, send, close, showHistory, newConversation } = useChatPanel();
  const endRef = useRef<HTMLDivElement>(null);
  const count = useChatPanel((state) =>
    conversationId ? (state.messages[conversationId]?.length ?? 0) : 0,
  );
  const docked = mode === "docked";
  const buttonSize = docked ? "lg" : "md";

  // Rola até a última mensagem ao trocar de conversa ou ao enviar.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversationId, count]);

  return (
    <>
      <div aria-hidden="true" className="relative h-[4.375rem] shrink-0 overflow-hidden bg-mata">
        {/* eslint-disable-next-line @next/next/no-img-element -- textura decorativa */}
        <img
          src="/images/marca/faixa-tucano.jpg"
          alt=""
          className="absolute inset-0 block size-full object-cover object-right"
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,22,0.05)_0%,rgba(18,26,22,0.45)_60%,var(--guara-card)_100%)]" />
      </div>
      <header className="flex h-20 shrink-0 items-center gap-2 border-b border-line px-4 md:gap-3 md:px-6">
        <AgentAvatar agent="capivara" size={48} />
        <div className="flex min-w-0 grow flex-col leading-[1.25]">
          <strong className="font-display text-22">Capivara</strong>
          <span className="truncate text-13 text-caption">
            de boa, chama o bicho certo pra você
          </span>
        </div>
        <IconButton
          icon="chat"
          label="Histórico de conversas"
          size={buttonSize}
          onClick={docked ? close : showHistory}
        />
        <IconButton
          icon="plus"
          label="Nova conversa"
          variant="forest"
          size={buttonSize}
          onClick={() => newConversation()}
        />
        {!docked && (
          <Link
            href={conversationId ? `/conversas/${conversationId}` : "/conversas/nova"}
            aria-label="Abrir em tela cheia"
            onClick={close}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-mist hover:bg-shade"
          >
            <Icon name="expand" />
          </Link>
        )}
        <IconButton
          icon="panel-right"
          label={docked ? "Recolher conversa" : "Fechar o chat"}
          size={buttonSize}
          onClick={close}
        />
      </header>
      <div className="scrollbar-none flex grow flex-col overflow-y-auto p-4 md:p-6">
        {/* mt-auto: a conversa curta fica embaixo; a longa rola desde o começo. */}
        <div ref={endRef} className="mt-auto flex flex-col gap-5">
          <PanelThread conversationId={conversationId} />
        </div>
      </div>
      <ChatComposer
        key={`${conversationId ?? "nova"}-${draft}`}
        defaultValue={draft}
        prompts={conversationId === null ? [] : undefined}
        attachmentFailed={
          conversationId !== null &&
          threads[conversationId as keyof typeof threads]?.attachmentFailed
        }
        onSend={(text) => send(text)}
        className="px-4 pt-4 pb-6 md:px-6 md:pb-7"
      />
    </>
  );
}

/** Conversa fixa à direita (janelas extragrandes das telas com painel lateral). */
export function ChatPanel({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Conversa"
      className={cn(
        `sticky top-0 h-dvh shrink-0 flex-col border-l border-line bg-card text-16 ${CHAT_WIDTH}`,
        className,
      )}
    >
      <ChatPanelBody mode="docked" />
    </aside>
  );
}

/**
 * Conversa por cima da tela: folha que sobe de baixo no celular, gaveta compacta à direita no
 * tablet e a conversa completa (sem escurecer a tela) no desktop. Mostra a conversa ou o
 * histórico, conforme `view`.
 */
export function ChatOverlay({ className }: { className?: string }) {
  const view = useChatPanel((state) => state.view);
  const close = useChatPanel((state) => state.close);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  if (view === "history") {
    return (
      <div className={cn("fixed inset-0 z-40", className)}>
        <button
          type="button"
          aria-label="Fechar conversa"
          tabIndex={-1}
          onClick={close}
          className="absolute inset-0 hidden border-none bg-[rgba(5,8,6,0.55)] md:block"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Histórico de conversas"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full flex-col bg-card text-16 shadow-[0_8px_24px_rgba(0,0,0,.35)] md:border-l md:border-line",
            HISTORY_WIDTH_MD,
          )}
        >
          <HistoryPanel mode="sheet" className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-40", className)}>
      <button
        type="button"
        aria-label="Fechar conversa"
        tabIndex={-1}
        onClick={close}
        className="pointer-events-auto absolute inset-0 border-none bg-[rgba(5,9,7,0.6)] md:bg-[rgba(5,9,7,0.45)] lg:hidden"
      />
      <section
        role="dialog"
        aria-label="Chat"
        className="@container pointer-events-auto absolute inset-x-0 top-16 bottom-0 flex flex-col overflow-hidden rounded-t-[1.75rem] border-t border-line-strong bg-canvas text-sand md:inset-x-auto md:top-0 md:right-0 md:w-[27.5rem] md:rounded-none md:border-t-0 md:border-l md:shadow-[-24px_0_64px_rgba(0,0,0,.45)] lg:w-[36.5rem] lg:border-line lg:bg-card"
      >
        <span
          aria-hidden="true"
          className="mt-2.5 mb-0.5 h-1 w-10 shrink-0 self-center rounded-[2px] bg-line-strong md:hidden"
        />
        <div className="flex min-h-0 grow flex-col lg:hidden">
          <ChatSheetBody />
        </div>
        <div className="hidden min-h-0 grow flex-col lg:flex">
          <ChatPanelBody mode="overlay" />
        </div>
      </section>
    </div>
  );
}
