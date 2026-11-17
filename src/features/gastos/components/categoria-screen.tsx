"use client";

import { notFound, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { GuaraTip } from "@/components/ui/guara-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { SearchField } from "@/components/ui/search-field";
import {
  CategorySummary,
  CategoryWhere,
  ChatWithGuara,
  SeeAllButton,
} from "@/features/gastos/components/category-ledger";
import { TransactionDays } from "@/features/gastos/components/transaction-days";
import { useSession } from "@/features/acesso/session";
import type { CategoryLedger } from "@/features/gastos/lancamentos";
import { useCategoryLedger } from "@/features/gastos/live-ledger";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { formatDate } from "@/lib/format";
import { pastMonthOrNull } from "@/lib/live-format";

/**
 * O mês do endereço (`?mes=2026-10`, vindo de Gastos com outro mês escolhido). Fica num
 * `Suspense` à parte para a página continuar gerada no build; sem mês válido, o atual (`null`).
 */
function MonthFromUrl({ onMonth }: { onMonth: (month: string | null) => void }) {
  const mes = useSearchParams().get("mes");
  useEffect(() => {
    onMonth(pastMonthOrNull(mes, new Date()));
  }, [mes, onMonth]);
  return null;
}

/**
 * Uma categoria no mês: com login, os dados da API; no protótipo, os de exemplo (`prototype`,
 * `null` quando a categoria não existe no protótipo).
 */
export function CategoriaScreen({
  categoria,
  prototype,
  prototypeHasCeiling,
}: {
  categoria: string;
  prototype: CategoryLedger | null;
  prototypeHasCeiling: boolean;
}) {
  const { live } = useSession();
  // `undefined` até ler o endereço: a busca espera para não pedir o mês errado antes.
  const [month, setMonth] = useState<string | null | undefined>(undefined);
  const real = useCategoryLedger(categoria, {
    enabled: live && month !== undefined,
    month: month ?? undefined,
  });
  const fromUrl = (
    <Suspense fallback={null}>
      <MonthFromUrl onMonth={setMonth} />
    </Suspense>
  );
  if (!live && !prototype) notFound();
  if (live && !real.data) {
    return (
      <Page padding="detail" header={<MobileHeader title="Gastos" back="/gastos" balanced />}>
        {fromUrl}
        {real.error ? <ErrorBlock /> : <LoadingStatus />}
      </Page>
    );
  }
  const ledger = live ? real.data! : prototype!;
  const hasCeiling = live ? Boolean(ledger.teto) : prototypeHasCeiling;
  const year = (month ?? formatDate(new Date(), "yyyy-MM")).slice(0, 4);
  const subtitle = live
    ? `${ledger.mes ? ledger.mes.charAt(0).toUpperCase() + ledger.mes.slice(1) : ""} ${year}`
    : "Setembro 2026 · Nubank e Itaú";
  const search = <SearchField label={`Buscar em ${ledger.nome}`} size="list" />;
  const tip = ledger.dica && <GuaraTip named>{ledger.dica}</GuaraTip>;

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title={ledger.nome} back="/gastos" balanced />}
    >
      {fromUrl}
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Gastos", href: "/gastos" }, { label: ledger.nome }]}
      />
      <DetailHeader
        title={ledger.nome}
        subtitle={subtitle}
        actions={
          hasCeiling && (
            <ButtonLink
              href={live ? "/alertas/tetos" : `/alertas/tetos/${categoria}/editar`}
              variant="secondary"
              size="sm"
            >
              <Icon name="edit" size={18} />
              <span>Editar teto</span>
            </ButtonLink>
          )
        }
      />

      {/* Celular: tudo em sequência. */}
      <div className="contents @tab:hidden">
        <CategorySummary ledger={ledger} />
        {tip}
        <CategoryWhere ledger={ledger} />
        {search}
        <TransactionDays days={ledger.dias} withCategory={false} />
        <SeeAllButton count={ledger.lancamentos} />
      </div>

      {/* Tablet: resumo e "onde foi" lado a lado; a lista num card. */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <div className="grid grid-cols-2 items-stretch gap-4">
          <CategorySummary ledger={ledger} />
          <div className="flex min-w-0 flex-col gap-4">
            {tip}
            <CategoryWhere ledger={ledger} className="grow" />
          </div>
        </div>
        <Panel className="gap-3.5 p-5.5">
          {search}
          <TransactionDays days={ledger.dias} withCategory={false} />
          <SeeAllButton count={ledger.lancamentos} />
        </Panel>
      </div>

      {/* Desktop: três cards e a lista em duas colunas. */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="grid grid-cols-3 items-stretch gap-5">
          <CategorySummary ledger={ledger} />
          <CategoryWhere ledger={ledger} />
          {ledger.dica && (
            <GuaraTip named action={<ChatWithGuara />}>
              {ledger.dica}
            </GuaraTip>
          )}
        </div>
        <Panel className="gap-4 p-6">
          <div className="grid grid-cols-2 items-stretch gap-4">
            {search}
            <div />
          </div>
          <TransactionDays days={ledger.dias} withCategory={false} columns />
          <SeeAllButton count={ledger.lancamentos} />
        </Panel>
      </div>
    </Page>
  );
}
