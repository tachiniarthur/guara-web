"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { panelLinkClass } from "@/components/ui/panel";
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
  EMPTY_ASSET,
  EMPTY_MARKET,
  isPlanLimit,
  isPositionId,
  toMarketView,
  useAssetData,
  useHistory,
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
  const {
    position,
    asset,
    symbol,
    hasMarket,
    market: marketQuery,
  } = useAssetData(id, {
    enabled: live,
  });
  const market = marketQuery.data ? toMarketView(marketQuery.data) : null;
  // O gráfico de 1 ano já começa a carregar com a tela. Aqui fora, a busca não é cancelada
  // quando o card da cotação é remontado ao fim do carregamento.
  useHistory(symbol, "1y", { enabled: live && symbol !== null });
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

  if (!live || position.error) {
    return (
      <Page padding="detail" header={header}>
        <ErrorBlock />
      </Page>
    );
  }

  // Carregando: os cards ficam no lugar, com o círculo girando. Sem saber ainda se o ativo tem
  // cotação (entrada direta pelo endereço), a forma é a de um ativo com cotação, a mais comum.
  const loading = !asset;
  const view = asset ?? EMPTY_ASSET;
  const withMarket = hasMarket ?? true;
  const marketLoading = withMarket && !market && !marketQuery.error;
  const shownMarket = market ?? EMPTY_MARKET;
  const eventsHref = `/investimentos/${view.id}/eventos`;
  const marketBlock = isPlanLimit(marketQuery.error) ? (
    <PlanNote />
  ) : marketQuery.error ? (
    <MarketError />
  ) : (
    <>
      <QuotePanel
        symbol={symbol ?? "—"}
        market={shownMarket}
        enabled={live && symbol !== null}
        chartHref={`/investimentos/${view.id}/grafico`}
      />
      <DividendsPanel market={shownMarket} href={eventsHref} />
      <PerformancePanel market={shownMarket} />
      <FundamentalsPanel market={shownMarket} />
      <LimitsNote market={shownMarket} />
    </>
  );

  return (
    <Page padding="detail" zoom={1.4} className="gap-4 @tab:gap-5 @desk:gap-6" header={header}>
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: asset?.nome ?? "Ativo" },
        ]}
      />
      {(loading || marketLoading) && <LoadingStatus />}
      <Skeleton active={loading}>
        <DetailHeader
          title={view.nome}
          subtitle={[view.descricao, market?.setor].filter(Boolean).join(" · ")}
          actions={
            <div className="hidden @tab:block">
              <Actions asset={view} onOpen={setDialog} />
            </div>
          }
        />
        <div className="@tab:hidden">
          <Actions asset={view} onOpen={setDialog} />
        </div>
      </Skeleton>
      <div
        className={
          withMarket
            ? "grid grid-cols-1 items-start gap-4 @tab:grid-cols-2 @desk:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @desk:gap-5"
            : "grid grid-cols-1 gap-4 @tab:max-w-[36rem]"
        }
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Skeleton active={loading}>
            <PositionPanel asset={view} />
            <div className="flex justify-end">
              <Link href={`/investimentos/${view.id}/detalhes`} className={panelLinkClass}>
                Mais detalhes
                <Icon name="chevron-right" size={16} />
              </Link>
            </div>
            {!view.manual && (
              <p className="m-0 text-13 leading-[1.55] text-caption">
                Os números desta posição vêm da instituição pelo Open Finance e são atualizados a
                cada sincronização.
              </p>
            )}
          </Skeleton>
        </div>
        {withMarket && (
          <div className="flex min-w-0 flex-col gap-4">
            <Skeleton active={marketLoading}>{marketBlock}</Skeleton>
          </div>
        )}
      </div>
      {asset && <AssetDialogs asset={asset} open={dialog} onClose={() => setDialog(null)} />}
    </Page>
  );
}
