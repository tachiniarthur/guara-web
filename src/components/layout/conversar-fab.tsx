"use client";

import { Icon } from "@/components/ui/icon";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

/** Botão flutuante "Conversar" das janelas médias: abre a conversa por cima da tela. */
export function ConversarFab({ className }: { className?: string }) {
  return (
    <OpenChat
      className={cn(
        "fixed right-7 bottom-7 z-20 flex h-14 items-center gap-2.5 rounded-3xl border-none bg-tucano pr-5.5 pl-4.5 text-16 font-bold text-canvas no-underline shadow-[0_1px_2px_rgba(0,0,0,.4),0_8px_24px_rgba(0,0,0,.25)]",
        className,
      )}
    >
      <Icon name="chat" size={22} />
      Conversar
    </OpenChat>
  );
}
