import Link from "next/link";
import { Donut } from "@/components/charts/donut";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { categorySpending, otherSpending, totalSaidas } from "../data";

const segments = [
  ...categorySpending.map((c) => ({ value: c.valor, color: c.cor })),
  { value: otherSpending.valor, color: otherSpending.cor },
];

function DonutCenter() {
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
  const mobile = variant === "mobile";

  const list = (
    <ul className={cn("m-0 min-w-0 list-none p-0", !mobile && "grow")}>
      {categorySpending.map((c) => (
        <li key={c.id}>
          <Link
            href={`/gastos/categorias/${c.id}`}
            className={cn(
              "flex items-center gap-3 border-b border-line text-sand no-underline",
              mobile ? "min-h-[3.5625rem]" : "min-h-[3.3125rem]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("w-2.5 shrink-0 rounded-[3px]", mobile ? "h-7" : "h-6.5")}
              style={{ background: c.cor }}
            />
            <span className="flex min-w-0 grow flex-col leading-[1.3]">
              <span className="font-bold">{c.nome}</span>
              <span className="text-12 text-caption">
                {`${c.lancamentos} ${c.lancamentos === 1 ? "lançamento" : "lançamentos"}${
                  mobile ? "" : ` · ${c.percentual}%`
                }`}
              </span>
            </span>
            <span className="font-bold tabular-nums">{c.valorFormatado}</span>
            <Icon name="chevron-right" size={18} className="text-caption" />
          </Link>
        </li>
      ))}
    </ul>
  );

  if (mobile) {
    return (
      <>
        <div className="flex justify-center">
          <Donut segments={segments} size={180}>
            <DonutCenter />
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
          <DonutCenter />
        </Donut>
        {list}
      </div>
    );
  }

  return (
    <div className="grid grow grid-cols-[auto_minmax(0,1fr)] items-center gap-10">
      <div className="flex items-center justify-center">
        <Donut segments={segments} size={240}>
          <DonutCenter />
        </Donut>
      </div>
      {list}
    </div>
  );
}
