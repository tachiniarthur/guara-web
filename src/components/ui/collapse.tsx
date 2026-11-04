"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Expande e recolhe deslizando (altura de 0 até a do conteúdo, com esmaecer). Abrir monta o
 * conteúdo; recolhido, ele sai da tela no fim da transição (fora da ordem de foco já durante).
 */
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  /** Classes do conteúdo (ex.: o respiro acima dele, que recolhe junto). */
  className?: string;
}) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  if (!mounted) return null;
  return (
    <div
      inert={!open}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !open) setMounted(false);
      }}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-(--duration-slide) ease-drawer starting:grid-rows-[0fr] starting:opacity-0",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}
