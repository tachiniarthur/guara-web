import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Estatística em bloco (fundo Campo, raio 16): rótulo, número em Fraunces e apoio opcional. */
export function StatTile({
  label,
  value,
  hint,
  valueClassName = "text-17",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Corpo e cor do número (17px por padrão). */
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 rounded-tile bg-field px-4 py-3.5", className)}>
      <span className="text-13 text-caption">{label}</span>
      <span className={cn("font-display font-bold tabular-nums", valueClassName)}>{value}</span>
      {hint && <span className="text-12 text-mist">{hint}</span>}
    </div>
  );
}
