import { ListRow, RowList } from "@/components/ui/list-row";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";

import type { TimelineDay } from "../data";

/** Dias da linha do tempo sobre um trilho, com o saldo no fim de cada dia. */
export function TimelineDays({ days }: { days: TimelineDay[] }) {
  return (
    <ol className="m-0 ml-1.5 flex list-none flex-col border-l-2 border-line p-0 pl-5.5">
      {days.map((day) => (
        <li key={day.dia} className="relative flex flex-col gap-0.5 pb-3.5">
          <div className="relative flex items-baseline justify-between gap-2">
            <span
              aria-hidden="true"
              className="absolute top-1 -left-[1.4375rem] size-3 rounded-full border-2 border-tucano bg-canvas"
            />
            <h3 className="m-0 text-13 font-extrabold tracking-[.06em] uppercase">{day.dia}</h3>
            <span className="text-12 whitespace-nowrap text-caption">
              {"saldo no fim do dia "}
              <strong className="text-mist tabular-nums">{day.saldo}</strong>
            </span>
          </div>
          <RowList>
            {day.itens.map((item) => (
              <ListRow
                key={item.titulo}
                href="/gastos/lancamentos"
                title={item.titulo}
                meta={item.meta}
                extra={
                  item.foraDoPadrao && (
                    <Tag tone="urucum" status>
                      <Icon name="alert-triangle" size={14} strokeWidth={2} />
                      Fora do padrão
                    </Tag>
                  )
                }
                value={item.valor}
                valueClassName={
                  item.foraDoPadrao
                    ? "text-urucum"
                    : item.valor.startsWith("+")
                      ? "text-folha"
                      : undefined
                }
              />
            ))}
          </RowList>
        </li>
      ))}
    </ol>
  );
}
