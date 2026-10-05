import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { AddChip, FilterChips } from "@/components/ui/filter-chips";
import { Icon } from "@/components/ui/icon";
import { IconButton, iconButtonVariants } from "@/components/ui/icon-button";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { ExportMenu } from "@/features/relatorio/components/export-menu";
import {
  BalanceCard,
  ComparisonCard,
  TimelineCard,
  TotalsCard,
} from "@/features/relatorio/components/sections";
import { periodOptions, reportPeriod } from "@/features/relatorio/data";

export default function RelatorioPage() {
  return (
    <Page
      padding="list"
      className="gap-4 lg:pb-9 @tab:gap-[1.125rem] @desk:gap-6"
      header={
        <MobileHeader
          title="Relatório"
          subtitle={reportPeriod.range}
          back="/"
          actions={
            <>
              <IconButton
                icon="download"
                label="Exportar relatório em PDF, Excel ou CSV"
                variant="ghost"
              />
              <OpenChat
                agent="tamandua"
                aria-label="Perguntar ao Tamanduá sobre o relatório"
                className={iconButtonVariants({ variant: "ghost" })}
              >
                <Icon name="chat" />
              </OpenChat>
            </>
          }
        />
      }
    >
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-26 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            {reportPeriod.title}
          </h1>
          <p className="m-0 text-15 text-mist">
            {reportPeriod.range} · {reportPeriod.scope}
          </p>
        </div>
        <div className="flex items-center gap-2" />
      </header>

      <div className="flex flex-col gap-4 @tab:flex-row @tab:items-center @tab:justify-between @tab:gap-3 @desk:gap-4">
        <FilterChips
          label="Período"
          options={periodOptions}
          defaultValue="mes"
          size="base"
          wrap={false}
          className="gap-1.5 @tab:flex-wrap @tab:overflow-visible"
          trailing={
            <AddChip icon="calendar" className="h-10 px-3.5">
              Personalizado
            </AddChip>
          }
        />
        <ExportMenu />
      </div>

      <TotalsCard />
      <BalanceCard />

      <div className="flex flex-col gap-4 @desk:grid @desk:grid-cols-2 @desk:items-stretch @desk:gap-5">
        <TimelineCard />
        <ComparisonCard />
      </div>
    </Page>
  );
}
