import { cn } from "@/lib/utils";

import type { Subscription } from "../data";

/** Mês em grade de 7 colunas com os dias de cobrança destacados. */
export function BillingCalendar({
  items,
  days = 31,
  month = "outubro",
}: {
  items: Subscription[];
  days?: number;
  month?: string;
}) {
  const byDay = new Map(items.map((item) => [item.dia, item.nome]));
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
        const name = byDay.get(day);
        return (
          <span
            key={day}
            aria-hidden={name ? undefined : true}
            aria-label={name ? `${day} de ${month}: ${name}` : undefined}
            className={cn(
              "flex h-7.5 items-center justify-center rounded-lg text-12",
              name ? "bg-sand font-bold text-canvas" : "text-caption",
            )}
          >
            {day}
          </span>
        );
      })}
    </div>
  );
}
