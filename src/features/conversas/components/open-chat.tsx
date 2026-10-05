"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import type { AgentId } from "@/features/assistentes/data";
import { useChatPanel } from "@/stores/chat-panel";

import { agentMentions } from "../data";

type OpenChatProps = Omit<ComponentProps<"button">, "type" | "onClick"> & {
  /** Começa uma conversa nova chamando este bicho (o campo já vem com "@bicho "). */
  agent?: AgentId;
  /** Pergunta que já vem escrita no campo. */
  question?: string;
  /** Começa uma conversa nova (sem bicho nem pergunta). */
  fresh?: boolean;
};

export function mentionFor(agent: AgentId) {
  return agentMentions.find((mention) => mention.id === agent)?.handle ?? "";
}

/**
 * Abre o painel de conversa de qualquer tela, sem sair dela. Sem `agent`, `question` ou `fresh`,
 * abre a conversa atual. Nas páginas de conversa (que já são o chat em tela cheia), leva a elas.
 */
export function OpenChat({ agent, question, fresh, children, ...props }: OpenChatProps) {
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
    if (agent || question || fresh) {
      const draft = [agent ? mentionFor(agent) : "", question ?? ""].filter(Boolean).join(" ");
      newConversation(draft ? `${draft}${question ? "" : " "}` : "");
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
