import { ErrorBlock, StateSwap, TileErrorBlock } from "@/components/states/state-block";
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
  failed,
  className = "gap-4 @tab:gap-3.5",
}: {
  day: TransactionDay;
  /** Erro ao carregar: a lista do dia vira o aviso (grande nos dias com mais lançamentos). */
  failed?: boolean;
  /** Mostra a categoria na meta (a lista por categoria não repete). */
  withCategory?: boolean;
  /** Respiro entre o título do dia e a lista. */
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      {/* No carregamento, o título do dia fica visível no celular (fora de card); no tablet e
          no desktop ele está dentro do card, que mostra só o círculo de carregamento. */}
      <DayTitle day={day} className="@tab:hidden" skip />
      <DayTitle day={day} className="hidden @tab:flex" />
      <StateSwap
        replacement={failed && (day.itens.length >= 4 ? <ErrorBlock /> : <TileErrorBlock />)}
      >
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
      </StateSwap>
    </div>
  );
}

function DayTitle({
  day,
  skip,
  className,
}: {
  day: TransactionDay;
  skip?: boolean;
  className?: string;
}) {
  return (
    <div
      data-skeleton-skip={skip ? "" : undefined}
      className={cn("mt-3.5 flex items-baseline justify-between", className)}
    >
      <h3 className="m-0 text-12 font-bold tracking-[.08em] text-caption uppercase">
        {day.titulo}
      </h3>
      <span className="text-12 font-bold text-caption tabular-nums">{day.total}</span>
    </div>
  );
}

/** Dias em sequência (celular e tablet) ou em duas colunas (desktop). */
export function TransactionDays({
  days,
  withCategory,
  columns,
  failed,
}: {
  days: TransactionDay[];
  withCategory?: boolean;
  columns?: boolean;
  failed?: boolean;
}) {
  if (!columns) {
    return (
      <>
        {days.map((d) => (
          <TransactionDayGroup key={d.id} day={d} withCategory={withCategory} failed={failed} />
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
            <TransactionDayGroup
              key={d.id}
              day={d}
              withCategory={withCategory}
              failed={failed}
              className="gap-0"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
