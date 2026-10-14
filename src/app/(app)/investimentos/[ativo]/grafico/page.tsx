import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailGrid, DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { ChartControls, CompareDialog } from "@/features/ativo/components/chart-controls";
import { LineCompareChart } from "@/features/ativo/components/line-compare-chart";
import { assets } from "@/features/ativo/data";
import { assetFacts, chartDetails, type ChartDetail, type ChartView } from "@/features/ativo/more";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(chartDetails).map((ativo) => ({ ativo }));
}

function AssetHero({ detail, nome }: { detail: ChartDetail; nome: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-11.5 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas font-display text-13 font-bold"
        >
          {detail.selo}
        </span>
        <span className="flex flex-col leading-[1.25]">
          <strong className="text-20">{nome}</strong>
          <span className="text-13 text-mist">{detail.linha}</span>
        </span>
      </div>
      <span className="font-display text-32 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        {detail.preco}
      </span>
      <span className="text-14 font-bold text-folha">{detail.variacao}</span>
    </div>
  );
}

function ChartPanel({
  view,
  wide,
  adjustHref,
}: {
  view: ChartView;
  wide?: boolean;
  adjustHref?: string;
}) {
  const legenda = view.legenda ?? view.linhas.map((l) => l.nome);
  return (
    <Panel className={wide ? "p-6" : "p-4.5"}>
      <PanelHeader
        title="Preço da cota"
        subtitle="23 set 2025 – 23 set 2026"
        titleClassName={cn("tracking-normal", wide ? "text-19" : "text-17")}
      />
      <Suspense>
        <ChartControls compare={view.comparar} adjusted={view.ajustado} adjustHref={adjustHref} />
      </Suspense>
      <LineCompareChart
        lines={view.linhas}
        domain={view.dominio}
        ticks={view.marcas}
        label={view.rotulo}
        size={wide ? "wide" : "compact"}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-12 text-mist">
        {view.linhas.map((line, i) => (
          <span key={line.nome} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("w-4.5 border-t-2", line.tracejada ? "border-dashed" : "border-solid")}
              style={{ borderColor: line.cor }}
            />
            {legenda[i]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 items-stretch gap-2">
        {view.tiles.map((tile) => (
          <StatTile
            key={tile.label}
            label={tile.label}
            value={tile.value}
            hint={tile.hint}
            valueClassName={cn("text-16", tile.cor)}
          />
        ))}
      </div>
      {view.nota?.tom === "plain" && (
        <p className="m-0 text-13 leading-[1.55] text-caption">{view.nota.texto}</p>
      )}
      {view.nota?.tom === "arara" && (
        <Note icon="info-lg" tone="info" className="bg-arara-bg" iconClassName="text-arara">
          {view.nota.destaque && <strong>{view.nota.destaque}</strong>} {view.nota.texto}
        </Note>
      )}
    </Panel>
  );
}

function SidePanels({ detail, slug, wide }: { detail: ChartDetail; slug: string; wide?: boolean }) {
  const pad = wide ? "p-6" : "p-4.5";
  const title = cn("tracking-normal", wide ? "text-19" : "text-17");
  return (
    <>
      {detail.posicao && (
        <Panel className={pad}>
          <PanelHeader title="Sua posição" titleClassName={title} />
          <DetailGrid items={detail.posicao} className={wide ? "text-14" : undefined} />
        </Panel>
      )}
      {detail.ajuste && (
        <Panel className={cn(pad, wide && "grow")}>
          <PanelHeader title="Com e sem ajuste" titleClassName={title} />
          <DetailList items={detail.ajuste} />
        </Panel>
      )}
      {wide && detail.sobre && (
        <Panel className={cn(pad, "grow")}>
          <PanelHeader title="Sobre o fundo" titleClassName={title} />
          <DetailList items={detail.sobre} />
          {assetFacts[slug] && (
            <div className="flex items-center gap-2.5">
              <Link
                href={`/investimentos/${slug}/detalhes`}
                className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
              >
                Mais detalhes
                <Icon name="chevron-right" size={16} />
              </Link>
            </div>
          )}
        </Panel>
      )}
    </>
  );
}

export default async function GraficoPage({
  params,
  searchParams,
}: PageProps<"/investimentos/[ativo]/grafico">) {
  const { ativo } = await params;
  const query = await searchParams;
  const detail = chartDetails[ativo];
  const asset = assets[ativo];
  if (!detail || !asset) notFound();

  const views = Object.values(detail.visoes);
  const view =
    (typeof query.comparar === "string" ? detail.visoes[query.comparar] : undefined) ?? views[0]!;
  // Sem ajuste, ligar o interruptor volta para o detalhe do ativo (gráfico ajustado).
  const adjustHref = view.ajustado ? undefined : `/investimentos/${ativo}`;

  return (
    <>
      <Page
        padding="detail"
        zoom={1.4}
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={
          <MobileHeader
            title={asset.nome}
            subtitle="Detalhes do ativo"
            back={`/investimentos/${ativo}`}
            balanced
          />
        }
      >
        <Breadcrumb
          className="hidden flex-wrap @tab:flex"
          items={[
            { label: "Investimentos", href: "/investimentos" },
            { label: asset.nome, href: `/investimentos/${ativo}` },
            { label: view.caminho },
          ]}
        />
        <DetailHeader title={asset.nome} subtitle={detail.subtitulo} />

        {/* Celular e tablet */}
        <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
          <AssetHero detail={detail} nome={asset.nome} />
          <ChartPanel view={view} adjustHref={adjustHref} />
          <SidePanels detail={detail} slug={ativo} />
        </div>

        {/* Desktop: gráfico largo e, ao lado, cotação e posição. */}
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
          <ChartPanel view={view} wide adjustHref={adjustHref} />
          <div className="flex min-w-0 flex-col gap-4">
            <Panel className="p-6">
              <AssetHero detail={detail} nome={asset.nome} />
            </Panel>
            <SidePanels detail={detail} slug={ativo} wide />
          </div>
        </div>
      </Page>
      <Suspense>
        <CompareDialog current={view.comparar} />
      </Suspense>
    </>
  );
}
