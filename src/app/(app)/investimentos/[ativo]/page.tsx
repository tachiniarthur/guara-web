import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { parseScreenState, type ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import type { Variant } from "@/features/ativo/components/charts";
import { ComparedDetail } from "@/features/ativo/components/compared-detail";
import { StockDetail } from "@/features/ativo/components/stock-detail";
import { assets, type Asset } from "@/features/ativo/data";

export function generateStaticParams() {
  return Object.keys(assets).map((ativo) => ({ ativo }));
}

function Detail({
  asset,
  variant,
  state,
}: {
  asset: Asset;
  variant: Variant;
  state: ScreenState | null;
}) {
  return asset.modelo === "acao" ? (
    <StockDetail asset={asset} variant={variant} state={state} />
  ) : (
    <ComparedDetail asset={asset} variant={variant} />
  );
}

export default async function AtivoPage({
  params,
  searchParams,
}: PageProps<"/investimentos/[ativo]">) {
  const { ativo } = await params;
  const state = parseScreenState((await searchParams).estado);
  const asset = assets[ativo];
  if (!asset) notFound();

  return (
    <Page header={<MobileHeader title="Detalhes do ativo" back="/investimentos" />}>
      {state === "carregando" && <LoadingStatus />}
      <Skeleton active={state === "carregando"}>
        <div className="@tab:hidden">
          <Detail asset={asset} variant="mobile" state={state} />
        </div>
        <div className="hidden @tab:block @desk:hidden">
          <Detail asset={asset} variant="tablet" state={state} />
        </div>
        <div className="hidden @desk:block">
          <Detail asset={asset} variant="desktop" state={state} />
        </div>
      </Skeleton>
    </Page>
  );
}
