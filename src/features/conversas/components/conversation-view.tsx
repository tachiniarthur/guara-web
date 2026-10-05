import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton, IconButtonLink } from "@/components/ui/icon-button";

import { HISTORY_WIDTH } from "@/components/layout/chat-sizes";

import type { Thread } from "../threads";
import { ConversationList } from "./conversation-list";
import { ConversationSearch } from "./conversation-search";
import { MessageComposer } from "./message-composer";
import { SessionMessages } from "./session-messages";

const promptClass =
  "h-9 shrink-0 rounded-full border border-line-strong bg-transparent px-4 text-14 whitespace-nowrap text-sand hover:bg-shade @tab:h-10";

/** Conversa aberta em tela cheia: cabeçalho, mensagens e o campo de mensagem. */
function ConversationsColumn({ currentId }: { currentId: string }) {
  return (
    <section
      aria-label="Lista de conversas"
      className={`scrollbar-none hidden h-dvh shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-line bg-card px-3.5 py-6 @desk:flex ${HISTORY_WIDTH}`}
    >
      <div className="flex items-center justify-between px-1.5">
        <h2 className="m-0 font-display text-22 font-bold tracking-[-0.01em]">Conversas</h2>
        <IconButton icon="plus" label="Nova conversa" variant="forest" size="sm" />
      </div>
      <ConversationSearch
        id="busca-conversas-lista"
        inputClassName="h-11 pr-3 text-14"
        iconClassName="top-3"
      />
      <div className="flex flex-col gap-1">
        <ConversationList
          currentId={currentId}
          groupClassName="contents"
          headingClassName="mt-2 mb-1"
        />
      </div>
    </section>
  );
}

export function ConversationView({ thread }: { thread: Thread }) {
  return (
    <div className="flex">
      <ConversationsColumn currentId={thread.id} />
      <div className="flex h-dvh min-w-0 grow flex-col">
        {/* Mobile */}
        <header className="flex h-[3.8125rem] shrink-0 items-center gap-1 border-b border-line px-2 @tab:hidden">
          <IconButtonLink href="/" icon="chevron-left" label="Voltar" variant="ghost" />
          <div className="flex min-w-0 grow flex-col items-center leading-[1.3]">
            <strong className="text-16">{thread.title}</strong>
            <span className="text-12 text-caption">{thread.time}</span>
          </div>
          <IconButtonLink
            href="/conversas/historico"
            icon="chat"
            label="Histórico de conversas"
            variant="ghost"
          />
          <IconButton icon="more" label="Mais opções da conversa" variant="ghost" />
        </header>
        {/* Tablet e desktop */}
        <header className="hidden h-[4.5625rem] shrink-0 items-center gap-2 border-b border-line pr-5 pl-7 @tab:flex @desk:justify-between @desk:gap-4 @desk:px-8">
          <div className="grow leading-[1.3] @desk:grow-0">
            <h1 className="m-0 font-display text-22 font-bold tracking-[-0.01em]">
              {thread.title}
            </h1>
            <span className="text-13 text-caption">
              <span className="@desk:hidden">{thread.time}</span>
              <span className="hidden @desk:inline">{thread.startedAt}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href="/conversas/historico" variant="secondary" className="@desk:hidden">
              <Icon name="chat" size={18} />
              <span>Histórico</span>
            </ButtonLink>
            <IconButton
              icon="plus"
              label="Nova conversa"
              variant="forest"
              className="@desk:hidden"
            />
            <IconButton icon="more" label="Mais opções da conversa" variant="ghost" />
          </div>
        </header>

        <div className="flex grow justify-center overflow-y-auto p-4 @tab:p-7 @desk:px-8 @desk:pt-7 @desk:pb-0">
          <div className="flex w-full flex-col gap-4 @tab:gap-5 @desk:max-w-[42.5rem]">
            {thread.content}
            <SessionMessages conversationId={thread.id} variant="page" />
          </div>
        </div>

        <div className="flex shrink-0 justify-center border-t border-line bg-canvas px-3 pt-2.5 pb-5 @tab:border-t-0 @tab:px-7 @tab:pt-3 @tab:pb-7 @desk:px-8 @desk:pt-4 @desk:pb-6">
          <MessageComposer
            conversationId={thread.id}
            placeholder="Pergunte qualquer coisa sobre seu dinheiro"
            compactPlaceholder="Pergunte qualquer coisa"
            className="w-full @desk:max-w-[42.5rem]"
            header={
              thread.prompts && (
                <div
                  role="group"
                  aria-label="Sugestões"
                  className="-mr-3 flex gap-2 overflow-hidden @tab:mr-0"
                >
                  {thread.prompts.map((prompt) => (
                    <button key={prompt} type="button" className={promptClass}>
                      {prompt}
                    </button>
                  ))}
                </div>
              )
            }
            footer={
              <p className="m-0 hidden text-center text-12 text-caption @tab:block">
                <span className="@desk:hidden">
                  A IA pode errar. Nada aqui é recomendação de investimento.
                </span>
                <span className="hidden @desk:inline">
                  Enter envia · Shift+Enter quebra linha · @ chama alguém da turma
                </span>
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
}
