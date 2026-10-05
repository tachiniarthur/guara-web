"use client";

import { useId, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { quickPrompts } from "../data";

type ChatComposerProps = {
  placeholder?: string;
  prompts?: readonly string[];
  /** Aviso de responsabilidade abaixo do campo. */
  disclaimer?: boolean;
  /** Texto inicial do campo. */
  defaultValue?: string;
  /** Envia a mensagem (as sugestões rápidas também enviam). */
  onSend?: (text: string) => void;
  className?: string;
};

/** Sugestões rápidas + campo de mensagem em pílula (@, microfone e enviar). */
export function ChatComposer({
  placeholder = "Pergunte pra turma",
  prompts = quickPrompts,
  disclaimer = true,
  defaultValue = "",
  onSend,
  className,
}: ChatComposerProps) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);

  function submit(text: string) {
    if (!text.trim()) return;
    onSend?.(text);
    setValue("");
  }

  return (
    <div className={cn("flex shrink-0 flex-col gap-3", className)}>
      {prompts.length > 0 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submit(prompt)}
              className="h-10 shrink-0 rounded-full border border-line-strong bg-transparent px-4 text-14 whitespace-nowrap hover:bg-shade"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      <form
        className="m-0"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Mensagem
        </label>
        <div className="flex min-h-16 items-center gap-1 rounded-full border border-line-strong bg-shade p-2">
          <IconButton icon="at" label="Chamar um agente específico" variant="ghost" size="lg" />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus={defaultValue !== ""}
            placeholder={placeholder}
            className="h-12 min-w-0 grow border-none bg-transparent px-1 text-16 text-sand"
          />
          <IconButton icon="mic" label="Falar" variant="ghost" size="lg" />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border-none bg-tucano text-canvas"
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      </form>
      {disclaimer && (
        <p className="m-0 text-center text-13 text-caption">
          A IA pode errar. Nada aqui é recomendação de investimento.
        </p>
      )}
    </div>
  );
}
