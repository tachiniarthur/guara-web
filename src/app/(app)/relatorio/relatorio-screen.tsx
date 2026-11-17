"use client";

import { Suspense, useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AddChip, FilterChips } from "@/components/ui/filter-chips";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink, iconButtonVariants } from "@/components/ui/icon-button";
import { useSession } from "@/features/acesso/session";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { ExportDialogs } from "@/features/relatorio/components/export-dialogs";
import { ExportMenu } from "@/features/relatorio/components/export-menu";
import {
  BalanceCard,
  ComparisonCard,
  TimelineCard,
  TotalsCard,
} from "@/features/relatorio/components/sections";
import { periodOptions, placeholderReport, prototypeReport } from "@/features/relatorio/data";
import { useReportView, type ReportPeriodId } from "@/features/relatorio/live";

/** `estado`: estados do protótipo (`?estado=`), abertos pela prévia (ver `src/proxy.ts`). */
export function RelatorioScreen({ estado }: { estado?: string }) {
  const { live } = useSession();
  const [period, setPeriod] = useState<ReportPeriodId>("mes");
  const report = useReportView(period, { enabled: live });
  // Com login: carregando até a API responder, erro se ela falhar, vazio sem movimentos.
  const state = live
    ? report.error
      ? "erro"
      : !report.data
        ? "carregando"
        : report.data.empty
          ? "vazio"
          : null
    : parseScreenState(estado);
  const view = live ? (report.data ?? placeholderReport) : prototypeReport;
  const range = view.period.range;
  const exportPeriod = live
    ? {
        period,
        label: periodOptions.find((option) => option.value === period)?.label ?? "Este mês",
        range,
      }
    : undefined;
  return (
    <>
      <Page
        padding="list"
        className="gap-4 lg:pb-9 @tab:gap-[1.125rem] @desk:gap-6"
        header={
          <MobileHeader
            title="Relatório"
            subtitle={range}
            back="/"
            actions={
              <>
                <IconButtonLink
                  href="/relatorio?exportar"
                  scroll={false}
                  icon="download"
                  label="Exportar relatório em PDF, Excel ou CSV"
                  variant="ghost"
                />
                <OpenChat
                  fresh
                  aria-label="Perguntar ao Guará sobre o relatório"
                  className={iconButtonVariants({ variant: "ghost" })}
                >
                  <Icon name="chat" />
                </OpenChat>
              </>
            }
          />
        }
      >
        <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Relatórios" }]} />
        {state === "carregando" && <LoadingStatus />}
        <header className="hidden items-end justify-between gap-4 @tab:flex">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-26 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
              {view.period.title}
            </h1>
            <p className="m-0 text-15 text-mist">{`${range} · ${view.period.scope}`}</p>
          </div>
          <div className="flex items-center gap-2" />
        </header>

        {/* O filtro de período fica ativo enquanto o novo período carrega. */}
        <Skeleton active={!live && state === "carregando"}>
          {/* Acima dos cards: o menu de Exportar abre por cima deles. */}
          <div className="relative z-10 flex flex-col gap-4 @tab:flex-row @tab:items-center @tab:justify-between @tab:gap-3 @desk:gap-4">
            <FilterChips
              label="Período"
              options={periodOptions}
              value={live ? period : undefined}
              onChange={(value) => setPeriod(value as ReportPeriodId)}
              defaultValue="mes"
              size="base"
              wrap={false}
              className="gap-1.5 @tab:flex-wrap @tab:overflow-visible"
              trailing={
                // Período personalizado ainda é só do protótipo.
                !live && (
                  <AddChip icon="calendar" className="h-10 px-3.5">
                    Personalizado
                  </AddChip>
                )
              }
            />
            <ExportMenu live={exportPeriod} />
          </div>
        </Skeleton>

        <Skeleton active={state === "carregando"}>
          <TotalsCard state={state} view={view} />
          <BalanceCard state={state} view={view} />

          <div className="flex flex-col gap-4 @desk:grid @desk:grid-cols-2 @desk:items-stretch @desk:gap-5">
            <TimelineCard state={state} view={view} />
            <ComparisonCard state={state} view={view} />
          </div>
        </Skeleton>
      </Page>
      <Suspense>
        <ExportDialogs live={exportPeriod} />
      </Suspense>
    </>
  );
}
