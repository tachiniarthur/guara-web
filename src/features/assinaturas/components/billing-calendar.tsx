import { cn } from "@/lib/utils";

/** Mês em grade de 7 colunas com os dias de cobrança destacados (mais de uma no dia: juntas). */
export function BillingCalendar({
  items,
  days = 31,
  month = "outubro",
}: {
  items: readonly { dia: number; nome: string }[];
  days?: number;
  month?: string;
}) {
  const byDay = new Map<number, string[]>();
  for (const item of items) byDay.set(item.dia, [...(byDay.get(item.dia) ?? []), item.nome]);
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
        const names = byDay.get(day);
        return (
          <span
            key={day}
            aria-hidden={names ? undefined : true}
            aria-label={names ? `${day} de ${month}: ${names.join(", ")}` : undefined}
            className={cn(
              "flex h-7.5 items-center justify-center rounded-lg text-12",
              names ? "bg-sand font-bold text-canvas" : "text-caption",
            )}
          >
            {day}
          </span>
        );
      })}
    </div>
  );
}
