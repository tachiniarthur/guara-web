import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import {
  ErrorBlock,
  ErrorBlocks,
  NoDataBlock,
  StateBlock,
  StateSwap,
  TileEmptyBlock,
} from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
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

function NoCeilingTile({ text, replacement }: { text: string; replacement: ReactNode }) {
  return (
    <StateSwap
      replacement={replacement}
      overlayClassName="items-start rounded-[0.875rem] bg-shade px-3.5 py-3"
    >
      <NoCeilingNote text={text} />
    </StateSwap>
  );
}

export function generateStaticParams() {
  return allTransactions.map((item) => ({ id: item.id }));
}

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

export default async function LancamentoPage({
  params,
  searchParams,
}: PageProps<"/gastos/lancamentos/[id]">) {
  const { id } = await params;
  const item = findTransaction(id);
  if (!item) notFound();
  const details = detailsFor(item);
  const offPattern = item.foraDoPadrao;
  const state = parseScreenState((await searchParams).estado);
  const failed = state === "erro";
  const empty = state === "vazio";
  /** Tiles sem título (valor, pergunta do Quero-quero, aviso sem teto). */
  const tile = (onTablet: "tile" | "compact" = "tile") =>
    failed ? <ErrorBlocks mobile="tile" tablet={onTablet} /> : empty && <TileEmptyBlock />;

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
      {state === "carregando" && <LoadingStatus />}
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

      <Skeleton active={state === "carregando"}>
        {/* Celular: tudo em sequência · tablet: valor no topo e duas colunas. */}
        <div className="contents @desk:hidden">
          <StateSwap
            overlayClassName="items-center text-center"
            replacement={
              failed ? (
                <ErrorBlocks mobile="tile" tablet="compact" />
              ) : (
                empty && (
                  <>
                    <TileEmptyBlock className="@tab:hidden" />
                    <NoDataBlock compact className="hidden @tab:flex" />
                  </>
                )
              )
            }
          >
            <TransactionHero item={item} details={details} />
          </StateSwap>
          <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
            <div className="flex min-w-0 flex-col gap-4">
              {offPattern && (
                <StateSwap replacement={tile()} overlayClassName="rounded-bubble bg-shade p-4">
                  <OffPatternCheck />
                </StateSwap>
              )}
              {details.semTeto && (
                <div className="hidden @tab:block">
                  <NoCeilingTile text={details.semTeto} replacement={tile()} />
                </div>
              )}
              <Panel className="gap-3.5 p-4.5 @tab:grow">
                <StateSwap
                  replacement={failed ? <ErrorBlock /> : empty && notFoundBlock}
                  className="grow"
                >
                  <TransactionDetailList details={details} />
                </StateSwap>
              </Panel>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <CategoryPicker details={details} current={item.categoria} id="cat-m" state={state} />
              {details.semTeto && (
                <div className="@tab:hidden">
                  <NoCeilingTile text={details.semTeto} replacement={tile()} />
                </div>
              )}
              <MoreActions failed={failed} />
            </div>
          </div>
        </div>

        {/* Desktop: três colunas. */}
        <div className="hidden grid-cols-3 items-stretch gap-5 @desk:grid">
          <div className="flex min-w-0 flex-col gap-4">
            {offPattern && (
              <StateSwap
                replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />}
                overlayClassName="rounded-bubble bg-shade p-4"
              >
                <OffPatternCheck />
              </StateSwap>
            )}
            <Panel className="grow gap-3.5 p-6">
              <StateSwap
                replacement={failed ? <ErrorBlock /> : empty && <NoDataBlock />}
                className="grow"
              >
                <TransactionHero item={item} details={details} desktop />
              </StateSwap>
            </Panel>
          </div>
          <Panel className="gap-3.5 p-5.5">
            <PanelHeader title="Detalhes" titleClassName="text-19 tracking-normal" />
            <StateSwap
              replacement={failed ? <ErrorBlock /> : empty && notFoundBlock}
              className="grow"
            >
              <TransactionDetailList details={details} />
            </StateSwap>
          </Panel>
          <div className="flex min-w-0 flex-col gap-4">
            <CategoryPicker
              details={details}
              current={item.categoria}
              id="cat-d"
              desktop
              state={state}
            />
            <MoreActions desktop failed={failed} />
          </div>
        </div>
      </Skeleton>
    </Page>
  );
}
