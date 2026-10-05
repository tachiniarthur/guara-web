"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { shellConfig } from "@/lib/navigation";
import { useChatPanel } from "@/stores/chat-panel";

import { BottomNav } from "./bottom-nav";
import { ChatOverlay, ChatPanel } from "./chat-panel";
import { ConversarFab } from "./conversar-fab";
import { HistoryPanel } from "./history-panel";
import { Rail } from "./rail";
import { Sidebar } from "./sidebar";

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
  const config = shellConfig(pathname);
  const open = useChatPanel((state) => state.open);
  const hasAside = config.aside !== false;
  // As páginas de conversa já são o chat em tela cheia.
  const chatAvailable = !pathname.startsWith("/conversas");
  // Conversa fixa à direita: aberta pelo usuário ou, no Início, aberta por padrão.
  const docked = hasAside && (open === true || (open === null && config.aside === "home"));

  return (
    <div className="flex min-h-dvh">
      <Sidebar className="hidden lg:flex" />
      <Rail className="hidden md:flex lg:hidden" />
      <main className="@container min-w-0 flex-1">{children}</main>
      {hasAside &&
        (docked ? (
          <>
            <ChatPanel className="hidden xl:flex" />
            <HistoryPanel className="hidden lg:flex xl:hidden" />
          </>
        ) : (
          <HistoryPanel className="hidden lg:flex" />
        ))}
      {chatAvailable && open === true && (
        <ChatOverlay className={hasAside ? "xl:hidden" : undefined} />
      )}
      {config.fab && <ConversarFab className="hidden md:flex lg:hidden" />}
      {config.bottomNav && <BottomNav className="md:hidden" />}
    </div>
  );
}
