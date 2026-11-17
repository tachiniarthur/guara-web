"use client";

import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { useSession } from "@/features/acesso/session";
import { ApiError } from "@/lib/api";

import {
  inReadingOrder,
  useConversation,
  useMessages,
  type ChatBlock,
  type ChatMessage,
} from "../api";
import { startedLabel, toolLabel } from "../format";
import { NEW_CONVERSATION, discardFailed, useChatStream, type PendingTurn } from "../stream";
import { ChatDateChip, GuaraMessage, UserBubble } from "./messages";
import { RichText } from "./rich-text";
import { GuaraReply, UserQuestion } from "./thread-parts";
import {
  NewConversationStart,
  TypingCursor,
  TypingIndicator,
  UnsentMessage,
} from "./thread-status";

type Variant = "panel" | "page";

/** Uma consulta do Guará (`tool_call`), discreta entre os textos. */
function ToolLine({ name, running }: { name: string; running?: boolean }) {
  return (
    <p className="m-0 flex items-center gap-1.5 text-12 text-caption">
      <Icon name="search" size={14} />
      {running ? `Consultando ${toolLabel(name)}…` : `Consultou ${toolLabel(name)}`}
    </p>
  );
}

function Blocks({ blocks, variant }: { blocks: ChatBlock[]; variant: Variant }) {
  const textClass = variant === "panel" ? "text-16 leading-[1.55]" : "text-16 leading-[1.6]";
  return blocks.map((block, i) =>
    block.type === "text" ? (
      <RichText key={i} text={block.text} className={textClass} />
    ) : block.type === "tool_call" ? (
      <ToolLine key={i} name={block.name} />
    ) : (
      <Note key={i} icon="alert-triangle" tone="warning" className="text-14">
        {block.text}
      </Note>
    ),
  );
}

function Question({ text, variant }: { text: string; variant: Variant }) {
  const content = <span className="break-words whitespace-pre-wrap">{text}</span>;
  return variant === "panel" ? (
    <UserBubble>{content}</UserBubble>
  ) : (
    <UserQuestion>{content}</UserQuestion>
  );
}

function Answer({ children, variant }: { children: ReactNode; variant: Variant }) {
  return variant === "panel" ? (
    <GuaraMessage>{children}</GuaraMessage>
  ) : (
    <GuaraReply>{children}</GuaraReply>
  );
}

function Message({ message, variant }: { message: ChatMessage; variant: Variant }) {
  if (message.role === "user") return <Question text={message.text} variant={variant} />;
  return (
    <Answer variant={variant}>
      <Blocks blocks={message.blocks} variant={variant} />
    </Answer>
  );
}

/** A pergunta que acabou de sair e a resposta chegando (ou o motivo de não ter saído). */
function Pending({
  turn,
  conversationKey,
  variant,
  onRetry,
}: {
  turn: PendingTurn;
  conversationKey: string;
  variant: Variant;
  onRetry: (text: string) => void;
}) {
  if (turn.phase === "failed") {
    const error = turn.error;
    const planIssue =
      error?.code === "plan_limit_reached" || error?.code === "subscription_required";
    return (
      <UnsentMessageFor
        text={turn.text}
        reason={error?.message ?? "Não foi possível enviar a pergunta."}
        offline={error?.code === "network"}
        planIssue={planIssue}
        onRetry={() => onRetry(turn.text)}
        onDiscard={() => discardFailed(conversationKey)}
      />
    );
  }
  const running = turn.reply === "" ? turn.tools.at(-1) : undefined;
  return (
    <>
      <Question text={turn.text} variant={variant} />
      <Answer variant={variant}>
        {running && <ToolLine name={running} running />}
        {turn.reply ? (
          <RichText
            text={turn.reply}
            className="text-16 leading-[1.6]"
            trailing={<TypingCursor />}
          />
        ) : (
          <TypingIndicator />
        )}
      </Answer>
    </>
  );
}

