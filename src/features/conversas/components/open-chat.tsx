"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { useChatPanel } from "@/stores/chat-panel";

type OpenChatProps = Omit<ComponentProps<"button">, "type" | "onClick"> & {
  /** Pergunta que já vem escrita no campo. */
  question?: string;
  /** Começa uma conversa nova (sem pergunta). */
  fresh?: boolean;
};

/**
 * Abre o painel de conversa com o Guará de qualquer tela, sem sair dela. Sem `question` ou `fresh`,
 * abre a conversa atual. Nas páginas de conversa (que já são o chat em tela cheia), leva a elas.
 */
export function OpenChat({ question, fresh, children, ...props }: OpenChatProps) {
  const pathname = usePathname();
  const openCurrent = useChatPanel((state) => state.openCurrent);
  const newConversation = useChatPanel((state) => state.newConversation);

  // Nas páginas de conversa o chat já está em tela cheia: o atalho só leva à conversa atual.
  if (pathname?.startsWith("/conversas")) {
    const { className, style, title, "aria-label": ariaLabel, "aria-current": ariaCurrent } = props;
    return (
      <Link
        href="/conversas"
        className={className}
        style={style}
        title={title}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {children}
      </Link>
    );
  }

  function open() {
    if (question || fresh) {
      newConversation(question ?? "");
    } else {
      openCurrent();
    }
  }

  return (
    <button type="button" onClick={open} {...props}>
      {children}
    </button>
  );
}
