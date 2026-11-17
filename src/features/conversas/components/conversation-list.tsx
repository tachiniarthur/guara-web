"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useSession } from "@/features/acesso/session";
import { cn } from "@/lib/utils";

import { useChatSearch, useConversations, type Conversation } from "../api";
import { groupConversations, whenLabel } from "../format";

type Size = "md" | "lg";

const itemClass = (size: Size, current: boolean) =>
  // O mesmo retorno dos itens do menu lateral: fundo, deslize de 2px e aperto ao tocar.
  cn(
    "flex w-full flex-col gap-0.5 rounded-full border-none px-3.5 py-2 text-left text-sand no-underline transition-[color,background-color,translate] duration-200 hover:translate-x-0.5 hover:bg-shade active:scale-[0.98]",
    size === "lg" ? "min-h-15" : "min-h-13",
    current ? "bg-shade" : "bg-transparent",
  );

/** Um item: botão que abre no painel (`onSelect`) ou link para a página da conversa. */
function Item({
  id,
  current,
  size,
  onSelect,
  children,
}: {
  id: string;
  current: boolean;
  size: Size;
  onSelect?: (id: string) => void;
  children: ReactNode;
}) {
  const className = itemClass(size, current);
  return (
    <li>
      {onSelect ? (
        <button
          type="button"
          aria-current={current ? "true" : undefined}
          onClick={() => onSelect(id)}
          className={className}
        >
          {children}
        </button>
      ) : (
        <Link
          href={`/conversas/${id}`}
          aria-current={current ? "true" : undefined}
          className={className}
        >
          {children}
        </Link>
      )}
    </li>
  );
}

function Message({ size, children }: { size: Size; children: ReactNode }) {
  return (
    <p className={cn("m-0 px-2.5 py-2 text-caption", size === "lg" ? "text-14" : "text-13")}>
      {children}
    </p>
  );
}

/** Trecho da busca com os termos (entre « e » na API) em destaque. */
function Snippet({ text }: { text: string }) {
  return text.split(/(«[^»]*»)/g).map((part, i) =>
    part.startsWith("«") && part.endsWith("»") ? (
      <mark key={i} className="rounded-[3px] bg-tucano-bg px-0.5 text-sand">
        {part.slice(1, -1)}
      </mark>
    ) : (
      part
    ),
  );
}

type ListProps = {
  /** "lg": itens de 60px com 15/13 (histórico do Início). */
  size?: Size;
  /** Conversa aberta (destacada). */
  currentId?: string | null;
  /** Com `onSelect`, cada item abre a conversa no painel; sem ele, leva à página da conversa. */
  onSelect?: (id: string) => void;
  /** Com texto (2 letras ou mais), mostra o resultado da busca no lugar do histórico. */
  query?: string;
  groupClassName?: string;
  headingClassName?: string;
};

/**
 * Conversas com o Guará agrupadas por período (painel lateral, painel de conversa e tela de
 * histórico), da API. Com `query`, os trechos das conversas que têm aqueles termos.
 */
export function ConversationList({ query = "", ...props }: ListProps) {
  return query.trim().length >= 2 ? (
    <SearchResults query={query} {...props} />
  ) : (
    <History {...props} />
  );
}

function History({
  size = "md",
  currentId,
  onSelect,
  groupClassName,
  headingClassName,
}: ListProps) {
  const { live } = useSession();
  const conversations = useConversations({ enabled: live });
  if (conversations.isPending) return <Message size={size}>Carregando as conversas…</Message>;
  if (conversations.isError) {
    return (
      <Message size={size}>
        Não deu para carregar as conversas.{" "}
        <button
          type="button"
          onClick={() => void conversations.refetch()}
          className="border-none bg-transparent p-0 font-bold text-sand underline"
        >
          Tentar de novo
        </button>
      </Message>
    );
  }
  const items: Conversation[] = conversations.data.pages.flatMap((p) => p.data);
  if (items.length === 0)
    return <Message size={size}>Suas conversas com o Guará vão aparecer aqui.</Message>;
  const now = new Date();

  return (
    <>
      {groupConversations(items, now).map((group) => (
        <div key={group.titulo} className={groupClassName}>
          <h3
            className={cn(
              "mt-2.5 mr-0 mb-0.5 ml-2.5 font-bold tracking-[.1em] text-caption uppercase",
              size === "lg" ? "text-13" : "text-12",
              headingClassName,
            )}
          >
            {group.titulo}
          </h3>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {group.itens.map((item) => {
              const current = item.id === currentId;
              return (
                <Item key={item.id} id={item.id} current={current} size={size} onSelect={onSelect}>
                  <span className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "min-w-0 grow truncate",
                        size === "lg" ? "text-15" : "text-14",
                        current ? "font-bold" : "font-medium",
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn("shrink-0 text-caption", size === "lg" ? "text-13" : "text-12")}
                    >
                      {whenLabel(item.lastMessageAt, now)}
                    </span>
                  </span>
                </Item>
              );
            })}
          </ul>
        </div>
      ))}
      {conversations.hasNextPage && (
        <button
          type="button"
          disabled={conversations.isFetchingNextPage}
          onClick={() => void conversations.fetchNextPage()}
          className="mx-2.5 mt-2 h-9 self-start rounded-full border border-line-strong bg-transparent px-4 text-13 font-bold text-sand disabled:opacity-60"
        >
          {conversations.isFetchingNextPage ? "Carregando…" : "Ver conversas mais antigas"}
        </button>
      )}
    </>
  );
}

function SearchResults({ query = "", size = "md", currentId, onSelect }: ListProps) {
  const results = useChatSearch(query);
  if (results.isPending) return <Message size={size}>Buscando…</Message>;
  if (results.isError)
    return <Message size={size}>Não deu para buscar agora. Tente de novo.</Message>;
  if (results.data.length === 0)
    return <Message size={size}>Nenhuma conversa com esses termos.</Message>;
  const now = new Date();
  return (
    <ul aria-label="Resultado da busca" className="m-0 flex list-none flex-col gap-0.5 p-0">
      {results.data.map((result) => (
        <Item
          key={result.messageId}
          id={result.conversationId}
          current={result.conversationId === currentId}
          size={size}
          onSelect={onSelect}
        >
          <span className="flex items-baseline gap-2">
            <span
              className={cn(
                "min-w-0 grow truncate font-medium",
                size === "lg" ? "text-15" : "text-14",
              )}
            >
              {result.conversationTitle}
            </span>
            <span className={cn("shrink-0 text-caption", size === "lg" ? "text-13" : "text-12")}>
              {whenLabel(result.createdAt, now)}
            </span>
          </span>
          <span className={cn("line-clamp-2 text-caption", size === "lg" ? "text-13" : "text-12")}>
            <Snippet text={result.snippet} />
          </span>
        </Item>
      ))}
    </ul>
  );
}
