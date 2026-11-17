"use client";

import { barWidth } from "@/lib/bar-width";
import { formatCurrency } from "@/lib/format";
import { labelsOfMonth } from "@/lib/live-format";
import { cn } from "@/lib/utils";

import type { ProjectedMonth } from "../api";

/**
 * Meses futuros em barras horizontais (gastos fixos previstos): o mês, a barra proporcional ao
 * maior e o valor. Com `onSelect`, cada linha abre o mês (botão); o escolhido fica destacado.
 */
export function ProjectionBars({
  months,
  selected,
  onSelect,
  className,
}: {
  months: readonly ProjectedMonth[];
  selected?: string;
  onSelect?: (month: string) => void;
  className?: string;
}) {
  const max = Math.max(1, ...months.map((m) => m.totalCents));
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-1 p-0", className)}>
      {months.map((m) => {
        const { short } = labelsOfMonth(m.month);
        const active = m.month === selected;
        const body = (
          <>
            <span className={cn("w-16 shrink-0 text-14", active ? "font-bold" : "text-mist")}>
              {short}
            </span>
            <span className="relative h-2.5 grow overflow-hidden rounded-full bg-field">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  active ? "bg-tucano" : "bg-[#E0935A]",
                )}
                style={{ width: barWidth((m.totalCents / max) * 100) }}
              />
            </span>
            <span className="w-28 shrink-0 text-right text-14 font-bold tabular-nums">
              {formatCurrency(m.totalCents)}
            </span>
          </>
        );
        return (
          <li key={m.month}>
            {onSelect ? (
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                aria-label={`${labelsOfMonth(m.month).long}: ${formatCurrency(m.totalCents)} previstos. Ver o mês`}
                onClick={() => onSelect(m.month)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-full border-none bg-transparent px-2 text-left text-sand hover:bg-shade focus-visible:bg-shade",
                  active && "bg-shade",
                )}
              >
                {body}
              </button>
            ) : (
              <div className="flex min-h-11 items-center gap-3 px-2">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
