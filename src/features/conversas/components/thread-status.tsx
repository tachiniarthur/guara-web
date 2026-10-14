"use client";

import type { ReactNode } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { agents, type AgentId } from "@/features/assistentes/data";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

const article = (agent: AgentId) => (agent === "capivara" || agent === "onca" ? "a" : "o");

/** "A Capivara chamou o Pacu · Investimentos" (quando a coordenação passa a pergunta). */
export function CalledBy({ agent }: { agent: AgentId }) {
  return (
    <div className="flex items-center gap-2 text-12 text-caption">
      <AgentAvatar agent="capivara" size={20} variant="ring" />
      <span>
        {`A Capivara chamou ${article(agent)} `}
        <strong className="text-mist">{agents[agent].nome}</strong>
        {` · ${agents[agent].papel}`}
      </span>
    </div>
  );
}

/** Cursor piscando no fim da resposta que ainda está sendo escrita. */
export function TypingCursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-4.5 w-[0.5625rem] animate-pulse rounded-[2px] bg-tucano align-[-3px]"
    />
  );
}

/** "O Pacu está escrevendo…" com três pontos. */
export function TypingIndicator({ agent }: { agent: AgentId }) {
  return (
    <div role="status" className="flex items-center gap-2 text-12 text-caption">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-mist" />
      <span aria-hidden="true" className="size-1.5 rounded-full bg-caption" />
      <span aria-hidden="true" className="size-1.5 rounded-full bg-line-strong" />
      {`${article(agent) === "a" ? "A" : "O"} ${agents[agent].nome} está escrevendo…`}
    </div>
  );
}

/** O bicho chamado não respondeu: a pergunta fica guardada e dá para tentar de novo. */
export function UnavailableAlert({ agent }: { agent: AgentId }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2.5 rounded-[1.125rem] border border-urucum-line bg-urucum-bg px-4 py-3.5"
    >
      <div className="flex items-center gap-2.5">
        <AgentAvatar agent={agent} size={28} variant="ring" />
        <strong className="grow text-14">
          {`${article(agent) === "a" ? "A" : "O"} ${agents[agent].nome} não está respondendo agora`}
        </strong>
        <Tag tone="urucum" status>
          Indisponível
        </Tag>
      </div>
      <p className="m-0 text-14 leading-[1.55] text-sand">
        Sua pergunta ficou guardada. Tentamos de novo sozinhos em alguns minutos e avisamos quando a
        resposta chegar. Seus dados não foram afetados.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm">
          <Icon name="retry" size={18} />
          <span>Tentar de novo</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="chat" size={18} />
          <span>Perguntar à Capivara</span>
        </Button>
      </div>
    </div>
  );
}

/** Mensagem que não saiu (sem conexão): bolha tracejada, tentar de novo ou apagar. */
export function UnsentMessage({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex justify-end">
        <p className="m-0 max-w-[21.75rem] rounded-[1.25rem_1.25rem_0.375rem_1.25rem] border-[1.5px] border-dashed border-urucum bg-transparent px-3.5 py-2.5 text-15 leading-normal font-medium">
          {children}
        </p>
      </div>
      <div role="alert" className="-mt-2 flex flex-wrap items-center justify-end gap-2.5 text-13">
        <span className="inline-flex items-center gap-1.5 font-bold text-urucum">
          <Icon name="alert-triangle" size={16} />
          Não enviada
        </span>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-13 font-bold text-sand"
        >
          <Icon name="retry" size={16} />
          Tentar de novo
        </button>
        <button
          type="button"
          className="h-9 border-none bg-transparent px-2 text-13 text-mist underline"
        >
          Apagar
        </button>
      </div>
      <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-tucano-bg px-3.5 py-3 text-13 leading-normal">
        <span className="mt-px text-tucano">
          <Icon name="wifi-off" size={16} />
        </span>
        <span>Sem conexão. A mensagem fica aqui até você tentar de novo; nada se perde.</span>
      </div>
    </>
  );
}

const starters: { agent: AgentId; pergunta: string }[] = [
  { agent: "tamandua", pergunta: "Quanto gastei com comida em setembro?" },
  { agent: "pacu", pergunta: "Minha carteira está no meu perfil?" },
  { agent: "caramelo", pergunta: "Me avisa se o Bitcoin passar de R$ 650.000" },
  { agent: "onca", pergunta: "Quanto falta para a reserva de emergência?" },
  { agent: "quero-quero", pergunta: "Teve alguma compra fora do padrão?" },
];

