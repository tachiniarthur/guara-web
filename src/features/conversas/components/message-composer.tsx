"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

import { NEW_CONVERSATION, stopReply, useChatSend, useChatStream } from "../stream";

/** O mesmo teto da API (`CHAT_MESSAGE_MAX_LENGTH`). */
export const MESSAGE_MAX_LENGTH = 4_000;

type MessageComposerProps = {
  placeholder: string;
  /** Texto do campo nas telas compactas (< 600 px). */
  compactPlaceholder?: string;
  /** Valor inicial do campo. */
  defaultValue?: string;
  /** Acima do campo (ex.: sugestões rápidas). */
  header?: ReactNode;
  /** Abaixo do campo (ex.: aviso ou atalhos de teclado). */
  footer?: ReactNode;
  /**
   * Conversa que recebe as mensagens; `null` = conversa nova (criada na primeira pergunta, avisada
   * em `onCreated`). Sem a prop, cada envio começa uma conversa nova no painel de conversa (ex.:
   * campo ao lado do Relatório).
   */
  conversationId?: string | null;
  onCreated?: (id: string) => void;
  className?: string;
};

function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 37.4375rem)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return compact;
}

/**
 * Campo de mensagem em pílula. Enter envia e Shift+Enter quebra a linha; enquanto a resposta
 * chega, o envio vira "Parar a resposta".
 */
export function MessageComposer({
  placeholder,
  compactPlaceholder,
  defaultValue = "",
  header,
  footer,
  conversationId,
  onCreated,
  className,
}: MessageComposerProps) {
  const send = useChatSend();
  const newConversation = useChatPanel((state) => state.newConversation);
  const conversationCreated = useChatPanel((state) => state.conversationCreated);
  const inputId = useId();
  const compact = useCompact();
  const [value, setValue] = useState(defaultValue);
  const standalone = conversationId === undefined;
  const key = conversationId ?? NEW_CONVERSATION;
  const phase = useChatStream((state) => (standalone ? undefined : state.pending[key]?.phase));
  const busy = phase === "sending" || phase === "streaming";

  function submit() {
    const text = value.trim();
    if (!text || busy) return;
    setValue("");
    if (standalone) {
      // Campo fora do chat: a conversa nova abre no painel e a resposta chega lá.
      newConversation();
      void send(null, text, { onCreated: conversationCreated });
      return;
    }
    void send(conversationId, text, { onCreated });
  }

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      {header}
      <form
        className="m-0 flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Mensagem
        </label>
        <div className="flex min-h-14 items-end gap-0.5 rounded-[1.75rem] border border-line-strong bg-field p-1.5 pl-4">
          <textarea
            id={inputId}
            rows={1}
            value={value}
            maxLength={MESSAGE_MAX_LENGTH}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={compact && compactPlaceholder ? compactPlaceholder : placeholder}
            className="field-sizing-content max-h-40 min-h-11 min-w-0 grow resize-none self-center border-none bg-transparent py-2.5 text-15 leading-normal text-sand outline-none"
          />
          {busy ? (
            <button
              type="button"
              aria-label="Parar a resposta"
              disabled={phase !== "streaming" || conversationId === null}
              onClick={() => conversationId && stopReply(conversationId)}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-shade text-sand disabled:opacity-60"
            >
              <Icon name="stop" size={18} />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Enviar mensagem"
              disabled={!value.trim()}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-tucano text-canvas disabled:opacity-60"
            >
              <Icon name="arrow-right" />
            </button>
          )}
        </div>
      </form>
      {footer}
    </div>
  );
}
