import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import type { LedgerEntry } from "../data";

/** Selo "Fora do padrão" (compra que o Quero-quero quer confirmar). */
export function OffPatternBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-urucum-bg px-2 text-12 font-bold tracking-[.04em] whitespace-nowrap text-urucum">
      <Icon name="eye" size={14} strokeWidth={2} />
      Fora do padrão
    </span>
  );
}

/** Extrato de lançamentos. `short` usa o detalhe curto (mobile). */
export function LedgerList({ items, short = false }: { items: LedgerEntry[]; short?: boolean }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 border-b border-line py-3">
          <span className="flex min-w-0 grow flex-col leading-[1.35]">
            <span className="font-medium">{item.descricao}</span>
            <span className="text-12 text-caption">{short ? item.detalheCurto : item.detalhe}</span>
            {item.foraDoPadrao && (
              <span className="mt-1 flex">
                <OffPatternBadge />
              </span>
            )}
          </span>
          <span
            className={cn(
              "font-bold whitespace-nowrap tabular-nums",
              item.foraDoPadrao
                ? "text-urucum"
                : item.tipo === "entrada"
                  ? "text-arara"
                  : "text-sand",
            )}
          >
            {item.valor}
          </span>
        </li>
      ))}
    </ul>
  );
}
