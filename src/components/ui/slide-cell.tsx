import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Célula de uma linha de tabela que abre e recolhe deslizando (accordion em tabelas): o `<tr>` não
 * anima altura, então cada célula recolhe o próprio conteúdo, todas ao mesmo tempo. O respiro
 * (`className`) fica dentro da parte que recolhe; a borda da linha vai no `<tr>` (`slideRowClass`).
 */
export function SlideCell({
  open,
  header,
  colSpan,
  className,
  children,
}: {
  open: boolean;
  /** Primeira célula da linha (`<th scope="row">`). */
  header?: boolean;
  colSpan?: number;
  /** Respiro, alinhamento e texto do conteúdo. */
  className?: string;
  children?: ReactNode;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      scope={header ? "row" : undefined}
      colSpan={colSpan}
      className="p-0 align-middle font-normal"
    >
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-(--duration-slide) ease-drawer",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* Corta só na altura: um texto mais largo que a coluna continua aparecendo, como antes. */}
        <div className="min-h-0 overflow-x-visible overflow-y-clip">
          <div className={className}>{children}</div>
        </div>
      </div>
    </Tag>
  );
}

/** Borda de baixo da linha que recolhe: some junto, sem deixar riscos empilhados. */
export const slideRowClass = (open: boolean, border = "border-line") =>
  cn(
    "border-b transition-[border-color] duration-(--duration-slide) ease-drawer",
    open ? border : "border-transparent",
  );
