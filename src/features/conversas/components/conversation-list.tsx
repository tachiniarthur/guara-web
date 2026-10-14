"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

import {
  conversationHistory,
  conversationHref,
  type ConversationGroup,
  type ConversationSummary,
} from "../data";

/**
 * Conversas agrupadas por período (painel lateral, painel de conversa e tela de histórico).
 * Com `onSelect`, cada item abre a conversa no painel; sem ele, leva à página da conversa.
 * As conversas começadas nesta sessão sempre abrem no painel.
 */
export function ConversationList({
  currentId,
  onSelect,
  groupClassName,
  headingClassName,
  size = "md",
}: {
  /** "lg": itens de 60px com 15/13 (histórico do Início). */
  size?: "md" | "lg";
  /** Conversa aberta (destacada). */
  currentId?: string | null;
  onSelect?: (id: string) => void;
  groupClassName?: string;
  headingClassName?: string;
}) {
  const started = useChatPanel((state) => state.started);
  const openConversation = useChatPanel((state) => state.openConversation);
  const startedIds = new Set(started.map((item) => item.id));

  const groups: ConversationGroup[] = conversationHistory.map((group, i) =>
    i === 0 ? { ...group, itens: [...started, ...group.itens] } : group,
  );

  function itemContent(item: ConversationSummary, current: boolean): ReactNode {
    return (
      <>
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "min-w-0 grow truncate",
              size === "lg" ? "text-15" : "text-14",
              current ? "font-bold" : "font-medium",
            )}
          >
            {item.titulo}
          </span>
          <span className={cn("shrink-0 text-caption", size === "lg" ? "text-13" : "text-12")}>
            {item.quando}
          </span>
        </span>
        <span className={cn("truncate text-caption", size === "lg" ? "text-13" : "text-12")}>
          {item.resumo}
        </span>
      </>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.titulo} className={groupClassName}>
          <h3
            className={cn(
              "mt-2.5 mr-0 mb-0.5 ml-2.5 font-bold tracking-[.1em] text-caption uppercase",
              size === "lg" ? "text-13" : "text-12",
              headingClassName,
            )}
          >
            {group.titulo}
          </h3>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {/* A conversa aberta vem primeiro no grupo. */}
            {[...group.itens]
              .sort((a, b) => Number(b.id === currentId) - Number(a.id === currentId))
              .map((item) => {
                const current = item.id === currentId;
                const className = cn(
                  "flex w-full flex-col gap-0.5 rounded-full border-none px-2.5 py-2 text-left text-sand no-underline hover:bg-shade",
                  size === "lg" ? "min-h-15" : "min-h-13",
                  current ? "bg-shade" : "bg-transparent",
                );
                const select = onSelect ?? (startedIds.has(item.id) ? openConversation : undefined);
                return (
                  <li key={item.id}>
                    {select ? (
                      <button
                        type="button"
                        aria-current={current ? "true" : undefined}
                        onClick={() => select(item.id)}
                        className={className}
                      >
                        {itemContent(item, current)}
                      </button>
                    ) : (
                      <Link
                        href={conversationHref(item.id)}
                        aria-current={current ? "true" : undefined}
                        className={className}
                      >
                        {itemContent(item, current)}
                      </Link>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </>
  );
}
