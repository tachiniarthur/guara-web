"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ChatComposer } from "@/features/conversas/components/chat-composer";
import { PanelThread } from "@/features/conversas/components/panel-thread";
import { threads } from "@/features/conversas/threads";
import { PANEL_EXIT_MS, Presence, useStaysUnder } from "@/components/ui/presence";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

import { CHAT_WIDTH, HISTORY_WIDTH_MD } from "./chat-sizes";
import { ChatSheetBody } from "./chat-sheet";
import { HistoryPanel } from "./history-panel";
import { MataArt } from "@/components/ui/mata-art";

type Mode = "docked" | "overlay";

/** Cabeçalho, conversa e campo de mensagem. Igual nos dois modos; só os botões do topo mudam. */
function ChatPanelBody({ mode }: { mode: Mode }) {
  const { conversationId, draft, send, close, newConversation } = useChatPanel();
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = useChatPanel((state) =>
    conversationId ? (state.messages[conversationId]?.length ?? 0) : 0,
  );
  const docked = mode === "docked";
  const buttonSize = docked ? "lg" : "md";

  // Rola até a última mensagem ao trocar de conversa ou ao enviar. Só a lista de mensagens: o
  // `scrollIntoView` rolaria também o lugar do painel (overflow escondido, largura animando) e a
  // conversa aparecia antes da hora por cima do histórico.
  useEffect(() => {
    const list = scrollRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [conversationId, count]);

  return (
    <>
      <div aria-hidden="true" className="relative h-[4.375rem] shrink-0 overflow-hidden bg-mata">
        <MataArt className="absolute inset-0 size-full" align="right" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,22,0.05)_0%,rgba(18,26,22,0.45)_60%,var(--guara-card)_100%)]" />
      </div>
      <header className="flex h-20 shrink-0 items-center gap-2 border-b border-line px-4 md:gap-3 md:px-6">
        {/* Fecha a conversa: no painel fixo, volta ao histórico; por cima da tela, fecha o chat. */}
        <IconButton
          icon="x"
          label={docked ? "Fechar a conversa" : "Fechar o chat"}
          variant="ghost"
          size={buttonSize}
          onClick={close}
        />
        <div className="flex min-w-0 grow flex-col leading-[1.25]">
          <strong className="font-display text-22">Chat do Guará</strong>
          <span className="truncate text-13 text-caption">Sua equipe de assistentes de IA</span>
        </div>
        {/* Começa uma conversa nova ali mesmo (o histórico volta pelo X ou pelo atalho da borda). */}
        <IconButton
          icon="chat-plus"
          label="Nova conversa"
          size={buttonSize}
          onClick={() => newConversation()}
        />
        {/* Abre esta conversa em tela cheia. */}
        <Link
          href={conversationId ? `/conversas/${conversationId}` : "/conversas/nova"}
          aria-label="Abrir em tela cheia"
          onClick={close}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border border-line-strong text-mist hover:bg-shade hover:text-sand",
            docked ? "size-12" : "size-11",
          )}
        >
          <Icon name="expand" />
        </Link>
      </header>
      <div ref={scrollRef} className="scrollbar-none flex grow flex-col overflow-y-auto p-4 md:p-6">
        {/* mt-auto: a conversa curta fica embaixo; a longa rola desde o começo. */}
        {/* Trocar de conversa (ou começar uma nova) entra deslizando devagar, sem trocar seco. */}
        <div
          key={conversationId ?? "nova"}
          className="mt-auto flex animate-chat-slide flex-col gap-5"
        >
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
      // Dentro do lugar animado do app shell: entra deslizando no lugar do histórico.
      className={cn(
        `h-full flex-col border-l border-line bg-card text-16 ${CHAT_WIDTH}`,
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

  const history = view === "history";
  // A conversa entra por cima do histórico, que só sai da tela depois que ela chegou.
  const historyShown = useStaysUnder(!history);
  // O histórico só entra deslizando quando o chat abre nele; vindo de uma conversa (que sai
  // deslizando por cima), ele já está parado no lugar.
  const [cameFromChat, setCameFromChat] = useState(!history);
  if (!history && !cameFromChat) setCameFromChat(true);

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-40", className)}>
      <button
        type="button"
        aria-label="Fechar conversa"
        tabIndex={-1}
        onClick={close}
        data-motion="backdrop"
        className={cn(
          "pointer-events-auto absolute inset-0 border-none",
          history
            ? "hidden bg-[rgba(5,8,6,0.55)] md:block"
            : "bg-[rgba(5,9,7,0.6)] md:bg-[rgba(5,9,7,0.45)] lg:hidden",
        )}
      />
      {/*
       * Histórico ↔ conversa: só a conversa se move. Ela entra deslizando por cima do histórico e,
       * ao fechar, sai deslizando para a direita com o histórico já parado por baixo.
       */}
      {historyShown && (
        <div
          role="dialog"
          aria-modal={history}
          aria-label="Histórico de conversas"
          inert={!history}
          data-motion="panel"
          data-still={cameFromChat ? "" : undefined}
          className={cn(
            "pointer-events-auto absolute inset-y-0 right-0 flex w-full flex-col bg-card text-16 shadow-[0_8px_24px_rgba(0,0,0,.35)] md:border-l md:border-line",
            HISTORY_WIDTH_MD,
          )}
        >
          <HistoryPanel mode="sheet" still={cameFromChat} className="h-full w-full" />
        </div>
      )}
      <Presence show={!history} exitMs={PANEL_EXIT_MS}>
        {!history && (
          <section
            role="dialog"
            aria-label="Chat"
            // Folha de baixo no celular; painel que desliza da direita no tablet e no desktop.
            data-motion="sheet-panel"
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
        )}
      </Presence>
    </div>
  );
}
