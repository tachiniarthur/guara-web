"use client";

import { Icon } from "@/components/ui/icon";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

/** Botão redondo de conversa do mobile, nas telas sem barra inferior. */
export function ConversarFabCompact({
  position,
  className,
}: {
  position: "bar" | "corner";
  className?: string;
}) {
  return (
    <OpenChat
      aria-label="Abrir o chat"
      className={cn(
        "fixed right-4 z-20 flex size-14 items-center justify-center rounded-bubble border-none bg-tucano text-canvas shadow-[0_1px_2px_rgba(0,0,0,.4),0_8px_24px_rgba(0,0,0,.25)]",
        position === "bar" ? "bottom-27" : "bottom-6",
        className,
      )}
    >
      <Icon name="chat" size={24} />
    </OpenChat>
  );
}
