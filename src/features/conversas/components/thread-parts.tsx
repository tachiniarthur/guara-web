import type { ReactNode } from "react";

import { GuaraAvatar } from "@/components/ui/guara-avatar";
import { chipClass } from "@/components/ui/chip";
import { guara } from "@/features/guara/identity";
import { cn } from "@/lib/utils";

import { UserBubble } from "./messages";

/** Pergunta do usuário na tela de conversa (bolha amarela compacta). */
export function UserQuestion({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <UserBubble className={cn("max-w-[21.75rem] px-3.5 py-2.5 text-15", className)}>
      {children}
    </UserBubble>
  );
}

/** Resposta do Guará sem bolha: retrato pequeno, nome e assunto, e o conteúdo logo abaixo. */
export function GuaraReply({
  role,
  children,
  className,
}: {
  /** Assunto ao lado do nome (ex.: "Gastos"). */
  role?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("flex animate-fade-up flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2">
        <GuaraAvatar size={28} variant="ring" />
        <span className="text-14 font-bold">{guara.nome}</span>
        {role && <span className="text-12 text-caption">{`· ${role}`}</span>}
      </div>
      {children}
    </article>
  );
}

export function ReplyText({
  children,
  size = "md",
}: {
  children: ReactNode;
  /** "adaptive": 15 no celular e 16 a partir do tablet (e na gaveta de chat do tablet). */
  size?: "sm" | "md" | "adaptive";
}) {
  return (
    <p
      className={cn(
        "m-0",
        size === "md"
          ? "text-16 leading-[1.6]"
          : size === "adaptive"
            ? "text-15 leading-[1.6] max-lg:@chat:text-16"
            : "text-15 leading-[1.65]",
      )}
    >
      {children}
    </p>
  );
}

/** Sugestões de próxima pergunta dentro da conversa. */
export function ReplySuggestions({ items }: { items: string[] }) {
  return (
    <div role="group" aria-label="Sugestões" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button key={item} type="button" className={chipClass(false)}>
          {item}
        </button>
      ))}
    </div>
  );
}
