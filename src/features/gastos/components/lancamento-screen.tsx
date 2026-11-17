"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  CategoryPicker,
  NoCeilingNote,
  OffPatternCheck,
  TransactionDetailList,
  TransactionHero,
} from "@/features/gastos/components/transaction-detail";
import { useSession } from "@/features/acesso/session";
import { useTransactionDetail } from "@/features/gastos/live-ledger";

const notFoundBlock = (
  <StateBlock
    icon="search"
    title="Lançamento não encontrado"
    action={
      <ButtonLink href="/gastos/lancamentos" size="md">
        <span>Ver lançamentos</span>
      </ButtonLink>
    }
  >
    O banco pode ter cancelado esta compra ou juntado com outra. Os outros lançamentos continuam
    iguais.
  </StateBlock>
);

/** Um lançamento, com os detalhes do banco, a categoria e a pergunta da compra fora do padrão. */
export function LancamentoScreen({ id }: { id: string }) {
  const { live } = useSession();
  const real = useTransactionDetail(id, { enabled: live });
  if (!real.data) {
    return (
      <Page
        padding="detail"
        header={<MobileHeader title="Lançamento" back="/gastos/lancamentos" balanced />}
      >
        {real.missing ? (
          notFoundBlock
        ) : real.error || !live ? (
          <ErrorBlock />
        ) : (
          <>
            <LoadingStatus />
            <p className="m-0 text-14 text-mist">Carregando o lançamento…</p>
          </>
        )}
      </Page>
    );
  }
  const { item, details } = real.data;
  const anomalyId = details.anomaliaId;

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Lançamento" back="/gastos/lancamentos" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Gastos", href: "/gastos" },
          { label: "Lançamentos", href: "/gastos/lancamentos" },
          { label: item.descricao },
        ]}
      />
      <DetailHeader title={item.descricao} />

      {/* Celular: tudo em sequência · tablet: valor no topo e duas colunas. */}
      <div className="contents @desk:hidden">
        <TransactionHero item={item} details={details} />
        <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
          <div className="flex min-w-0 flex-col gap-4">
            {anomalyId && <OffPatternCheck anomalyId={anomalyId} />}
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
            <CategoryPicker transactionId={id} details={details} id="cat-m" />
            {details.semTeto && (
              <div className="@tab:hidden">
                <NoCeilingNote text={details.semTeto} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: três colunas. */}
      <div className="hidden grid-cols-3 items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-4">
          {anomalyId && <OffPatternCheck anomalyId={anomalyId} />}
          <Panel className="grow gap-3.5 p-6">
            <TransactionHero item={item} details={details} desktop />
          </Panel>
        </div>
        <Panel className="gap-3.5 p-5.5">
          <PanelHeader title="Detalhes" titleClassName="text-19 tracking-normal" />
          <TransactionDetailList details={details} />
        </Panel>
        <CategoryPicker transactionId={id} details={details} id="cat-d" desktop />
      </div>
    </Page>
  );
}
