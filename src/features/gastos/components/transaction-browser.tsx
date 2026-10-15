"use client";

import { useState, type ReactNode } from "react";

import { FilterEmptyBlock } from "@/components/states/state-block";
import { SearchField } from "@/components/ui/search-field";
import { cn } from "@/lib/utils";

import { transactionDays, type TransactionDay } from "../lancamentos";
import { ALL_BANKS, BankFilter, TransactionMenus } from "./list-filters";
import { TransactionDays } from "./transaction-days";

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function filterDays(days: TransactionDay[], query: string, bank: string) {
  const term = normalize(query.trim());
  return days
    .map((day) => ({
      ...day,
      itens: day.itens.filter(
        (item) =>
          (bank === ALL_BANKS || item.conta.startsWith(bank)) &&
          (!term || normalize(`${item.descricao} ${item.categoria}`).includes(term)),
      ),
    }))
    .filter((day) => day.itens.length > 0);
}

/**
 * Busca, filtro por banco e a lista de lançamentos por dia. A busca e o banco filtram de verdade;
 * `?estado=vazio-filtro` abre com "academia" no Nubank, que não tem nenhum lançamento.
 * `tiles` (totais do mês) e `footer` (carregar mais) somem quando o filtro não acha nada.
 */
export function TransactionBrowser({
  columns,
  filtersOnly,
  preset,
  failed,
  tiles,
  footer,
}: {
  /** Só a busca e os bancos (celular sem nenhum lançamento). */
  filtersOnly?: boolean;
  /** Desktop: busca e filtros numa linha só e os dias em duas colunas. */
  columns?: boolean;
  preset?: boolean;
  failed?: boolean;
  tiles?: ReactNode;
  footer?: ReactNode;
}) {
  const [query, setQuery] = useState(preset ? "academia" : "");
  const [bank, setBank] = useState(preset ? "Nubank" : ALL_BANKS);
  const days = filterDays(transactionDays, query, bank);
  const clear = () => {
    setQuery("");
    setBank(ALL_BANKS);
  };

  const search = (
    <SearchField label="Buscar lançamento" size="list" value={query} onValueChange={setQuery} />
  );
  const empty = (
    <FilterEmptyBlock onClear={clear} className={cn(columns && "grow")}>
      {`Nenhum lançamento com “${query.trim()}”${bank === ALL_BANKS ? "" : ` no ${bank}`} em setembro.`}
    </FilterEmptyBlock>
  );

  if (columns) {
    return (
      <>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          {search}
          <div className="flex items-center justify-end gap-3">
            <BankFilter value={bank} onChange={setBank} className="flex-wrap" />
            <TransactionMenus className="flex-nowrap" />
          </div>
        </div>
        {days.length > 0 ? (
          <>
            <TransactionDays days={days} columns failed={failed} />
            {footer}
          </>
        ) : (
          empty
        )}
      </>
    );
  }

  return (
    <>
      {search}
      <BankFilter value={bank} onChange={setBank} className="-mr-4 overflow-hidden" />
      {filtersOnly ? null : days.length > 0 ? (
        <>
          <TransactionMenus />
          {tiles}
          <TransactionDays days={days} failed={failed} />
          {footer}
        </>
      ) : (
        empty
      )}
    </>
  );
}
