import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Card padrão: folha escura com borda de musgo. Compacto no mobile, mais respiro a partir do tablet. */
export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col gap-4.5 overflow-hidden rounded-card border border-line bg-card p-4.5 text-sand @tab:rounded-[1.75rem] @tab:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "m-0 font-display text-19 leading-[1.2] font-bold tracking-[-0.01em] @tab:text-22",
        className,
      )}
      {...props}
    />
  );
}

/** Cabeçalho de card: título à esquerda, ação (link, contador, filtro) à direita. */
export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {typeof title === "string" ? <CardTitle>{title}</CardTitle> : title}
      </div>
      {action}
    </div>
  );
}
