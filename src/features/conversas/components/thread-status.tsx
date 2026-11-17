"use client";

import type { ReactNode } from "react";

import { GuaraAvatar } from "@/components/ui/guara-avatar";
import { Icon } from "@/components/ui/icon";
import { guara } from "@/features/guara/identity";
import { UserGreeting } from "@/features/usuario/live";
import { cn } from "@/lib/utils";

/** Cursor piscando no fim da resposta que ainda está sendo escrita. */
export function TypingCursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-4.5 w-[0.5625rem] animate-pulse rounded-[2px] bg-tucano align-[-3px]"
    />
  );
}

/** "O Lobo Guará está escrevendo…" com três pontos. */
export function TypingIndicator() {
  return (
    <div role="status" className="flex items-center gap-2 text-12 text-caption">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-mist" />
      <span aria-hidden="true" className="size-1.5 rounded-full bg-caption" />
      <span aria-hidden="true" className="size-1.5 rounded-full bg-line-strong" />
      {`O ${guara.nome} está escrevendo…`}
    </div>
  );
}

/**
 * Pergunta que não saiu (sem internet, limite do plano, outra resposta em andamento): bolha
 * tracejada, o motivo e "Tentar de novo" ou "Apagar".
 */
export function UnsentMessage({
  children,
  reason,
  offline,
  action,
  onRetry,
  onDiscard,
}: {
  children: ReactNode;
  /** Por que não saiu (a mensagem da API, em português). */
  reason: string;
  /** Sem conexão: o aviso leva o ícone de sem internet. */
  offline?: boolean;
  /** Ação extra ao lado do motivo (ex.: "Ver planos"). */
  action?: ReactNode;
  onRetry?: () => void;
  onDiscard?: () => void;
}) {
  return (
    <>
      <div className="flex justify-end">
        <p className="m-0 max-w-[21.75rem] rounded-[1.25rem_1.25rem_0.375rem_1.25rem] border-[1.5px] border-dashed border-urucum bg-transparent px-3.5 py-2.5 text-15 leading-normal font-medium break-words whitespace-pre-wrap">
          {children}
        </p>
      </div>
      <div role="alert" className="-mt-2 flex flex-wrap items-center justify-end gap-2.5 text-13">
        <span className="inline-flex items-center gap-1.5 font-bold text-urucum">
          <Icon name="alert-triangle" size={16} />
          Não enviada
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-13 font-bold text-sand"
          >
            <Icon name="retry" size={16} />
            Tentar de novo
          </button>
        )}
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="h-9 border-none bg-transparent px-2 text-13 text-mist underline"
          >
            Apagar
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 rounded-[0.875rem] bg-tucano-bg px-3.5 py-3 text-13 leading-normal">
        <div className="flex items-start gap-2.5">
          <span className="mt-px text-tucano">
            <Icon name={offline ? "wifi-off" : "alert-triangle"} size={16} />
          </span>
          <span>{reason}</span>
        </div>
        {action}
      </div>
    </>
  );
}

const starters: { assunto: string; pergunta: string }[] = [
  { assunto: "Gastos", pergunta: "Quanto gastei com comida este mês?" },
  { assunto: "Investimentos", pergunta: "Minha carteira está no meu perfil?" },
  { assunto: "Alertas de preço", pergunta: "Quais alertas de preço eu tenho?" },
  { assunto: "Metas", pergunta: "Quanto falta para as minhas metas?" },
  { assunto: "Fora do padrão", pergunta: "Teve alguma compra fora do padrão?" },
];

/** Conversa nova: a apresentação do Guará e perguntas para começar. */
export function NewConversationStart({
  compact,
  onAsk,
  className,
}: {
  /** Painel compacto: duas sugestões e sem a nota no celular; três e a nota na gaveta do tablet. */
  compact?: boolean;
  /** Manda a pergunta escolhida (começa a conversa). */
  onAsk: (text: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("mt-auto flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <GuaraAvatar size={28} variant="ring" />
          <span className="text-14 font-bold">{guara.nome}</span>
          <span className="text-12 text-caption">· Chat</span>
        </div>
        <p className="m-0 text-15 leading-[1.6] max-lg:@chat:text-16">
          <UserGreeting text="Oi" />! Eu sou o {guara.nome}. Pergunte qualquer coisa sobre seu
          dinheiro: gastos, investimentos, metas, alertas ou simulações.
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
            onClick={() => onAsk(item.pergunta)}
            className="flex min-h-13 items-center gap-2.5 rounded-tile border border-line-strong bg-card px-3.5 py-3 text-left text-14 leading-[1.4] text-sand hover:bg-shade data-extra:hidden data-third:hidden @chat:data-third:flex @tab:data-extra:flex"
          >
            <GuaraAvatar size={28} variant="ring" />
            <span className="flex min-w-0 flex-col">
              <span className="text-12 text-caption">{item.assunto}</span>
              <span className="font-semibold">{item.pergunta}</span>
            </span>
          </button>
        ))}
      </div>
      <p className={cn("m-0 text-12 leading-[1.55] text-caption", compact && "hidden @chat:block")}>
        Eu consulto seus dados do Guará para responder e nunca invento números.
      </p>
    </div>
  );
}
