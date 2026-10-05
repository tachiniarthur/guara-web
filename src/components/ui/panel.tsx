import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Painel das telas de detalhe (Gastos, Assinaturas, Alertas...): raio 24 e respiro de 20px. */
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3.5 rounded-card border border-line bg-card p-5 text-sand",
        className,
      )}
      {...props}
    />
  );
}

type PanelHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Nível do título (h2 por padrão). */
  as?: "h2" | "h3";
  className?: string;
  titleClassName?: string;
};

export function PanelHeader({
  title,
  subtitle,
  action,
  as: Heading = "h2",
  className,
  titleClassName,
}: PanelHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Heading
          className={cn(
            "m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]",
            titleClassName,
          )}
        >
          {title}
        </Heading>
        {subtitle && <p className="m-0 text-13 text-caption">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Link sublinhado curto (offset 3px) usado no canto dos painéis ("Ver todas", "Ver 118"). */
export const panelLinkClass =
  "inline-flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3 hover:text-tucano";
