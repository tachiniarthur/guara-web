import Link from "next/link";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

import type { StockAsset } from "../data";
import { DividendsChart, StockPriceChart, type Variant } from "./charts";
import {
  AssetActions,
  AssetBadge,
  DataSource,
  EventsCard,
  IndicatorsCard,
  KeyValueList,
  RangeCard,
} from "./parts";

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
        {title}
      </h2>
      {subtitle && <p className="m-0 text-13 text-caption">{subtitle}</p>}
    </div>
  );
}

function PeriodTabs({ variant }: { variant: Variant }) {
  const compact = variant !== "desktop";
  return (
    <div
      role="group"
      aria-label="Período do gráfico"
      className={cn("flex shrink-0 gap-1 rounded-full bg-shade p-1", compact && "self-start")}
    >
      {["1D", "1M", "6M", "1A", "5A"].map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={p === "6M"}
          className={cn(
            "rounded-full border-none text-13",
            compact ? "h-[2.125rem] px-[0.5625rem]" : "h-9 px-3",
            p === "6M" ? "bg-sand font-bold text-canvas" : "bg-transparent font-medium text-mist",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

const pad: Record<Variant, string> = { desktop: "p-[1.375rem]", tablet: "p-5", mobile: "p-4.5" };

function PriceCard({ variant }: { variant: Variant }) {
  const subtitle =
    variant === "desktop" ? "Últimos 6 meses · preço por ação em reais" : "Últimos 6 meses";
  return (
    <Panel className={cn("gap-4", pad[variant], variant === "desktop" && "grow")}>
      {variant !== "desktop" ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <CardTitle title="Cotação" subtitle={subtitle} />
          </div>
          <PeriodTabs variant={variant} />
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <CardTitle title="Cotação" subtitle={subtitle} />
          <PeriodTabs variant={variant} />
        </div>
      )}
      <StockPriceChart
        variant={variant}
        averagePrice={35.1}
        maxLabel="R$ 39,90"
        minLabel="R$ 33,40"
      />
    </Panel>
  );
}

function PositionCard({ asset, variant }: { asset: StockAsset; variant: Variant }) {
  const p = asset.posicao;
  return (
    <Panel className={cn("gap-4", pad[variant], variant === "desktop" && "grow")}>
      <CardTitle title="Sua posição" subtitle={p.desde} />
      <div className="flex flex-col gap-0.5 rounded-tile bg-folha-bg px-4 py-3.5">
        <span className="text-13 text-mist">Resultado desde a compra</span>
        <span className="font-display text-26 font-extrabold text-folha tabular-nums">
          {p.resultado} <span className="text-16">{p.resultadoPct}</span>
        </span>
      </div>
      <KeyValueList rows={p.linhas} rowClassName="min-h-[2.5625rem]" />
      <Link
        href="/alertas"
        className="flex items-center gap-2.5 rounded-tile bg-shade px-3.5 py-3 text-sand no-underline"
      >
        <span className="text-tucano">
          <Icon name="bell" size={18} />
        </span>
        <span className="flex min-w-0 grow flex-col leading-[1.35]">
          <strong className="text-14">{p.alerta.titulo}</strong>
          <span className="text-13 text-mist">{p.alerta.texto}</span>
        </span>
        <Icon name="chevron-right" size={16} className="text-caption" />
      </Link>
    </Panel>
  );
}

function FundamentalsCard({ asset, variant }: { asset: StockAsset; variant: Variant }) {
  return (
    <Panel className={cn("gap-4", pad[variant])}>
      <CardTitle
        title="Indicadores"
        subtitle={variant === "desktop" ? "Dados do último balanço" : "Último balanço"}
      />
      <KeyValueList rows={asset.fundamentos} rowClassName="min-h-[2.5625rem]" />
    </Panel>
  );
}

function DividendsList({ asset }: { asset: StockAsset }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {asset.proventos.lista.map((item) => (
        <li
          key={item.titulo}
          className="flex min-h-[3.3125rem] items-center justify-between gap-3 border-b border-line"
        >
          <span className="flex flex-col leading-[1.35]">
            <strong className="text-14">{item.titulo}</strong>
            <span className="text-12 text-caption">{item.data}</span>
          </span>
          <span className="flex flex-col items-end leading-[1.35]">
            <strong
              className={cn("text-14 tabular-nums", item.recebeu ? "text-folha" : "text-caption")}
            >
              {item.valor}
            </strong>
            <span className="text-12 text-caption">{item.legenda}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function DividendsCard({ asset, variant }: { asset: StockAsset; variant: Variant }) {
  return (
    <Panel className={cn("gap-4", pad[variant])}>
      <CardTitle title="Proventos" subtitle={asset.proventos.subtitulo} />
      {variant === "desktop" ? (
        <div className="grid grid-cols-2 items-stretch gap-7">
          <div className="min-w-0">
            <DividendsChart variant="desktop" bars={asset.proventos.barras} />
          </div>
          <DividendsList asset={asset} />
        </div>
      ) : (
        <>
          <DividendsChart variant={variant} bars={asset.proventos.barras} />
          <DividendsList asset={asset} />
        </>
      )}
    </Panel>
  );
}

function CompanyCard({ asset, variant }: { asset: StockAsset; variant: Variant }) {
  return (
    <Panel className={cn("gap-4", pad[variant])}>
      <CardTitle title="Sobre a empresa" />
      <KeyValueList rows={asset.empresaInfo.linhas} rowClassName="min-h-[2.5625rem]" />
      <p className="m-0 text-14 leading-[1.6] text-mist">{asset.empresaInfo.descricao}</p>
    </Panel>
  );
}

function PriceBlock({
  asset,
  size,
  align = "start",
}: {
  asset: StockAsset;
  size: "lg" | "md";
  align?: "start" | "end";
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", align === "end" && "items-end")}>
      <span
        className={cn(
          "font-display leading-none font-extrabold tracking-[-0.02em] tabular-nums",
          size === "md" ? "text-36" : "text-40",
        )}
      >
        {asset.preco.valor}
      </span>
      <span className="text-15 font-bold text-urucum tabular-nums">
        <span aria-hidden="true" className="text-11">
          ▼
        </span>
        {` ${asset.preco.variacao}`}
      </span>
      <span className="text-12 text-caption">{asset.preco.atualizado}</span>
    </div>
  );
}

function TitleBlock({
  asset,
  size,
  titleSize,
}: {
  asset: StockAsset;
  size: "lg" | "md";
  titleSize: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <AssetBadge asset={asset} size={size} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            className={cn(
              "m-0 font-display leading-[1.1] font-extrabold tracking-[-0.01em]",
              titleSize,
            )}
          >
            {asset.nome}
          </h1>
          <span className="rounded-full bg-shade px-2.5 py-[3px] text-12 font-bold text-mist">
            {asset.tag}
          </span>
        </div>
        <span className="text-14 text-mist">{asset.empresa}</span>
      </div>
    </div>
  );
}

const footer =
  "Cotação e dados da empresa via Brapi, com atraso de até 15 minutos. Informação para acompanhamento, não é recomendação de investimento.";

/** Detalhe de uma ação: cotação, posição, faixas de preço, fundamentos, proventos e eventos. */
export function StockDetail({ asset, variant }: { asset: StockAsset; variant: Variant }) {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-3.5">
          <TitleBlock asset={asset} size="md" titleSize="text-26" />
          <PriceBlock asset={asset} size="md" />
        </header>
        <AssetActions
          alert
          alertIcon="bell"
          className="grid grid-cols-2 gap-2 [&>*:first-child]:col-span-full [&>*:not(:first-child)]:px-2.5 [&>*:not(:first-child)>svg]:hidden"
        />
        <PriceCard variant="mobile" />
        <PositionCard asset={asset} variant="mobile" />
        <RangeCard range={asset.hoje} short className="p-4.5" />
        <RangeCard range={asset.semanas} short className="p-4.5" />
        <FundamentalsCard asset={asset} variant="mobile" />
        <DividendsCard asset={asset} variant="mobile" />
        <CompanyCard asset={asset} variant="mobile" />
        <IndicatorsCard asset={asset} variant="mobile" />
        <EventsCard events={asset.eventos} variant="mobile" />
        <DataSource>{footer}</DataSource>
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div className="flex flex-col gap-5">
        <Breadcrumb
          items={[{ label: "Investimentos", href: "/investimentos" }, { label: asset.nome }]}
        />
        <header className="flex flex-col gap-4">
          <TitleBlock asset={asset} size="lg" titleSize="text-30" />
          <PriceBlock asset={asset} size="lg" />
          <AssetActions alert alertIcon="bell" />
        </header>
        <PriceCard variant="tablet" />
        <PositionCard asset={asset} variant="tablet" />
        <div className="grid grid-cols-2 items-stretch gap-4">
          <RangeCard range={asset.hoje} short className="p-5" />
          <RangeCard range={asset.semanas} short className="p-5" />
        </div>
        <div className="grid grid-cols-2 items-stretch gap-4">
          <FundamentalsCard asset={asset} variant="tablet" />
          <CompanyCard asset={asset} variant="tablet" />
        </div>
        <DividendsCard asset={asset} variant="tablet" />
        <IndicatorsCard asset={asset} variant="tablet" className="p-5" />
        <EventsCard events={asset.eventos} variant="tablet" className="p-5" />
        <DataSource>{footer}</DataSource>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: asset.nome }]}
      />
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-4">
          <TitleBlock asset={asset} size="lg" titleSize="text-34" />
          <AssetActions alert alertIcon="bell" />
        </div>
        <PriceBlock asset={asset} size="lg" align="end" />
      </header>
      <div className="grid grid-cols-12 items-stretch gap-5">
        <div className="col-span-8 flex min-w-0">
          <PriceCard variant="desktop" />
        </div>
        <div className="col-span-4 flex min-w-0">
          <PositionCard asset={asset} variant="desktop" />
        </div>
      </div>
      <div className="grid grid-cols-3 items-stretch gap-5">
        <RangeCard range={asset.hoje} />
        <RangeCard range={asset.semanas} />
        <FundamentalsCard asset={asset} variant="desktop" />
      </div>
      <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-stretch gap-5">
        <DividendsCard asset={asset} variant="desktop" />
        <CompanyCard asset={asset} variant="desktop" />
      </div>
      <IndicatorsCard asset={asset} variant="desktop" />
      <EventsCard events={asset.eventos} variant="desktop" />
      <DataSource>{footer}</DataSource>
    </div>
  );
}
