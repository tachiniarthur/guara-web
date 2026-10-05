import type { ReactNode } from "react";

import type { AgentId } from "@/features/assistentes/data";
import { cn } from "@/lib/utils";

import { AgentAvatar } from "./agent-avatar";

/** Dica de um bicho da turma em bloco rebaixado: retrato pequeno, texto e ação opcional. */
export function AgentTip({
  agent,
  children,
  action,
  className,
}: {
  agent: AgentId;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-bubble bg-shade p-4", className)}>
      <AgentAvatar agent={agent} size={32} variant="ring" />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="m-0 text-14 leading-[1.55]">{children}</p>
        {action && <div className="flex">{action}</div>}
      </div>
    </div>
  );
}
