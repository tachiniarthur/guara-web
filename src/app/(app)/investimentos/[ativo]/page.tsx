import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import type { Variant } from "@/features/ativo/components/charts";
import { ComparedDetail } from "@/features/ativo/components/compared-detail";
import { StockDetail } from "@/features/ativo/components/stock-detail";
import { assets, type Asset } from "@/features/ativo/data";

export function generateStaticParams() {
  return Object.keys(assets).map((ativo) => ({ ativo }));
}

function Detail({ asset, variant }: { asset: Asset; variant: Variant }) {
  return asset.modelo === "acao" ? (
    <StockDetail asset={asset} variant={variant} />
  ) : (
    <ComparedDetail asset={asset} variant={variant} />
  );
}

export default async function AtivoPage({ params }: PageProps<"/investimentos/[ativo]">) {
  const { ativo } = await params;
  const asset = assets[ativo];
  if (!asset) notFound();

  return (
    <Page header={<MobileHeader title="Detalhes do ativo" back="/investimentos" />}>
      <div className="@tab:hidden">
        <Detail asset={asset} variant="mobile" />
      </div>
      <div className="hidden @tab:block @desk:hidden">
        <Detail asset={asset} variant="tablet" />
      </div>
      <div className="hidden @desk:block">
        <Detail asset={asset} variant="desktop" />
      </div>
    </Page>
  );
}
