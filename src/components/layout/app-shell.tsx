"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

import { ReportChatAside } from "@/features/relatorio/components/report-chat-aside";
import { ErrorToast, OfflineToast } from "@/components/states/status-toast";
import { PANEL_EXIT_MS, Presence } from "@/components/ui/presence";
import { shellConfig } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";
import { usePrivacy } from "@/stores/privacy";

import { BottomNav } from "./bottom-nav";
import { ChatOverlay, ChatPanel } from "./chat-panel";
import { CHAT_WIDTH, HISTORY_WIDTH } from "./chat-sizes";
import { ConversarFabCompact } from "./conversar-fab";
import { HistoryHandle, HistoryPanel } from "./history-panel";
import { Rail } from "./rail";
import { SettingsEffects } from "./settings-effects";
import { Sidebar } from "./sidebar";
import { ValuesMask } from "./values-mask";

/**
 * Estrutura do app pelas classes de janela:
 * compacto (< 600): barra inferior · médio (600–1199): trilho + atalho do chat na borda ·
 * grande (≥ 1200): menu lateral + painel de conversas à direita (conversa aberta a partir de 1600).
 *
 * O chat funciona em qualquer tela: a partir de 1600 px, nas telas com painel lateral, a conversa
 * fica fixa à direita; nas demais situações ela abre por cima da tela (gaveta ou tela cheia).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="relative flex min-h-dvh">
      <Sidebar className="hidden lg:flex" />
      <Rail className="hidden md:flex lg:hidden" />
      <main className="@container min-w-0 flex-1">{children}</main>
      <ValuesMask />
      <SettingsEffects />
      <Suspense fallback={<ShellChrome pathname={pathname} novo={false} />}>
        <ShellChromeFromUrl pathname={pathname} />
      </Suspense>
    </div>
  );
}

const chatLinks: Record<string, string> = {
  aberto: "gastos-setembro",
  digitando: "rendimento-setembro",
  indisponivel: "petr4-hoje",
  "anexo-falhou": "extrato-itau",
};

function ShellChromeFromUrl({ pathname }: { pathname: string }) {
  const params = useSearchParams();
  const novo = params.get("estado") === "novo";
  const setHidden = usePrivacy((state) => state.setHidden);
  // Link direto com os valores ocultos (`?valores=ocultos`).
  const ocultos = params.get("valores") === "ocultos";
  useEffect(() => {
    if (ocultos) setHidden(true);
  }, [ocultos, setHidden]);
  // Chat aberto por link (`?chat=aberto`, `?chat=nova`, `?chat=digitando`…).
  const chat = params.get("chat");
  useEffect(() => {
    if (!chat) return;
    const { openConversation, newConversation } = useChatPanel.getState();
    if (chat === "historico") useChatPanel.getState().close();
    else if (chat === "nova") newConversation();
    else if (chat === "nao-enviada") openConversation("gastos-setembro", "nao-enviada");
    else openConversation(chatLinks[chat] ?? chat);
  }, [chat]);
  const estado = params.get("estado");
  return (
    <>
      <ShellChrome pathname={pathname} novo={novo} />
      {/* Avisos dos estados de erro e sem internet (`?estado=erro`, `?estado=sem-internet`). */}
      {estado === "erro" && <ErrorToast />}
      {estado === "sem-internet" && <OfflineToast />}
    </>
  );
}

/** Painel de conversas, chat por cima, botões "Conversar" e barra inferior de cada rota. */
function ShellChrome({ pathname, novo }: { pathname: string; novo: boolean }) {
  const config = shellConfig(pathname, { novo });
  const open = useChatPanel((state) => state.open);
  const historyHidden = useChatPanel((state) => state.historyHidden);
  // O X do histórico tira o painel da direita; fica um atalho pequeno na borda para reabrir.
  const hasAside = config.aside !== false && !historyHidden;
  // As páginas de conversa já são o chat em tela cheia.
  const chatAvailable = !pathname.startsWith("/conversas");
  // Conversa fixa à direita só quando a pessoa abre; antes, o painel mostra só o histórico
  // (recolhido, também no Início ao entrar).
  const docked = hasAside && open === true;
  // Início: histórico mais largo (24rem), menos com uma conversa aberta por cima (1200–1599 px).
  const wide = config.aside === "home" && !docked;
  const historyWidth = wide ? "w-96" : HISTORY_WIDTH;

  return (
    <>
      {config.tabletChat && !(chatAvailable && open === true) && (
        <ReportChatAside className="hidden min-[68.75rem]:flex lg:hidden" />
      )}
      {/*
       * Painéis fixos à direita (desktop): entram deslizando da direita e a página se ajusta junto;
       * ao fechar (ou trocar histórico ↔ conversa) saem pelo mesmo caminho.
       */}
      {/* De 1200 a 1599 px: só o histórico (a conversa abre por cima); ele fica parado. */}
      <Presence show={hasAside} exitMs={PANEL_EXIT_MS}>
        {hasAside && (
          <AsideSlot width={historyWidth} className="hidden lg:block xl:hidden">
            <HistoryPanel className="flex" wide={wide} />
          </AsideSlot>
        )}
      </Presence>
      {/* A partir de 1600 px: histórico ou conversa; um sai deslizando enquanto o outro entra. */}
      <Presence show={hasAside && !docked} exitMs={PANEL_EXIT_MS}>
        {hasAside && !docked && (
          <AsideSlot width={historyWidth} className="hidden xl:block">
            <HistoryPanel className="flex" wide={wide} />
          </AsideSlot>
        )}
      </Presence>
      <Presence show={docked} exitMs={PANEL_EXIT_MS}>
        {docked && (
          <AsideSlot width={CHAT_WIDTH} className="hidden xl:block">
            <ChatPanel className="flex" />
          </AsideSlot>
        )}
      </Presence>
      {/* O chat por cima entra deslizando da direita e, ao fechar, sai pelo mesmo caminho. */}
      <Presence show={chatAvailable && open === true} exitMs={PANEL_EXIT_MS}>
        {chatAvailable && open === true && (
          <ChatOverlay className={hasAside ? "xl:hidden" : undefined} />
        )}
      </Presence>
      {/* O chat abre pelo atalho da borda direita (o mesmo do Início) em todas as telas. */}
      <Presence show={config.aside !== false && historyHidden} exitMs={PANEL_EXIT_MS}>
        {config.aside !== false && historyHidden && (
          <HistoryHandle restore className="hidden lg:flex" />
        )}
      </Presence>
      {config.fab && !(chatAvailable && open === true) && (
        <HistoryHandle className={cn("hidden md:flex", config.aside !== false && "lg:hidden")} />
      )}
      {config.mobileFab && (
        <ConversarFabCompact position={config.mobileFab} className="md:hidden" />
      )}
      {config.bottomNav && <BottomNav className="md:hidden" />}
    </>
  );
}

/**
 * Lugar de um painel fixo à direita: a largura anima de 0 até `width` (e volta ao fechar), então a
 * página ao lado se ajusta aos poucos; o painel, com a largura final desde o início, desliza.
 */
function AsideSlot({
  width,
  className,
  children,
}: {
  width: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-motion="aside"
      className={cn("sticky top-0 h-dvh shrink-0 overflow-hidden", width, className)}
    >
      <div className={cn("h-full", width)}>{children}</div>
    </div>
  );
}
