"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { agents } from "@/features/assistentes/data";
import { cn } from "@/lib/utils";

import { useChatPanel } from "@/stores/chat-panel";

import { agentMentions } from "../data";

type MessageComposerProps = {
  placeholder: string;
  /** Texto do campo nas telas compactas (< 600 px). */
  compactPlaceholder?: string;
  /** Valor inicial do campo ("@" abre a lista da turma). */
  defaultValue?: string;
  /** Abre a escolha de bicho já aberta (lista no desktop, folha no mobile). */
  defaultMentionOpen?: boolean;
  /** Acima do campo (ex.: sugestões rápidas). */
  header?: ReactNode;
  /** Abaixo do campo (ex.: aviso ou atalhos de teclado). */
  footer?: ReactNode;
  /**
   * Conversa que recebe as mensagens. Sem ela, cada envio começa uma conversa nova e abre o
   * painel de conversa (ex.: campo ao lado do Relatório).
   */
  conversationId?: string;
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

/** Lista que aparece sobre o campo ao digitar @ (tablet e desktop). */
function MentionList({ selected, onPick }: { selected: string; onPick: (handle: string) => void }) {
  return (
    <div
      role="listbox"
      aria-label="Chamar alguém da turma"
      className="absolute bottom-[4.5rem] left-0 z-10 flex w-[22.375rem] flex-col gap-0.5 rounded-bubble border border-line-strong bg-field p-2 shadow-[0_1px_2px_rgba(0,0,0,.4),0_8px_24px_rgba(0,0,0,.25)]"
    >
      <span className="px-2.5 py-1.5 text-12 text-caption">Falar com um bicho específico</span>
      {agentMentions.map((mention) => (
        <div
          key={mention.id}
          role="option"
          aria-selected={mention.id === selected}
          tabIndex={-1}
          onClick={() => onPick(mention.handle)}
          className={cn(
            "flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-1 hover:bg-shade",
            mention.id === selected && "bg-shade",
          )}
        >
          <AgentAvatar agent={mention.id} size={30} variant="ring" />
          <span className="flex flex-col leading-[1.3]">
            <span className="text-14 font-bold">{mention.handle}</span>
            <span className="text-12 text-caption">{mention.descricao}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Folha inferior para escolher com quem falar (mobile). */
function MentionSheet({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (handle: string) => void;
}) {
  const titleId = useId();
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-[rgba(10,10,12,.45)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 rounded-t-[1.375rem] bg-card px-4 pt-2.5 pb-7"
      >
        <span
          aria-hidden="true"
          className="h-[0.3125rem] w-10 self-center rounded-[3px] bg-line-strong"
        />
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="m-0 font-display text-20 font-bold tracking-[-0.01em]">
            Falar com um bicho
          </h2>
          <IconButton icon="x" label="Fechar" variant="ghost" onClick={onClose} />
        </div>
        <p className="m-0 text-14 leading-normal text-mist">
          Opcional. Se você não escolher, a Capivara leva sua pergunta pro bicho certo.
        </p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {agentMentions
            .filter((mention) => mention.id !== "capivara")
            .map((mention, i) => (
              <li key={mention.id}>
                <button
                  type="button"
                  autoFocus={i === 0}
                  onClick={() => onPick(mention.handle)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-3.5 rounded-full border-none px-3 py-2 text-left text-sand hover:bg-shade focus-visible:bg-shade",
                    i === 0 ? "bg-shade" : "bg-transparent",
                  )}
                >
                  <AgentAvatar agent={mention.id} size={42} variant="ring" />
                  <span className="flex flex-col leading-[1.35]">
                    <strong className="text-15">{agents[mention.id].nome}</strong>
                    <span className="text-13 text-mist">{mention.descricao}</span>
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

/** Campo de mensagem em pílula: anexar, chamar um bicho (@), microfone e enviar. */
export function MessageComposer({
  placeholder,
  compactPlaceholder,
  defaultValue = "",
  defaultMentionOpen = false,
  header,
  footer,
  conversationId,
  className,
}: MessageComposerProps) {
  const send = useChatPanel((state) => state.send);
  const ask = useChatPanel((state) => state.ask);
  const inputId = useId();
  const compact = useCompact();
  const [value, setValue] = useState(defaultValue);
  const [mentionOpen, setMentionOpen] = useState(defaultMentionOpen || defaultValue.endsWith("@"));

  function pick(handle: string) {
    setValue((current) => `${current.replace(/@$/, "")}${handle} `);
    setMentionOpen(false);
  }

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      {mentionOpen && !compact && <MentionList selected="pacu" onPick={pick} />}
      {mentionOpen && compact && (
        <MentionSheet onClose={() => setMentionOpen(false)} onPick={pick} />
      )}
      {header}
      <form
        className="m-0 flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim()) return;
          if (conversationId) send(value, conversationId);
          else ask(value);
          setValue("");
          setMentionOpen(false);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Mensagem
        </label>
        <div className="flex min-h-14 items-center gap-0.5 rounded-full border border-line-strong bg-field p-1.5">
          <IconButton icon="paperclip" label="Anexar arquivo" variant="ghost" />
          <IconButton
            icon="at"
            label="Falar com um bicho específico"
            variant="ghost"
            aria-expanded={mentionOpen}
            onClick={() => setMentionOpen((open) => !open)}
          />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setMentionOpen(event.target.value.endsWith("@"));
            }}
            placeholder={compact && compactPlaceholder ? compactPlaceholder : placeholder}
            className="h-11 min-w-0 grow border-none bg-transparent pl-1 text-15 text-sand"
          />
          <IconButton icon="mic" label="Falar" variant="ghost" />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-tucano text-canvas"
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      </form>
      {footer}
    </div>
  );
}
