"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Note } from "@/components/ui/note";
import { agents } from "@/features/assistentes/data";
import { cn } from "@/lib/utils";

import { useChatPanel } from "@/stores/chat-panel";

import { agentMentions } from "../data";
import { AttachmentCard } from "./thread-status";

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
  /** Estado inicial do campo (links diretos como `?estado=gravando`). */
  initialState?: ComposerState;
  /** A resposta ainda está sendo escrita: o envio vira "Parar a resposta". */
  typing?: boolean;
  /** Anexo que não chegou a ser enviado. */
  attachmentFailed?: boolean;
  className?: string;
};

export type ComposerState = "idle" | "anexar" | "previa" | "gravando" | "transcrevendo" | "limite";

const bars = [
  6, 20, 7, 9, 12, 20, 17, 11, 7, 10, 22, 8, 16, 6, 15, 11, 21, 13, 8, 11, 14, 22, 10, 11, 6, 19, 9,
  20,
];

/** Escolher o que anexar: foto, galeria ou PDF. */
function AttachDialog({ onClose, onPick }: { onClose: () => void; onPick: () => void }) {
  const options = [
    {
      label: "Tirar foto",
      desktopLabel: "Câmera",
      icon: "camera",
      tone: "bg-tucano-bg text-tucano",
    },
    { label: "Galeria", desktopLabel: "Galeria", icon: "image", tone: "bg-arara-bg text-arara" },
    {
      label: "Arquivo PDF",
      desktopLabel: "Arquivo PDF",
      icon: "file-doc",
      tone: "bg-folha-bg text-folha",
    },
  ] as const;
  return (
    <ConfirmDialog title="Anexar arquivo" onClose={onClose}>
      <p className="m-0 text-14 leading-[1.55] text-mist">
        Mande um extrato, fatura ou nota fiscal. O assistente lê e responde sobre ele.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={onPick}
            className="flex flex-col items-center gap-2 rounded-[1.125rem] border border-line bg-field px-2 py-4 text-14 font-semibold text-sand hover:bg-shade"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                option.tone,
              )}
            >
              <Icon name={option.icon} size={20} />
            </span>
            <span className="lg:hidden">{option.label}</span>
            <span className="hidden lg:inline">{option.desktopLabel}</span>
          </button>
        ))}
      </div>
      <Note icon="lock" tone="info">
        PDF, JPG ou PNG até 10 MB. O arquivo fica só nesta conversa e é apagado em 30 dias.
      </Note>
      {/* No celular o painel fecha tocando fora ou arrastando. */}
      <div className="hidden justify-end md:flex">
        <Button variant="ghost" className="text-15" onClick={onClose}>
          <span>Cancelar</span>
        </Button>
      </div>
    </ConfirmDialog>
  );
}

/** Gravando áudio: cancelar, tempo, ondas e parar (que transcreve). */
function Recording({ onCancel, onStop }: { onCancel: () => void; onStop: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-14 items-center gap-2 rounded-full border border-tucano bg-field py-1.5 pr-1.5 pl-2">
        <button
          type="button"
          aria-label="Cancelar gravação"
          onClick={onCancel}
          className="h-11 shrink-0 rounded-full border-none bg-transparent px-3 text-14 font-bold text-mist"
        >
          Cancelar
        </button>
        <span className="flex shrink-0 items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-urucum" />
          <strong className="tabular-nums">0:07</strong>
        </span>
        <div
          aria-hidden="true"
          className="flex h-8 min-w-0 grow items-center gap-[3px] overflow-hidden"
        >
          {bars.map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] shrink-0 rounded-[2px]",
                i < 18 ? "bg-tucano" : "bg-line-strong",
              )}
              style={{ height: `${h / 16}rem` }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Parar e transcrever"
          onClick={onStop}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-tucano text-canvas"
        >
          <Icon name="stop" />
        </button>
      </div>
      <span className="text-center text-12 text-caption @desk:hidden">
        Gravando… fale sua pergunta. Toque no quadrado para parar.
      </span>
      <span className="hidden text-center text-12 text-caption @desk:block">
        Gravando… fale sua pergunta. Clique no quadrado para parar.
      </span>
    </div>
  );
}