/** Conversa nova: a turma pronta, a apresentação da Capivara e perguntas para começar. */
export function NewConversationStart({
  compact,
  onAsk,
  className,
}: {
  /** Painel compacto: duas sugestões e sem a nota no celular; três e a nota na gaveta do tablet. */
  compact?: boolean;
  onAsk?: (text: string) => void;
  className?: string;
}) {
  const team: AgentId[] = ["tamandua", "pacu", "caramelo", "quero-quero", "onca"];
  const ask = useChatPanel((state) => state.ask);
  return (
    <div className={cn("mt-auto flex flex-col gap-4", className)}>
      <div className="flex items-center gap-1.5">
        {team.map((agent) => (
          <span key={agent} className="contents">
            <span className="@tab:hidden">
              <AgentAvatar agent={agent} size={30} variant="ring" />
            </span>
            <span className="hidden @tab:block">
              <AgentAvatar agent={agent} size={36} variant="ring" />
            </span>
          </span>
        ))}
        <span className="ml-1 text-12 text-caption">5 assistentes prontos</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AgentAvatar agent="capivara" size={28} variant="ring" />
          <span className="text-14 font-bold">Capivara</span>
          <span className="text-12 text-caption">· Coordena a turma</span>
        </div>
        <p className="m-0 text-15 leading-[1.6] max-lg:@chat:text-16">
          Oi, Arthur! Eu sou a Capivara. Pergunte qualquer coisa sobre seu dinheiro que eu chamo
          quem entende do assunto. Se preferir, digite <strong>@</strong> e escolha um bicho.
        </p>
      </div>
      <span className="text-13 font-bold text-mist">Comece por aqui</span>
      <div className="grid grid-cols-1 gap-2 @tab:grid-cols-2">
        {(compact ? starters.slice(0, 3) : starters).map((item, i) => (
          <button
            key={item.pergunta}
            type="button"
            data-extra={i === 4 || undefined}
            data-third={(compact && i === 2) || undefined}
            onClick={() => (onAsk ?? ask)(item.pergunta)}
            className="flex min-h-13 items-center gap-2.5 rounded-tile border border-line-strong bg-card px-3.5 py-3 text-left text-14 leading-[1.4] text-sand hover:bg-shade data-extra:hidden data-third:hidden @chat:data-third:flex @tab:data-extra:flex"
          >
            <AgentAvatar agent={item.agent} size={28} variant="ring" />
            <span className="flex min-w-0 flex-col">
              <span className="text-12 text-caption">{agents[item.agent].nome}</span>
              <span className="font-semibold">{item.pergunta}</span>
            </span>
          </button>
        ))}
      </div>
      <p className={cn("m-0 text-12 leading-[1.55] text-caption", compact && "hidden @chat:block")}>
        Eles consultam seus dados do Guará para responder e nunca inventam números.
      </p>
    </div>
  );
}

/** Arquivo anexado ao campo: pronto para enviar ou com falha no envio. */
export function AttachmentCard({ failed, onRemove }: { failed?: boolean; onRemove?: () => void }) {
  return (
    <div
      role={failed ? "alert" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-tile border px-3 py-2.5",
        failed ? "border-urucum-line bg-urucum-bg" : "border-line-strong bg-shade",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          failed ? "bg-urucum-bg text-urucum" : "bg-folha-bg text-folha",
        )}
      >
        <Icon name="file-doc" size={20} />
      </span>
      <span className="flex min-w-0 grow flex-col leading-[1.3]">
        <strong className="overflow-hidden text-14 whitespace-nowrap">
          extrato-itau-setembro.pdf
        </strong>
        <span className={cn("text-12", failed ? "text-mist" : "text-caption")}>
          {failed
            ? "Não deu para enviar · a conexão caiu em 60%"
            : "PDF · 2 páginas · 184 KB · pronto para enviar"}
        </span>
      </span>
      {failed && (
        <button
          type="button"
          aria-label="Tentar enviar de novo"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-card text-sand"
        >
          <Icon name="retry" size={18} />
        </button>
      )}
      <button
        type="button"
        aria-label="Remover anexo"
        onClick={onRemove}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-mist hover:bg-card"
      >
        <Icon name="x" />
      </button>
    </div>
  );
}
