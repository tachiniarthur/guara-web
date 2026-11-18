"use client";

import { notFound } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { useSession } from "@/features/acesso/session";
import { AssetDialogs, type AssetDialog } from "@/features/ativo/components/asset-dialogs";
import {
  DividendsPanel,
  FundamentalsPanel,
  LimitsNote,
  MarketError,
  PerformancePanel,
  PlanNote,
  PositionPanel,
  QuotePanel,
} from "@/features/ativo/components/asset-panels";
import {
  isPlanLimit,
  isPositionId,
  toAssetView,
  toMarketView,
  useMarketAsset,
  usePosition,
  type AssetView,
} from "@/features/ativo/live";
import { ApiError } from "@/lib/api";

function Actions({ asset, onOpen }: { asset: AssetView; onOpen: (d: AssetDialog) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ButtonLink
        href={`/investimentos/posicoes?risco=${asset.id}`}
        variant="secondary"
        size="sm"
        scroll={false}
      >
        <span>Ajustar risco</span>
      </ButtonLink>
      {/* Posição do Open Finance: a instituição manda os números; a próxima sincronização
          desfaria a correção. */}
      {asset.manual && (
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpen("movimentar")}>
            <span>Registrar movimentação</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onOpen("editar")}>
            <span>Corrigir</span>
          </Button>
          <Button variant="danger-outline" size="sm" onClick={() => onOpen("remover")}>
            <span>Remover</span>
          </Button>
        </>
      )}
    </div>
  );
}

/** Página do ativo (`/investimentos/<id da posição>`), toda com dados da API. */
export function AtivoScreen({ id }: { id: string }) {
  const { live } = useSession();
  const position = usePosition(id, { enabled: live });
  const asset = position.data ? toAssetView(position.data) : null;
  const symbol = asset?.mercado ? asset.ticker : null;
  const marketQuery = useMarketAsset(symbol, { enabled: live });
  const market = marketQuery.data ? toMarketView(marketQuery.data) : null;
  const [dialog, setDialog] = useState<AssetDialog>(null);

  // Id que não é uuid nunca vira chamada à API; posição de outra conta ou removida: 404.
  if (!isPositionId(id)) notFound();
  if (position.error instanceof ApiError && position.error.code === "not_found") notFound();

  const header = (
    <MobileHeader
      title={asset?.nome ?? "Ativo"}
      subtitle={asset?.descricao}
      back="/investimentos"
      balanced
    />
  );

  if (!live || position.error || !asset) {
    return (
      <Page padding="detail" header={header}>
        {!live || position.error ? <ErrorBlock /> : <LoadingStatus />}
      </Page>
    );
  }

  const eventsHref = `/investimentos/${asset.id}/eventos`;
  const marketBlock = !symbol ? null : isPlanLimit(marketQuery.error) ? (
    <PlanNote />
  ) : marketQuery.error ? (
    <MarketError />
  ) : !market ? (
    <LoadingStatus />
  ) : (
    <QuotePanel symbol={symbol} market={market} enabled={live} />
  );
  const side = market && (
    <>
      <DividendsPanel market={market} href={eventsHref} />
      <PerformancePanel market={market} />
      <FundamentalsPanel market={market} />
      <LimitsNote market={market} />
    </>
  );

  return (
    <Page padding="detail" zoom={1.4} className="gap-4 @tab:gap-5 @desk:gap-6" header={header}>
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: asset.nome }]}
      />
      <DetailHeader
        title={asset.nome}
        subtitle={[asset.descricao, market?.setor].filter(Boolean).join(" · ")}
        actions={
          <div className="hidden @tab:block">
            <Actions asset={asset} onOpen={setDialog} />
          </div>
        }
      />
      <div className="@tab:hidden">
        <Actions asset={asset} onOpen={setDialog} />
      </div>
      <div
        className={
          symbol
            ? "grid grid-cols-1 items-start gap-4 @tab:grid-cols-2 @desk:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @desk:gap-5"
            : "grid grid-cols-1 gap-4 @tab:max-w-[36rem]"
        }
      >
        <div className="flex min-w-0 flex-col gap-4">
          <PositionPanel asset={asset} />
          {!asset.manual && (
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Os números desta posição vêm da instituição pelo Open Finance e são atualizados a cada
              sincronização.
            </p>
          )}
        </div>
        {symbol && (
          <div className="flex min-w-0 flex-col gap-4">
            {marketBlock}
            {side}
          </div>
        )}
      </div>
      <AssetDialogs asset={asset} open={dialog} onClose={() => setDialog(null)} />
    </Page>
  );
}
