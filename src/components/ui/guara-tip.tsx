import type { ReactNode } from "react";

import { guara } from "@/features/guara/identity";
import { cn } from "@/lib/utils";

import { GuaraAvatar } from "./guara-avatar";

/** Dica do Guará em bloco rebaixado: retrato pequeno, texto e ação opcional. */
export function GuaraTip({
  children,
  action,
  named,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  /** Mostra "Lobo Guará" acima do texto. */
  named?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-bubble bg-shade p-4", className)}>
      <GuaraAvatar size={32} variant="ring" />
      <div className="flex min-w-0 flex-col gap-2">
        {named && <span className="text-12 font-bold text-caption">{guara.nome}</span>}
        <p className="m-0 text-14 leading-[1.55]">{children}</p>
        {action && <div className="flex">{action}</div>}
      </div>
    </div>
  );
}
