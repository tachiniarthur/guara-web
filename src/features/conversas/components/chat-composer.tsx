"use client";

import { cn } from "@/lib/utils";

import { NEW_CONVERSATION, useChatSend, useChatStream } from "../stream";
import { MessageComposer } from "./message-composer";

/** Perguntas rápidas acima do campo (gerais: valem para qualquer conta). */
export const QUICK_PROMPTS = ["Resumo da semana", "Gastos pequenos do mês", "Como está meu saldo?"];

export const promptClass =
  "h-10 shrink-0 rounded-full border border-line-strong bg-transparent px-4 text-14 whitespace-nowrap text-sand hover:bg-shade disabled:opacity-60";

/** Sugestões que já mandam a pergunta (somem enquanto a resposta chega). */
export function QuickPrompts({
  conversationId,
  onCreated,
  className,
}: {
  conversationId: string | null;
  onCreated?: (id: string) => void;
  className?: string;
}) {
  const send = useChatSend();
  const phase = useChatStream((state) => state.pending[conversationId ?? NEW_CONVERSATION]?.phase);
  const busy = phase === "sending" || phase === "streaming";
  return (
    <div
      role="group"
      aria-label="Sugestões"
      className={cn("scrollbar-none flex gap-2 overflow-x-auto", className)}
    >
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={busy}
          onClick={() => void send(conversationId, prompt, { onCreated })}
          className={promptClass}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

/** Sugestões rápidas + campo de mensagem + aviso (painel de conversa do desktop). */
export function ChatComposer({
  conversationId,
  onCreated,
  defaultValue,
  prompts = true,
  className,
}: {
  conversationId: string | null;
  onCreated?: (id: string) => void;
  defaultValue?: string;
  /** Mostra as sugestões rápidas (a conversa nova já tem as dela). */
  prompts?: boolean;
  className?: string;
}) {
  return (
    <MessageComposer
      conversationId={conversationId}
      onCreated={onCreated}
      defaultValue={defaultValue}
      placeholder="Pergunte ao Guará"
      className={cn("shrink-0 gap-3", className)}
      header={prompts && <QuickPrompts conversationId={conversationId} onCreated={onCreated} />}
      footer={
        <p className="m-0 text-center text-13 text-caption">
          A IA pode errar. Nada aqui é recomendação de investimento.
        </p>
      }
    />
  );
}
