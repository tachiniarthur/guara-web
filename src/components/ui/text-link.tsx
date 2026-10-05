import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "./icon";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Mostra a seta "›" depois do texto (padrão: sim). */
  chevron?: boolean;
};

/** Link sublinhado com seta, usado em "Ver gastos", "Relatório completo" etc. */
export function TextLink({ chevron = true, className, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-8 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-4 hover:text-tucano",
        className,
      )}
      {...props}
    >
      {children}
      {chevron && <Icon name="chevron-right" size={16} />}
    </Link>
  );
}
