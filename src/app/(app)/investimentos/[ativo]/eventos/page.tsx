import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ListFilter } from "@/components/ui/list-filter";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { assets } from "@/features/ativo/data";
import { assetEvents, type EventRow } from "@/features/ativo/more";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(assetEvents).map((ativo) => ({ ativo }));
}

type Events = (typeof assetEvents)[string];
type Group = Events["grupos"][number];

function EventList({ eventos }: { eventos: EventRow[] }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {eventos.map((e) => (
        <li
          key={e.data}
          className="grid grid-cols-[5.75rem_1fr_auto] items-center gap-2.5 border-b border-line py-[0.6875rem] text-14"
        >
          <span className="text-mist tabular-nums">{e.data}</span>
          <span className="flex flex-col leading-[1.3]">
            <strong>{e.tipo}</strong>
            <span className="text-12 text-caption">{e.valor}</span>
          </span>
          <span
            className={cn(
              "font-bold whitespace-nowrap tabular-nums",
              e.recebido ? "text-folha" : "text-caption",
            )}
          >
            {e.recebido ?? "você não tinha"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function YearPanel({
  group,
  className,
  children,
}: {
  group: Group;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Panel className={cn("p-4.5 @desk:p-5.5", className)}>
      <PanelHeader
        title={group.ano}
        subtitle={group.resumo}
        titleClassName="text-17 tracking-normal @desk:text-19"
      />
      <EventList eventos={group.eventos} />
      {children}
    </Panel>
  );
}

function MoreButton({ group, className }: { group: Group; className?: string }) {
  if (!group.mais) return null;
  return (
    <Button variant="secondary" size="sm" block className={className}>
      <span>
        Mostrar mais {group.mais} de {group.ano}
      </span>
    </Button>
  );
}

export default async function EventosPage({ params }: PageProps<"/investimentos/[ativo]/eventos">) {
  const { ativo } = await params;
  const events = assetEvents[ativo];
  const asset = assets[ativo];
  if (!events || !asset) notFound();

  const [atual, anterior] = events.grupos as [Group, Group];
  const note = <p className="m-0 text-13 leading-[1.55] text-caption">{events.nota}</p>;
  const tiles = (large: boolean) =>
    large ? (
      <div className="grid grid-cols-2 items-stretch gap-5">
        <Panel className="gap-1.5 p-5.5">
          <span className="text-14 text-mist">Você recebeu</span>
          <span className="font-display text-26 leading-[1.1] font-extrabold tracking-[-0.01em] text-folha tabular-nums">
            {events.recebido.valor}
          </span>
          <span className="text-13 text-caption">{events.recebido.desde}</span>
        </Panel>
        <Panel className="gap-1.5 p-5.5">
          <span className="text-14 text-mist">Últimos 12 meses</span>
          <span className="font-display text-26 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
            {events.doze.valor}
          </span>
          <span className="text-13 text-caption">{events.doze.legenda}</span>
        </Panel>
      </div>
    ) : (
      <div className="grid grid-cols-2 items-stretch gap-2.5">
        <StatTile
          label="Você recebeu"
          value={events.recebido.valor}
          hint={events.recebido.desde}
          valueClassName="text-18 text-folha"
        />
        <StatTile
          label="Últimos 12 meses"
          value={events.doze.valor}
          hint={events.doze.legenda}
          valueClassName="text-18"
        />
      </div>
    );

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Eventos corporativos"
          subtitle={`${asset.nome} · ${events.total} eventos`}
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
          { label: "Eventos" },
        ]}
      />
      <DetailHeader
        title="Eventos corporativos"
        subtitle={`${asset.nome} · ${events.total} eventos desde ${events.desde}`}
      />
      <div className="contents @desk:hidden">{tiles(false)}</div>
      <div className="contents @desk:flex @desk:items-center @desk:gap-2.5">
        <ListFilter
          label="Tipo de evento"
          options={events.tipos}
          className="-mr-4 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
        />
        <div aria-hidden="true" className="hidden grow @desk:block" />
        <ListFilter
          label="Ano"
          options={events.anos}
          className="-mr-4 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
        />
      </div>

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <YearPanel group={atual} />
        <YearPanel group={anterior}>
          <MoreButton group={anterior} />
        </YearPanel>
        {note}
      </div>

      {/* Tablet: o ano atual ao lado do anterior. */}
      <div className="hidden grid-cols-2 items-stretch gap-4 @tab:grid @desk:hidden">
        <YearPanel group={atual} />
        <div className="flex min-w-0 flex-col gap-4">
          <YearPanel group={anterior} className="grow">
            <MoreButton group={anterior} />
            {note}
          </YearPanel>
        </div>
      </div>

      {/* Desktop: resumo e ano anterior à esquerda; ano atual à direita. */}
      <div className="hidden grid-cols-2 items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-4">
          {tiles(true)}
          <YearPanel group={anterior} className="grow">
            <MoreButton group={anterior} />
            {note}
          </YearPanel>
        </div>
        <YearPanel group={atual} />
      </div>
    </Page>
  );
}
