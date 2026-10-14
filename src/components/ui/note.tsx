import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./icon";

/**
 * Observação curta com ícone amarelo-tucano à esquerda.
 * "plain": texto de apoio solto · "warning": bloco tingido de atenção · "info": bloco rebaixado.
 */
export function Note({
  icon,
  iconStrokeWidth,
  tone = "plain",
  iconClassName,
  className,
  children,
}: {
  icon: IconName;
  iconStrokeWidth?: number;
  tone?: "plain" | "warning" | "info";
  /** Cor do ícone (amarelo-tucano por padrão). */
  iconClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "m-0 flex gap-2 text-13 leading-normal",
        tone === "warning"
          ? "rounded-[0.875rem] bg-tucano-bg px-3.5 py-3 text-sand"
          : tone === "info"
            ? "gap-2.5 rounded-[0.875rem] bg-shade px-3.5 py-3 text-sand"
            : "text-mist",
        className,
      )}
    >
      <span className={cn("mt-px", tone === "info" ? "text-mist" : "text-tucano", iconClassName)}>
        <Icon name={icon} size={16} strokeWidth={iconStrokeWidth} />
      </span>
      <span>{children}</span>
    </p>
  );
}
