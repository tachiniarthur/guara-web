import { cn } from "@/lib/utils";

import type { Transaction } from "../data";

/** Lançamentos com inicial em círculo; compras fora do padrão em urucum, entradas em verde. */
export function TransactionList({ items }: { items: Transaction[] }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex min-h-[3.0625rem] items-center gap-3 border-b border-line"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-display text-14 font-extrabold",
              item.foraDoPadrao
                ? "border-urucum bg-urucum-bg"
                : item.tipo === "entrada"
                  ? "border-folha bg-shade"
                  : "border-line-strong bg-shade",
            )}
          >
            {item.descricao.charAt(0)}
          </span>
          <span className="flex min-w-0 grow flex-col leading-[1.3]">
            <span className="text-15 font-semibold">{item.descricao}</span>
            <span
              className={
                item.foraDoPadrao ? "text-12 font-bold text-urucum" : "text-12 text-caption"
              }
            >
              {item.detalhe}
            </span>
          </span>
          <strong
            className={cn(
              "text-15 tabular-nums",
              item.foraDoPadrao
                ? "text-urucum"
                : item.tipo === "entrada"
                  ? "text-folha"
                  : "text-sand",
            )}
          >
            {item.valor}
          </strong>
        </li>
      ))}
    </ul>
  );
}
