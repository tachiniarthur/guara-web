import { cn } from "@/lib/utils";

export type LegendItem = { label: string; color: string; dashed?: boolean };

/** Legenda dos gráficos: traço cheio (série) ou tracejado (referência). */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-12 text-mist", className)}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("w-4", item.dashed ? "border-t-2 border-dashed" : "h-[3px] rounded-xs")}
            style={item.dashed ? { borderColor: item.color } : { background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
