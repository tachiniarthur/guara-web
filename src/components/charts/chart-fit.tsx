import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Escolhe a variante do gráfico pela largura que ele ganha de verdade, não pela largura da tela:
 * no desktop, um gráfico numa coluna estreita usaria a variante larga e os textos encolheriam
 * para 4–6px. Estreito abaixo de 480px, médio até 800px, largo daí para cima (`medium` ausente:
 * vale o largo).
 */
export function ChartFit({
  narrow,
  medium,
  wide,
  className,
}: {
  narrow: ReactNode;
  medium?: ReactNode;
  wide: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("@container w-full", className)}>
      <div className="@min-[480px]:hidden">{narrow}</div>
      {medium ? (
        <>
          <div className="hidden @min-[480px]:block @min-[800px]:hidden">{medium}</div>
          <div className="hidden @min-[800px]:block">{wide}</div>
        </>
      ) : (
        <div className="hidden @min-[480px]:block">{wide}</div>
      )}
    </div>
  );
}
