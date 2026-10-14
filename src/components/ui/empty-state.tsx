import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./icon";

/**
 * Estado vazio: diz por que está vazio e oferece o próximo passo. No desktop ("large") ocupa o
 * card inteiro, com ícone, título e texto maiores.
 */
export function EmptyState({
  icon,
  title,
  children,
  actions,
  large,
  className,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  large?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col justify-center gap-3.5 rounded-card border border-line bg-card p-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center text-center",
          large ? "gap-4.5 px-8 py-10" : "gap-3 px-4 py-7",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-full bg-shade text-mist",
            large ? "size-24" : "size-16",
          )}
        >
          <Icon name={icon} size={large ? 40 : 28} />
        </span>
        <strong
          className={cn(
            "font-display",
            large ? "text-30 leading-[1.2] font-extrabold" : "text-20 font-bold",
          )}
        >
          {title}
        </strong>
        <p
          className={cn(
            "m-0 text-mist",
            large ? "max-w-[38.75rem] text-18 leading-[1.6]" : "max-w-80 text-14 leading-[1.55]",
          )}
        >
          {children}
        </p>
        {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}

/**
 * Tela vazia com guia: o estado vazio e, ao lado (desktop) ou embaixo, a dica do bicho e o
 * "como funciona". No desktop ocupa a altura toda (use com `Page fill`).
 */
export function EmptyStateLayout({
  icon,
  title,
  message,
  action,
  side,
}: {
  icon: IconName;
  title: string;
  message: string;
  action: ReactNode;
  side: ReactNode;
}) {
  return (
    <>
      <div className="contents @desk:hidden">
        <EmptyState icon={icon} title={title} actions={action}>
          {message}
        </EmptyState>
        {side}
      </div>
      <div className="hidden grow grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
        <EmptyState icon={icon} title={title} actions={action} large>
          {message}
        </EmptyState>
        <div className="flex min-w-0 flex-col gap-4">{side}</div>
      </div>
    </>
  );
}
