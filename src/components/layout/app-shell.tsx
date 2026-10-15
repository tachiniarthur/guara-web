"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

import { ReportChatAside } from "@/features/relatorio/components/report-chat-aside";
import { ErrorToast, OfflineToast } from "@/components/states/status-toast";
import { shellConfig } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";
import { usePrivacy } from "@/stores/privacy";

import { BottomNav } from "./bottom-nav";
import { ChatOverlay, ChatPanel } from "./chat-panel";
import { ConversarFab, ConversarFabCompact } from "./conversar-fab";
import { HistoryPanel } from "./history-panel";
import { Rail } from "./rail";
import { Sidebar } from "./sidebar";
import { ValuesMask } from "./values-mask";

/**
 * Estrutura do app pelas classes de janela:
 * compacto (< 600): barra inferior · médio (600–1199): trilho + "Conversar" flutuante ·
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
  const hasAside = config.aside !== false;
  // As páginas de conversa já são o chat em tela cheia.
  const chatAvailable = !pathname.startsWith("/conversas");
  // Conversa fixa à direita: aberta pelo usuário ou, no Início, aberta por padrão.
  const docked = hasAside && (open === true || (open === null && config.aside === "home"));

  return (
    <>
      {config.tabletChat && !(chatAvailable && open === true) && (
        <ReportChatAside className="hidden min-[68.75rem]:flex lg:hidden" />
      )}
      {hasAside &&
        (docked ? (
          <>
            <ChatPanel className="hidden xl:flex" />
            <HistoryPanel className="hidden lg:flex xl:hidden" />
          </>
        ) : (
          <HistoryPanel className="hidden lg:flex" wide={config.aside === "home"} />
        ))}
      {chatAvailable && open === true && (
        <ChatOverlay className={hasAside ? "xl:hidden" : undefined} />
      )}
      {config.fab && !(chatAvailable && open === true) && (
        <ConversarFab className={cn("hidden md:flex", hasAside && "lg:hidden")} />
      )}
      {config.mobileFab && (
        <ConversarFabCompact position={config.mobileFab} className="md:hidden" />
      )}
      {config.bottomNav && <BottomNav className="md:hidden" />}
    </>
  );
}
