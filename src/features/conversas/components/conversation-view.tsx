"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { useSession } from "@/features/acesso/session";

import { useConversation } from "../api";
import { startedLabel } from "../format";
import { useChatSend } from "../stream";
import { QuickPrompts } from "./chat-composer";
import { ChatThread, useThreadTick } from "./chat-thread";
import { ConversationMenu, ExitFullscreenButton } from "./conversation-actions";
import { ConversationList } from "./conversation-list";
import { ConversationSearch, useDebounced } from "./conversation-search";
import { MessageComposer } from "./message-composer";

/** Lista de conversas à esquerda (desktop). */
function ConversationsColumn({ currentId }: { currentId: string | null }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query);
  return (
    <section
      aria-label="Lista de conversas"
      className="scrollbar-none hidden h-dvh w-[18.75rem] shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-line bg-card px-3.5 py-6 @desk:flex"
    >
      <div className="flex items-center justify-between px-1.5">
        <h2 className="m-0 font-display text-22 font-bold tracking-[-0.01em]">Conversas</h2>
        <IconButtonLink
          href="/conversas"
          icon="plus"
          label="Nova conversa"
          variant="forest"
          size="sm"
        />
      </div>
      <ConversationSearch
        id="busca-conversas-lista"
        value={query}
        onChange={setQuery}
        inputClassName="h-11 pr-3 text-14"
        iconClassName="top-3"
      />
      <div className="flex flex-col gap-1">
        <ConversationList
          currentId={currentId}
          query={debounced}
          groupClassName="contents"
          headingClassName="mt-2 mb-1"
        />
      </div>
    </section>
  );
}

/** Conversa aberta em tela cheia (ou uma conversa nova, com `conversationId` nulo). */
export function ConversationView({ conversationId }: { conversationId: string | null }) {
  const router = useRouter();
  const { live } = useSession();
  const send = useChatSend();
  const conversation = useConversation(live ? conversationId : null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tick = useThreadTick(conversationId);

  // A primeira pergunta cria a conversa: o endereço passa a ser o dela (sem recarregar).
  const onCreated = (id: string) => router.replace(`/conversas/${id}`);
  const ask = (text: string) => void send(conversationId, text, { onCreated });

  useEffect(() => {
    const list = scrollRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [tick]);

  const title = conversationId ? (conversation.data?.title ?? "Conversa") : "Nova conversa";
  const subtitle = conversation.data
    ? startedLabel(conversation.data.createdAt, new Date())
    : conversationId
      ? ""
      : "Ainda sem mensagens";
  const menu = conversationId && conversation.data && (
    <ConversationMenu
      conversationId={conversationId}
      title={conversation.data.title}
      onDeleted={() => router.replace("/conversas")}
    />
  );

  return (
    <div className="flex">
      <ConversationsColumn currentId={conversationId} />
      <div className="flex h-dvh min-w-0 grow flex-col">
        {/* Mobile */}
        <header className="flex h-[3.8125rem] shrink-0 items-center gap-1 border-b border-line px-2 @tab:hidden">
          <IconButtonLink href="/" icon="chevron-left" label="Voltar" variant="ghost" />
          <div className="flex min-w-0 grow flex-col items-center leading-[1.3]">
            <strong className="max-w-full truncate text-16">{title}</strong>
            <span className="text-12 text-caption">{subtitle}</span>
          </div>
          <IconButtonLink
            href="/conversas/historico"
            icon="chat"
            label="Histórico de conversas"
            variant="ghost"
          />
          <ExitFullscreenButton conversationId={conversationId} />
          {menu}
        </header>
        {/* Tablet e desktop: o caminho numa faixa fina acima do cabeçalho (a conversa ocupa a tela). */}
        <div className="hidden shrink-0 border-b border-line px-7 py-2.5 @tab:flex @desk:px-8">
          <Breadcrumb
            className="flex-wrap"
            items={[{ label: "Conversas", href: "/conversas/historico" }, { label: title }]}
          />
        </div>
        <header className="hidden h-[4.5625rem] shrink-0 items-center gap-2 border-b border-line pr-5 pl-7 @tab:flex @desk:justify-between @desk:gap-4 @desk:px-8">
          <div className="min-w-0 grow leading-[1.3] @desk:grow-0">
            <h1 className="m-0 truncate font-display text-22 font-bold tracking-[-0.01em]">
              {title}
            </h1>
            <span className="text-13 text-caption">{subtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href="/conversas/historico" variant="secondary" className="@desk:hidden">
              <Icon name="chat" size={18} />
              <span>Histórico</span>
            </ButtonLink>
            <IconButtonLink
              href="/conversas"
              icon="plus"
              label="Nova conversa"
              variant="forest"
              className="@desk:hidden"
            />
            <ExitFullscreenButton conversationId={conversationId} />
            {menu}
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex grow justify-center overflow-y-auto p-4 @tab:p-7 @desk:px-8 @desk:pt-7 @desk:pb-0"
        >
          <div className="flex w-full flex-col gap-4 @tab:gap-5 @desk:max-w-[42.5rem]">
            <ChatThread conversationId={conversationId} variant="page" onAsk={ask} />
          </div>
        </div>

        <div className="flex shrink-0 justify-center border-t border-line bg-canvas px-3 pt-2.5 pb-5 @tab:border-t-0 @tab:px-7 @tab:pt-3 @tab:pb-7 @desk:px-8 @desk:pt-4 @desk:pb-6">
          <MessageComposer
            key={conversationId ?? "nova"}
            conversationId={conversationId}
            onCreated={onCreated}
            placeholder="Pergunte qualquer coisa sobre seu dinheiro"
            compactPlaceholder="Pergunte qualquer coisa"
            className="w-full @desk:max-w-[42.5rem]"
            header={
              conversationId && (
                <QuickPrompts
                  conversationId={conversationId}
                  className="-mr-3 @tab:mr-0 @desk:hidden"
                />
              )
            }
            footer={
              <p className="m-0 text-center text-12 text-caption">
                <span className="@desk:font-semibold @desk:text-mist">
                  A IA pode errar. Nada aqui é recomendação de investimento.
                </span>
                <span className="hidden @desk:inline">
                  {" · Enter envia · Shift+Enter quebra linha"}
                </span>
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
}
