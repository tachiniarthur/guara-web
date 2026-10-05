import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  id?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Link ou metadado alinhado à direita. */
  aside?: ReactNode;
  className?: string;
};

/** Título de seção da página (ex.: "Resumo de setembro · Como está o seu mês"). */
export function SectionHeader({ id, title, subtitle, aside, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1", className)}>
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-0.5">
        <h2
          id={id}
          className="m-0 font-display text-22 font-extrabold tracking-[-0.01em] @tab:text-26"
        >
          {title}
        </h2>
        {subtitle && <span className="text-15 text-caption">{subtitle}</span>}
      </div>
      {aside}
    </div>
  );
}
