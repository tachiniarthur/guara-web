"use client";

import type { ComponentProps } from "react";

import { useActiveIndicator } from "@/hooks/use-active-indicator";
import { cn } from "@/lib/utils";

/**
 * Grupo de opções (botões com `aria-pressed`) cujo fundo da opção marcada desliza até a nova, em
 * vez de pular. O fundo da opção vem em `indicatorClassName` (ex.: `bg-sand`); enquanto o
 * indicador não mede a opção, ela mostra o próprio fundo (globals.css, `data-indicator-ready`).
 */
export function SlidingGroup({
  active,
  indicatorClassName,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  /** O valor marcado: mudou, o indicador mede de novo e desliza. */
  active: unknown;
  indicatorClassName: string;
}) {
  const { ref, ready, style } = useActiveIndicator(active);
  return (
    <div
      ref={ref}
      role="group"
      data-indicator-ready={ready || undefined}
      className={cn("relative isolate", className)}
      {...props}
    >
      {ready && (
        <span
          aria-hidden="true"
          style={style}
          className={cn(
            "absolute inset-y-1 left-0 -z-10 rounded-full transition-[transform,width] duration-(--duration-move) ease-in-out-soft",
            indicatorClassName,
          )}
        />
      )}
      {children}
    </div>
  );
}