/** Transcrevendo o áudio: o texto aparece e pode ser editado antes de enviar. */
function Transcribing({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-14 items-center gap-2 rounded-full border border-line-strong bg-field py-1.5 pr-1.5 pl-2">
        <button
          type="button"
          aria-label="Cancelar gravação"
          onClick={onCancel}
          className="h-11 shrink-0 rounded-full border-none bg-transparent px-3 text-14 font-bold text-mist"
        >
          Cancelar
        </button>
        <span className="flex min-w-0 grow items-center gap-2 text-15 text-sand">
          <span
            aria-hidden="true"
            className="size-4.5 shrink-0 animate-spin rounded-full border-3 border-tucano border-t-transparent"
          />
          <span className="overflow-hidden whitespace-nowrap">
            quanto eu gastei com delivery no fim de…
          </span>
        </span>
        <button
          type="button"
          aria-label="Enviar"
          disabled
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-line-strong text-caption"
        >
          <Icon name="arrow-right" />
        </button>
      </div>
      <span className="text-center text-12 text-caption">
        Transcrevendo o áudio de 7 segundos. Você pode editar antes de enviar.
      </span>
    </div>
  );
}

/** Acabaram as perguntas do mês no plano. */
function LimitReached({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-2.5 rounded-bubble border border-[#5A4A1A] bg-tucano-bg p-4"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-tucano">
          <Icon name="alert-triangle" size={18} />
        </span>
        <span className="text-14 leading-normal">
          <strong>Você usou as 300 perguntas deste mês do plano Completo.</strong> Elas voltam no
          dia 10. Até lá, seus dados continuam atualizando e os avisos chegam normalmente.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ButtonLink href="/perfil/planos" variant="primary" size="sm">
          <span>Ver planos</span>
        </ButtonLink>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <span>Entendi</span>
        </Button>
      </div>
    </div>
  );
}

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
  initialState = "idle",
  typing,
  attachmentFailed,
  className,
}: MessageComposerProps) {
  const send = useChatPanel((state) => state.send);
  const ask = useChatPanel((state) => state.ask);
  const inputId = useId();
  const compact = useCompact();
  const [state, setState] = useState<ComposerState>(initialState);
  const [failed, setFailed] = useState(Boolean(attachmentFailed));
  const [value, setValue] = useState(
    initialState === "previa" ? "o que tem neste extrato que não está no app?" : defaultValue,
  );
  const [mentionOpen, setMentionOpen] = useState(defaultMentionOpen || defaultValue.endsWith("@"));
  const idle = () => setState("idle");

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
      {state === "gravando" ? (
        <Recording onCancel={idle} onStop={() => setState("transcrevendo")} />
      ) : state === "transcrevendo" ? (
        <Transcribing onCancel={idle} />
      ) : state === "limite" ? (
        <LimitReached onDismiss={idle} />
      ) : (
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
          {failed && <AttachmentCard failed onRemove={() => setFailed(false)} />}
          {state === "previa" && <AttachmentCard onRemove={idle} />}
          <label htmlFor={inputId} className="sr-only">
            Mensagem
          </label>
          <div className="flex min-h-14 items-center gap-0.5 rounded-full border border-line-strong bg-field p-1.5">
            <IconButton
              icon="paperclip"
              label="Anexar arquivo"
              variant="ghost"
              onClick={() => setState("anexar")}
            />
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
            <IconButton
              icon="mic"
              label="Falar"
              variant="ghost"
              onClick={() => setState("gravando")}
            />
            {typing ? (
              <button
                type="button"
                aria-label="Parar a resposta"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-shade text-sand"
              >
                <Icon name="stop" size={18} />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Enviar mensagem"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-tucano text-canvas"
              >
                <Icon name="arrow-right" />
              </button>
            )}
          </div>
        </form>
      )}
      {state === "anexar" && <AttachDialog onClose={idle} onPick={() => setState("previa")} />}
      {footer}
    </div>
  );
}
