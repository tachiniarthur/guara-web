import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  tucano: "bg-tucano-bg text-tucano",
  urucum: "bg-urucum-bg text-urucum",
  folha: "bg-folha-bg text-folha",
  neutral: "bg-shade text-mist",
  arara: "bg-arara-bg text-arara",
} as const;

/** Etiqueta curta em pílula (24px), com tom de alerta, atenção ou ganho. */
export function Tag({
  tone,
  children,
  status,
  className,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  /** Etiqueta de status por extenso ("Fora do padrão"): respiro de 10px, sem espaçamento extra. */
  status?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full text-12 font-bold whitespace-nowrap",
        status ? "px-2.5" : "px-2 tracking-[.04em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
