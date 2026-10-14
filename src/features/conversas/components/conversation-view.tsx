import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton, IconButtonLink } from "@/components/ui/icon-button";
import { agents, type AgentId } from "@/features/assistentes/data";

import type { Thread } from "../threads";
import { ConversationMenu, ExitFullscreenButton } from "./conversation-actions";
import { ConversationList } from "./conversation-list";
import { ConversationSearch } from "./conversation-search";
import { MessageComposer, type ComposerState } from "./message-composer";
import { SessionMessages } from "./session-messages";
import { NewConversationStart } from "./thread-status";

const promptClass =
  "h-9 shrink-0 rounded-full border border-line-strong bg-transparent px-4 text-14 whitespace-nowrap text-sand hover:bg-shade @tab:h-10";

/** Estados da conversa que dá para abrir por link (`?estado=`). */
export type ConversationState =
  | "nao-enviada"
  | "anexar"
  | "anexo-previa"
  | "gravando"
  | "transcrevendo"
  | "limite"
  | "menu"
  | "apagar"
  | "mencionar";

const composerStates: Partial<Record<ConversationState, ComposerState>> = {
  anexar: "anexar",
  "anexo-previa": "previa",
  gravando: "gravando",
  transcrevendo: "transcrevendo",
  limite: "limite",
};

/** Lista de conversas à esquerda (desktop). */
function ConversationsColumn({ currentId }: { currentId: string | null }) {
  return (
    <section
      aria-label="Lista de conversas"
      className="scrollbar-none hidden h-dvh w-[18.75rem] shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-line bg-card px-3.5 py-6 @desk:flex"
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
          currentId={currentId ?? ""}
          groupClassName="contents"
          headingClassName="mt-2 mb-1"
        />
      </div>
    </section>
  );
}

/** Quem responde a conversa (para o texto de "Apagar esta conversa?"). */
const keepNotes: Record<string, string> = {
  "aposentadoria-55": "Suas simulações salvas e seus dados não são apagados.",
};

const replyAgent: Record<string, AgentId> = {
  "gastos-setembro": "tamandua",
  "aposentadoria-55": "pacu",
  "rendimento-setembro": "pacu",
  "petr4-hoje": "pacu",
  "extrato-itau": "capivara",
};

/** Conversa aberta em tela cheia (ou uma conversa nova, com `thread` nulo). */
export function ConversationView({
  thread,
  estado,
}: {
  thread: Thread | null;
  estado?: ConversationState;
}) {
  const id = thread?.id ?? null;
  const title = thread?.title ?? "Nova conversa";
  const unsent = estado === "nao-enviada" && thread?.unsentContent;
  const subtitle = !thread
    ? "Ainda sem mensagens"
    : unsent
      ? thread.subtitle
      : (thread.pageSubtitle ?? thread.time);
  const menu = (
    <ConversationMenu
      title={title}
      agentName={agents[(id && replyAgent[id]) || "capivara"].nome}
      keepNote={(id && keepNotes[id]) || "Seus dados de gastos não são apagados."}
      initial={estado === "menu" || estado === "apagar" ? estado : undefined}
    />
  );

  return (
    <div className="flex">
      <ConversationsColumn currentId={id} />
      <div className="flex h-dvh min-w-0 grow flex-col">
        {/* Mobile */}
        <header className="flex h-[3.8125rem] shrink-0 items-center gap-1 border-b border-line px-2 @tab:hidden">
          <IconButtonLink href="/" icon="chevron-left" label="Voltar" variant="ghost" />
          <div className="flex min-w-0 grow flex-col items-center leading-[1.3]">
            <strong className="text-16">{title}</strong>
            <span className="text-12 text-caption">{subtitle}</span>
          </div>
          <IconButtonLink
            href="/conversas/historico"
            icon="chat"
            label="Histórico de conversas"
            variant="ghost"
          />
          <ExitFullscreenButton conversationId={id} />
          {menu}
        </header>
        {/* Tablet e desktop */}
        <header className="hidden h-[4.5625rem] shrink-0 items-center gap-2 border-b border-line pr-5 pl-7 @tab:flex @desk:justify-between @desk:gap-4 @desk:px-8">
          <div className="grow leading-[1.3] @desk:grow-0">
            <h1 className="m-0 font-display text-22 font-bold tracking-[-0.01em]">{title}</h1>
            <span className="text-13 text-caption">
              <span className="@desk:hidden">{subtitle}</span>
              <span className="hidden @desk:inline">{thread?.startedAt ?? subtitle}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href="/conversas/historico" variant="secondary" className="@desk:hidden">
              <Icon name="chat" size={18} />
              <span>Histórico</span>
            </ButtonLink>
            <IconButtonLink
              href="/conversas/nova"
              icon="plus"
              label="Nova conversa"
              variant="forest"
              className="@desk:hidden"
            />
            <span className="hidden @desk:contents">
              <ExitFullscreenButton conversationId={id} />
            </span>
            {menu}
            <span className="contents @desk:hidden">
              <ExitFullscreenButton conversationId={id} />
            </span>
          </div>
        </header>

        <div className="flex grow justify-center overflow-y-auto p-4 @tab:p-7 @desk:px-8 @desk:pt-7 @desk:pb-0">
          <div className="flex w-full flex-col gap-4 @tab:gap-5 @desk:max-w-[42.5rem]">
            {thread ? unsent ? thread.unsentContent : thread.content : <NewConversationStart />}
            {id && <SessionMessages conversationId={id} variant="page" />}
          </div>
        </div>

        <div className="flex shrink-0 justify-center border-t border-line bg-canvas px-3 pt-2.5 pb-5 @tab:border-t-0 @tab:px-7 @tab:pt-3 @tab:pb-7 @desk:px-8 @desk:pt-4 @desk:pb-6">
          <MessageComposer
            key={estado ?? "padrao"}
            conversationId={id ?? undefined}
            placeholder="Pergunte qualquer coisa sobre seu dinheiro"
            compactPlaceholder="Pergunte qualquer coisa"
            initialState={estado ? composerStates[estado] : undefined}
            defaultMentionOpen={estado === "mencionar"}
            typing={thread?.typing}
            attachmentFailed={thread?.attachmentFailed}
            className="w-full @desk:max-w-[42.5rem]"
            header={
              thread?.prompts && (
                <div
                  role="group"
                  aria-label="Sugestões"
                  className="-mr-3 flex gap-2 overflow-hidden @tab:mr-0 @desk:hidden"
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
              <p className="m-0 text-center text-12 text-caption">
                <span className="@desk:font-semibold @desk:text-mist">
                  A IA pode errar. Nada aqui é recomendação de investimento.
                </span>
                <span className="hidden @desk:inline">
                  {" · Enter envia · Shift+Enter quebra linha · @ chama alguém da turma"}
                </span>
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
}
