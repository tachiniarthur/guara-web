import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListFilter } from "@/components/ui/list-filter";
import { Panel } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { TimelineDays } from "@/features/relatorio/components/full-timeline";
import { fullTimeline, reportPeriod, timelineTotals } from "@/features/relatorio/data";
import { cn } from "@/lib/utils";

const periods = ["7 dias", "Este mês", "3 meses", "12 meses", "Personalizado"];
const kinds = ["Tudo", "Entradas", "Saídas", "Fora do padrão"];

function Filters() {
  return (
    <>
      <ListFilter
        label="Período"
        options={periods}
        defaultValue="Este mês"
        className="-mr-4 overflow-hidden @tab:mr-0 @tab:flex-wrap @tab:overflow-visible @desk:flex-nowrap"
      />
      <ListFilter
        label="Tipo de lançamento"
        options={kinds}
        className="-mr-4 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
      />
    </>
  );
}

function Totals({ large }: { large?: boolean }) {
  if (large) {
    return (
      <div className="grid grid-cols-4 items-stretch gap-5">
        {timelineTotals.map((t) => (
          <Panel key={t.label} className="gap-1.5 p-5.5">
            <span className="text-14 text-mist">{t.label}</span>
            <span
              className={cn(
                "font-display text-26 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
                t.tone,
              )}
            >
              {t.value}
            </span>
          </Panel>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5 @tab:grid-cols-4">
      {timelineTotals.map((t) => (
        <StatTile
          key={t.label}
          label={t.label}
          value={t.value}
          valueClassName={cn("text-16", t.tone)}
        />
      ))}
    </div>
  );
}

function Footer({ verb }: { verb: string }) {
  return (
    <>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Dias 2 a 4, 6 a 9 e 11 a 14 agrupados. {verb} em “Mostrar todos os dias” para abrir cada um.
      </p>
      <Button variant="secondary" block className="text-15">
        <span>Mostrar todos os dias</span>
      </Button>
    </>
  );
}

export default function LinhaDoTempoPage() {
  const scope = `${reportPeriod.range} · ${reportPeriod.scope}`;
  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Linha do tempo" subtitle={scope} back="/relatorio" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Relatórios", href: "/relatorio" }, { label: "Linha do tempo" }]}
      />
      <DetailHeader
        title="Linha do tempo completa"
        subtitle={`${scope} · 118 lançamentos`}
        actions={
          <ButtonLink href="/relatorio?exportar" variant="secondary" size="sm">
            <Icon name="arrow-down-to" size={18} />
            <span>Exportar</span>
          </ButtonLink>
        }
      />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <Filters />
        <Totals />
        <TimelineDays days={fullTimeline} />
        <Footer verb="Toque" />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Panel className="p-5.5">
          <Filters />
          <Totals />
        </Panel>
        <Panel className="p-5.5">
          <TimelineDays days={fullTimeline} />
          <Footer verb="Toque" />
        </Panel>
      </div>

      {/* Desktop: filtros numa linha, totais em cards e a linha do tempo em duas colunas. */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="flex items-center gap-3">
          <ListFilter label="Período" options={periods} defaultValue="Este mês" />
          <div aria-hidden="true" className="grow" />
          <ListFilter label="Tipo de lançamento" options={kinds} className="flex-wrap" />
        </div>
        <Totals large />
        <Panel className="gap-4 p-6">
          <div className="grid grid-cols-2 items-start gap-12">
            <TimelineDays days={fullTimeline.slice(0, 5)} />
            <TimelineDays days={fullTimeline.slice(5)} />
          </div>
          <Footer verb="Clique" />
        </Panel>
      </div>
    </Page>
  );
}
