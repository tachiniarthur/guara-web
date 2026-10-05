import type { ReactNode } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { agents, type AgentId } from "@/features/assistentes/data";
import { cn } from "@/lib/utils";

/** Marcador de data/assunto no meio da conversa. */
export function ChatDateChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mx-auto my-0 rounded-full bg-shade px-3.5 py-1 text-13 text-caption",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Mensagem do usuário: bolha amarela à direita. */
export function UserBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex justify-end">
      <p
        className={cn(
          "m-0 max-w-[20.625rem] rounded-[1.25rem_1.25rem_0.375rem_1.25rem] bg-tucano px-4 py-3 text-16 leading-normal font-medium text-canvas",
          className,
        )}
      >
        {children}
      </p>
    </div>
  );
}

type AgentMessageProps = {
  agent: AgentId;
  /** Texto ao lado do nome (ex.: "gastos"). */
  tag?: string;
  /** Destaca a etiqueta em urucum (ex.: "entrou na conversa"). */
  tagTone?: "caption" | "urucum";
  avatarSize?: number;
  children: ReactNode;
  className?: string;
};

/** Mensagem de um bicho da turma: retrato, nome e bolha. */
export function AgentMessage({
  agent,
  tag,
  tagTone = "caption",
  avatarSize = 48,
  children,
  className,
}: AgentMessageProps) {
  return (
    <article className={cn("flex items-start gap-3", className)}>
      <AgentAvatar agent={agent} size={avatarSize} />
      <div className="flex min-w-0 grow flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <strong className="text-15">{agents[agent].nome}</strong>
          {tag && (
            <span
              className={
                tagTone === "urucum" ? "text-12 font-bold text-urucum" : "text-13 text-caption"
              }
            >
              {tag}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2.5 rounded-[0.375rem_1.25rem_1.25rem_1.25rem] bg-shade px-4 py-3.5">
          {children}
        </div>
      </div>
    </article>
  );
}

/** Parágrafo dentro da bolha de um bicho. */
export function MessageText({ children }: { children: ReactNode }) {
  return <p className="m-0 text-16 leading-[1.55]">{children}</p>;
}
