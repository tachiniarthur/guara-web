import { ProgressBar, tetoTone, toneText } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

import type { CategoryBudget } from "../data";

/** Lista "gasto de teto" por categoria. Em linha a partir do tablet; empilhada no mobile. */
export function CategoryBudgetList({ items }: { items: CategoryBudget[] }) {
  return (
    <ul
      aria-label="Gasto do mês contra o teto de cada categoria"
      className="m-0 flex list-none flex-col gap-1 p-0"
    >
      {items.map((item) => {
        const tone = tetoTone(item.percentual);
        return (
          <li
            key={item.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 py-1.5 @tab:min-h-10.5 @tab:grid-cols-[7.25rem_1fr_12.5rem] @tab:gap-4 @tab:py-0 @desk:grid-cols-[8.125rem_1fr_15.625rem]"
          >
            <strong className="text-15">{item.nome}</strong>
            <div className="col-span-full row-start-2 @tab:col-span-1 @tab:row-start-auto">
              <ProgressBar
                value={item.percentual}
                tone={tone}
                height={10}
                className="@tab:hidden"
              />
              <ProgressBar
                value={item.percentual}
                tone={tone}
                height={14}
                className="hidden @tab:block"
              />
            </div>
            <span className="flex items-center justify-end gap-2 text-14 tabular-nums">
              <span className="whitespace-nowrap text-mist">
                <strong className="text-sand">{item.gasto}</strong> de {item.teto}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-13 items-center justify-end gap-1 font-extrabold",
                  toneText[tone],
                )}
              >
                {item.percentual}%
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
