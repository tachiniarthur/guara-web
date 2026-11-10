"use client";

import Link from "next/link";
import { Donut } from "@/components/charts/donut";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { useGastosData } from "../context";

function DonutCenter({ totalSaidas }: { totalSaidas: string }) {
  return (
    <>
      <span className="text-12 text-caption">Saídas</span>
      <span className="font-display text-20 font-extrabold tracking-[-0.01em] tabular-nums">
        {totalSaidas}
      </span>
    </>
  );
}

/**
 * Rosca + lista de categorias.
 * "desktop": rosca de 240 ao lado · "tablet": rosca de 160 ao lado · "mobile": rosca de 180 em cima, sem percentual.
 */
export function CategoryBreakdown({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const { categorySpending, otherSpending, totalSaidas } = useGastosData();
  const segments = [
    ...categorySpending.map((c) => ({ value: c.valor, color: c.cor })),
    { value: otherSpending.valor, color: otherSpending.cor },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  /** Participação de "outros" nas saídas, calculada (as categorias da lista vêm prontas). */
  const otherPercent = total > 0 ? Math.round((otherSpending.valor / total) * 100) : 0;
  const mobile = variant === "mobile";

  const desktop = variant === "desktop";
  const rowClass = cn(
    "flex items-center gap-3 border-b border-line text-sand no-underline",
    mobile ? "min-h-[3.5625rem]" : "min-h-[3.3125rem]",
    // Desktop: as linhas dividem a altura do card (que acompanha Lançamentos ao lado).
    desktop && "h-full",
  );

  const list = (
    <ul
      className={cn(
        "m-0 min-w-0 list-none p-0",
        !mobile && "grow",
        desktop && "flex h-full flex-col",
      )}
    >
      {categorySpending.map((c) => (
        <li key={c.id} className={cn(desktop && "flex-1")}>
          <Link href={`/gastos/categorias/${c.id}`} className={rowClass}>
            <span
              aria-hidden="true"
              className={cn("w-2.5 shrink-0 rounded-[3px]", mobile ? "h-7" : "h-6.5")}
              style={{ background: c.cor }}
            />
            <span className="flex min-w-0 grow flex-col leading-[1.3]">
              <span className="truncate font-bold">{c.nome}</span>
              <span className="truncate text-12 text-caption">
                {`${c.lancamentos} ${c.lancamentos === 1 ? "lançamento" : "lançamentos"}${
                  mobile ? "" : ` · ${c.percentual}%`
                }`}
              </span>
            </span>
            <span className="shrink-0 font-bold whitespace-nowrap tabular-nums">
              {c.valorFormatado}
            </span>
            <Icon name="chevron-right" size={18} className="shrink-0 text-caption" />
          </Link>
        </li>
      ))}
      {/* O resto da rosca (cinza): soma das outras categorias, sem página própria. */}
      {otherSpending.valor > 0 && (
        <li className={cn(desktop && "flex-1")}>
          <div className={cn(rowClass, "border-b-0")}>
            <span
              aria-hidden="true"
              className={cn("w-2.5 shrink-0 rounded-[3px]", mobile ? "h-7" : "h-6.5")}
              style={{ background: otherSpending.cor }}
            />
            <span className="flex min-w-0 grow flex-col leading-[1.3]">
              <span className="font-bold">Outros gastos</span>
              <span className="text-12 text-caption">
                {mobile ? "outras categorias" : `outras categorias · ${otherPercent}%`}
              </span>
            </span>
            <span className="shrink-0 font-bold whitespace-nowrap tabular-nums">
              {otherSpending.valorFormatado}
            </span>
            <span aria-hidden="true" className="w-4.5" />
          </div>
        </li>
      )}
    </ul>
  );

  if (mobile) {
    return (
      <>
        <div className="flex justify-center">
          <Donut segments={segments} size={180}>
            <DonutCenter totalSaidas={totalSaidas} />
          </Donut>
        </div>
        {list}
      </>
    );
  }

  if (variant === "tablet") {
    return (
      <div className="flex items-center gap-7">
        <Donut segments={segments} size={160} box={160} radius={69}>
          <DonutCenter totalSaidas={totalSaidas} />
        </Donut>
        {list}
      </div>
    );
  }

  return (
    <div className="grid grow grid-cols-[auto_minmax(0,1fr)] items-stretch gap-10">
      <div className="flex items-center justify-center">
        <Donut segments={segments} size={260} box={180} radius={79}>
          <DonutCenter totalSaidas={totalSaidas} />
        </Donut>
      </div>
      {list}
    </div>
  );
}
