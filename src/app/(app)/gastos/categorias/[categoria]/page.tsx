import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { SearchField } from "@/components/ui/search-field";
import {
  CategorySummary,
  CategoryWhere,
  ChatWithTamandua,
  SeeAllButton,
} from "@/features/gastos/components/category-ledger";
import { TransactionDays } from "@/features/gastos/components/transaction-days";
import { categorySpending, tetos } from "@/features/gastos/data";
import { ledgerForCategory } from "@/features/gastos/lancamentos";

export function generateStaticParams() {
  return categorySpending.map((c) => ({ categoria: c.id }));
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const summary = categorySpending.find((c) => c.id === categoria);
  if (!summary) notFound();
  const ledger = ledgerForCategory(categoria, summary);
  const hasCeiling = tetos.some((t) => t.id === categoria);
  const search = <SearchField label={`Buscar em ${ledger.nome}`} size="list" />;
  const tip = ledger.dica && (
    <AgentTip agent="tamandua" named>
      {ledger.dica}
    </AgentTip>
  );

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title={ledger.nome} back="/gastos" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Gastos", href: "/gastos" },
          { label: "Por categoria", href: "/gastos" },
          { label: ledger.nome },
        ]}
      />
      <DetailHeader
        title={ledger.nome}
        subtitle="Setembro 2026 · Nubank e Itaú"
        actions={
          hasCeiling && (
            <ButtonLink href={`/alertas/tetos/${categoria}/editar`} variant="secondary" size="sm">
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
            <AgentTip agent="tamandua" named action={<ChatWithTamandua />}>
              {ledger.dica}
            </AgentTip>
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
