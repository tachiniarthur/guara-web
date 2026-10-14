import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { transactionMeta, type TransactionDay } from "../lancamentos";

/** Etiqueta "Fora do padrão" (urucum). */
export function OffPatternTag() {
  return (
    <Tag tone="urucum" status>
      <Icon name="alert-triangle" size={14} strokeWidth={2} />
      Fora do padrão
    </Tag>
  );
}

/** Um dia da lista de lançamentos: título em caixa-alta com o total e as linhas. */
export function TransactionDayGroup({
  day,
  withCategory = true,
  className = "gap-4 @tab:gap-3.5",
}: {
  day: TransactionDay;
  /** Mostra a categoria na meta (a lista por categoria não repete). */
  withCategory?: boolean;
  /** Respiro entre o título do dia e a lista. */
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="mt-3.5 flex items-baseline justify-between">
        <h3 className="m-0 text-12 font-bold tracking-[.08em] text-caption uppercase">
          {day.titulo}
        </h3>
        <span className="text-12 font-bold text-caption tabular-nums">{day.total}</span>
      </div>
      <RowList>
        {day.itens.map((item) => (
          <ListRow
            key={item.id}
            href={`/gastos/lancamentos/${item.id}`}
            title={item.descricao}
            meta={transactionMeta(item, withCategory)}
            extra={item.foraDoPadrao ? <OffPatternTag /> : undefined}
            value={item.valor}
            valueClassName={cn(
              item.foraDoPadrao
                ? "text-urucum"
                : item.tipo === "entrada"
                  ? "text-folha"
                  : "text-sand",
            )}
          />
        ))}
      </RowList>
    </div>
  );
}

/** Dias em sequência (celular e tablet) ou em duas colunas (desktop). */
export function TransactionDays({
  days,
  withCategory,
  columns,
}: {
  days: TransactionDay[];
  withCategory?: boolean;
  columns?: boolean;
}) {
  if (!columns) {
    return (
      <>
        {days.map((d) => (
          <TransactionDayGroup key={d.id} day={d} withCategory={withCategory} />
        ))}
      </>
    );
  }
  const half = Math.ceil(days.length / 2);
  return (
    <div className="grid grid-cols-2 items-start gap-10">
      {[days.slice(0, half), days.slice(half)].map((column, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-2">
          {column.map((d) => (
            <TransactionDayGroup key={d.id} day={d} withCategory={withCategory} className="gap-0" />
          ))}
        </div>
      ))}
    </div>
  );
}
