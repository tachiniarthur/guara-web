import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  tucano: "bg-tucano-bg text-tucano",
  urucum: "bg-urucum-bg text-urucum",
  folha: "bg-folha-bg text-folha",
  neutral: "bg-shade text-mist",
} as const;

/** Etiqueta curta em pílula (24px), com tom de alerta, atenção ou ganho. */
export function Tag({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-12 font-bold tracking-[.04em] whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
