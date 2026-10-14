import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  CategoryPicker,
  MoreActions,
  NoCeilingNote,
  OffPatternCheck,
  TransactionDetailList,
  TransactionHero,
} from "@/features/gastos/components/transaction-detail";
import { allTransactions, detailsFor, findTransaction } from "@/features/gastos/lancamentos";

export function generateStaticParams() {
  return allTransactions.map((item) => ({ id: item.id }));
}

export default async function LancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = findTransaction(id);
  if (!item) notFound();
  const details = detailsFor(item);
  const offPattern = item.foraDoPadrao;

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Lançamento"
          back="/gastos/lancamentos"
          balanced
          actions={<IconButton icon="upload" label="Compartilhar comprovante" variant="ghost" />}
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Gastos", href: "/gastos" },
          { label: "Lançamentos", href: "/gastos/lancamentos" },
          { label: item.descricao },
        ]}
      />
      <DetailHeader
        title={item.descricao}
        actions={
          <Button variant="secondary" size="sm" className="hidden @desk:inline-flex">
            <Icon name="upload" size={18} />
            <span>Compartilhar comprovante</span>
          </Button>
        }
      />

      {/* Celular: tudo em sequência · tablet: valor no topo e duas colunas. */}
      <div className="contents @desk:hidden">
        <TransactionHero item={item} details={details} />
        <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
          <div className="flex min-w-0 flex-col gap-4">
            {offPattern && <OffPatternCheck />}
            {details.semTeto && (
              <div className="hidden @tab:block">
                <NoCeilingNote text={details.semTeto} />
              </div>
            )}
            <Panel className="gap-3.5 p-4.5 @tab:grow">
              <TransactionDetailList details={details} />
            </Panel>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <CategoryPicker details={details} current={item.categoria} id="cat-m" />
            {details.semTeto && (
              <div className="@tab:hidden">
                <NoCeilingNote text={details.semTeto} />
              </div>
            )}
            <MoreActions />
          </div>
        </div>
      </div>

      {/* Desktop: três colunas. */}
      <div className="hidden grid-cols-3 items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-4">
          {offPattern && <OffPatternCheck />}
          <Panel className="grow gap-3.5 p-6">
            <TransactionHero item={item} details={details} desktop />
          </Panel>
        </div>
        <Panel className="gap-3.5 p-5.5">
          <PanelHeader title="Detalhes" titleClassName="text-19 tracking-normal" />
          <TransactionDetailList details={details} />
        </Panel>
        <div className="flex min-w-0 flex-col gap-4">
          <CategoryPicker details={details} current={item.categoria} id="cat-d" desktop />
          <MoreActions desktop />
        </div>
      </div>
    </Page>
  );
}
