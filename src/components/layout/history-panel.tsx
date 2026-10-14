"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ConversationList } from "@/features/conversas/components/conversation-list";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

import { HISTORY_WIDTH } from "./chat-sizes";

/**
 * Histórico de conversas, sempre com a mesma largura (HISTORY_WIDTH). "aside": painel à direita
 * do desktop. "sheet": dentro da gaveta de conversa aberta por cima da tela.
 * Abrir uma conversa ou começar uma nova acontece ali mesmo, sem sair da tela.
 */
export function HistoryPanel({
  mode = "aside",
  wide,
  className,
}: {
  mode?: "aside" | "sheet";
  /** Versão do Início (24rem, letras maiores e "Abrir em tela cheia"). */
  wide?: boolean;
  className?: string;
}) {
  const { open, conversationId, openConversation, openCurrent, newConversation, close } =
    useChatPanel();
  const sheet = mode === "sheet";

  return (
    <aside
      aria-label="Histórico de conversas"
      className={cn(
        "flex-col bg-card",
        sheet
          ? "flex"
          : cn("sticky top-0 h-dvh shrink-0 border-l border-line", wide ? "w-96" : HISTORY_WIDTH),
        className,
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-1 border-b border-line pr-2.5 pl-4.5",
          wide ? "h-[5.0625rem]" : "h-17",
        )}
      >
        <h2 className={cn("m-0 grow font-display font-bold", wide ? "text-22" : "text-18")}>
          Conversas
        </h2>
        <IconButton
          icon="search"
          label="Buscar conversas"
          variant="ghost"
          size={wide ? "md" : "sm"}
        />
        {sheet ? (
          <>
            <IconButton
              icon="chat"
              label="Voltar para a conversa"
              variant="ghost"
              size="sm"
              onClick={openCurrent}
            />
            <IconButton icon="x" label="Fechar" variant="ghost" size="sm" onClick={close} />
          </>
        ) : (
          <>
            <IconButton
              icon="panel-right"
              label="Abrir a conversa atual"
              variant="ghost"
              size={wide ? "md" : "sm"}
              onClick={openCurrent}
            />
            {wide && (
              <Link
                href="/conversas"
                aria-label="Abrir em tela cheia"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-mist hover:bg-shade"
              >
                <Icon name="expand" />
              </Link>
            )}
          </>
        )}
      </header>
      <div className="shrink-0 px-3 pt-3.5">
        <Button
          variant="forest"
          size={wide ? "lg" : "md"}
          block
          className={wide ? "text-15" : "text-14"}
          onClick={() => newConversation()}
        >
          <Icon name="plus" size={18} />
          <span>Nova conversa</span>
        </Button>
      </div>
      <div className="scrollbar-none grow overflow-y-auto px-2 py-1">
        <ConversationList
          currentId={open ? conversationId : undefined}
          onSelect={openConversation}
          size={wide ? "lg" : "md"}
        />
      </div>
      <div className="border-t border-line px-4.5 pt-3 pb-4.5">
        <Link
          href="/conversas/historico"
          onClick={sheet ? close : undefined}
          className={cn(
            "flex min-h-6 items-center gap-1 font-bold whitespace-nowrap text-sand underline underline-offset-3",
            wide ? "text-15" : "text-14",
          )}
        >
          Ver todas as conversas
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
    </aside>
  );
}