function UnsentMessageFor({
  text,
  reason,
  offline,
  planIssue,
  onRetry,
  onDiscard,
}: {
  text: string;
  reason: string;
  offline: boolean;
  planIssue: boolean;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  return (
    <UnsentMessage
      reason={reason}
      offline={offline}
      onRetry={planIssue ? undefined : onRetry}
      onDiscard={onDiscard}
      action={
        planIssue && (
          <ButtonLink href="/perfil/planos" variant="primary" size="sm" className="self-start">
            <span>Ver planos</span>
          </ButtonLink>
        )
      }
    >
      {text}
    </UnsentMessage>
  );
}

/**
 * Mensagens de uma conversa, no estilo do painel (bolhas) ou da página. Conversa nova (`null`):
 * a apresentação do Guará com perguntas para começar, até a primeira pergunta sair.
 */
export function ChatThread({
  conversationId,
  variant,
  compact,
  onAsk,
}: {
  conversationId: string | null;
  variant: Variant;
  /** Apresentação da conversa nova em versão curta (painéis). */
  compact?: boolean;
  /** Manda uma pergunta nesta conversa (as sugestões e o "Tentar de novo"). */
  onAsk: (text: string) => void;
}) {
  const { live } = useSession();
  const key = conversationId ?? NEW_CONVERSATION;
  const turn = useChatStream((state) => state.pending[key]);
  const conversation = useConversation(live ? conversationId : null);
  const messages = useMessages(live ? conversationId : null);

  if (conversationId === null) {
    return turn ? (
      <Pending turn={turn} conversationKey={key} variant={variant} onRetry={onAsk} />
    ) : (
      <NewConversationStart compact={compact} onAsk={onAsk} />
    );
  }

  if (messages.isPending && !turn) {
    return (
      <p role="status" className="m-0 mt-auto text-center text-14 text-caption">
        Carregando a conversa…
      </p>
    );
  }
  if (messages.isError && !turn) {
    const gone = messages.error instanceof ApiError && messages.error.code === "not_found";
    return (
      <div role="alert" className="mt-auto flex flex-col items-center gap-3 text-center">
        <p className="m-0 text-15 text-mist">
          {gone ? "Esta conversa não existe mais." : "Não deu para abrir a conversa agora."}
        </p>
        {!gone && (
          <button
            type="button"
            onClick={() => void messages.refetch()}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-14 font-bold text-sand"
          >
            <Icon name="retry" size={16} />
            Tentar de novo
          </button>
        )}
      </div>
    );
  }

  // A pergunta e a resposta em andamento já gravadas aparecem uma vez só (pelo `Pending`).
  const hidden = new Set(turn?.phase === "failed" ? [] : (turn?.savedIds ?? []));
  const list = inReadingOrder(messages.data).filter((m) => !hidden.has(m.id));
  const started = conversation.data?.createdAt ?? list[0]?.createdAt;

  return (
    <>
      {messages.hasNextPage && (
        <button
          type="button"
          disabled={messages.isFetchingNextPage}
          onClick={() => void messages.fetchNextPage()}
          className="mx-auto h-9 rounded-full border border-line-strong bg-transparent px-4 text-13 font-bold text-sand disabled:opacity-60"
        >
          {messages.isFetchingNextPage ? "Carregando…" : "Ver mensagens anteriores"}
        </button>
      )}
      {started && !messages.hasNextPage && (
        <ChatDateChip small={variant === "page"}>{startedLabel(started, new Date())}</ChatDateChip>
      )}
      {list.map((message) => (
        <Message key={message.id} message={message} variant={variant} />
      ))}
      {turn && <Pending turn={turn} conversationKey={key} variant={variant} onRetry={onAsk} />}
    </>
  );
}

/** Muda a cada mensagem nova e a cada pedaço da resposta (para rolar até o fim). */
export function useThreadTick(conversationId: string | null) {
  const key = conversationId ?? NEW_CONVERSATION;
  const turn = useChatStream((state) => state.pending[key]);
  const { live } = useSession();
  const messages = useMessages(live ? conversationId : null);
  const count = messages.data?.pages.reduce((total, p) => total + p.data.length, 0) ?? 0;
  return `${conversationId}:${count}:${turn?.phase ?? ""}:${turn?.reply.length ?? 0}:${turn?.tools.length ?? 0}`;
}
