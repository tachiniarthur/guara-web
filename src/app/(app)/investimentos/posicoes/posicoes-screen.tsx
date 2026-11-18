"use client";

import Link from "next/link";
import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import type { ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock, NoDataBlock, StateSwap } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { HoldingsBrowser } from "@/features/investimentos/components/holdings-browser";
import { RiskDialog } from "@/features/investimentos/components/risk-dialog";
import { useSession } from "@/features/acesso/session";
import { useHoldings, type HoldingsData } from "@/features/investimentos/posicoes";

/** Enquanto a API responde: a forma da tela, sem posições. */
const EMPTY_HOLDINGS: HoldingsData = {
  classes: [],
  total: "—",
  quantidade: 0,
  atualizacao: "",
  porOrigem: [],
};

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rounded-[3px]"
      style={{ backgroundColor: color }}
    />
  );
}

/** Desktop: total com a divisão por classe, as classes e as origens das posições. */
function SummaryCards({ data, state }: { data: HoldingsData; state: ScreenState | null }) {
  const { classes: holdingClasses } = data;
  const replacement = state === "erro" ? <ErrorBlock /> : state === "vazio" && <NoDataBlock />;
  const divisao = holdingClasses
    .map((c) => `${c.classe.toLowerCase()} ${c.percentual.replace(",0%", "%")}`)
    .join(", ");
  return (
    <div className="hidden grid-cols-3 items-stretch gap-5 @desk:grid">
      <Panel className="gap-2.5 p-6">
        <StateSwap replacement={replacement} className="grow gap-2.5">
          <span className="text-14 text-mist">Total da carteira</span>
          <span className="font-display text-38 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
            {data.total}
          </span>
          <span className="text-14 text-mist">
            {data.quantidade === 1 ? "1 posição" : `${data.quantidade} posições`} ·{" "}
            {data.atualizacao}
          </span>
          <div
            role="img"
            aria-label={`Divisão por classe: ${divisao}`}
            className="flex gap-0.5 overflow-hidden rounded-md"
          >
            {holdingClasses.map((c) => (
              <span
                key={c.classe}
                className="h-3"
                style={{ width: c.percentual.replace(",", "."), backgroundColor: c.cor }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {holdingClasses.map((c) => (
              <span key={c.classe} className="inline-flex items-center gap-1.5 text-13 text-mist">
                <Swatch color={c.cor} />
                {`${c.classe} ${c.percentual}`}
              </span>
            ))}
          </div>
        </StateSwap>
      </Panel>
      <Panel className="p-6">
        <PanelHeader
          title="Por classe"
          subtitle={holdingClasses.length === 1 ? "1 classe" : `${holdingClasses.length} classes`}
          titleClassName="text-19 tracking-normal"
        />
        <StateSwap replacement={replacement} className="grow">
          <ul className="m-0 flex list-none flex-col p-0">
            {holdingClasses.map((c, i) => (
              <li
                key={c.classe}
                className={`flex items-center gap-3 py-3 ${i < holdingClasses.length - 1 ? "border-b border-line" : ""}`}
              >
                <Swatch color={c.cor} />
                <span className="min-w-0 grow leading-[1.35] font-medium">{c.classe}</span>
                <span className="flex shrink-0 flex-col items-end leading-[1.35]">
                  <span className="font-bold whitespace-nowrap tabular-nums">{c.total}</span>
                  <span className="text-12 whitespace-nowrap text-caption">{c.percentual}</span>
                </span>
              </li>
            ))}
          </ul>
        </StateSwap>
      </Panel>
      <Panel className="p-6">
        <PanelHeader title="Por origem" titleClassName="text-19 tracking-normal" />
        <StateSwap replacement={replacement} className="grow gap-3.5">
          <DetailList items={data.porOrigem} />
          <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-shade px-3.5 py-3 text-13 leading-normal">
            <span className="mt-px text-mist">
              <Icon name="info-lg" size={16} />
            </span>
            <span>
              Clique no selo de risco para ajustar. O risco é o padrão do tipo de investimento e a
              mudança vale só para a sua carteira.
            </span>
          </div>
        </StateSwap>
      </Panel>
    </div>
  );
}

/** Todas as posições da carteira (API), com busca, agrupamento, ordenação e ajuste de risco. */
export function PosicoesScreen() {
  const { live } = useSession();
  const real = useHoldings({ enabled: live });
  const data = real.data ?? EMPTY_HOLDINGS;
  const state: ScreenState | null =
    real.error || !live
      ? "erro"
      : !real.data
        ? "carregando"
        : data.quantidade === 0
          ? "vazio"
          : null;
  const count = data.quantidade === 1 ? "1 posição" : `${data.quantidade} posições`;
  return (
    <>
      <Page
        padding="detail"
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={<MobileHeader title="Posições" back="/investimentos" balanced />}
      >
        {state === "carregando" && <LoadingStatus />}
        <Breadcrumb
          className="hidden flex-wrap @tab:flex"
          items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Posições" }]}
        />
        <DetailHeader
          title="Todas as posições"
          subtitle={real.data ? `${count} · ${data.total} · ${data.atualizacao}` : undefined}
          actions={
            <ButtonLink href="/investimentos/novo" variant="secondary" size="sm">
              <Icon name="plus" size={18} />
              <span>Adicionar</span>
            </ButtonLink>
          }
        />
        <Skeleton active={state === "carregando"}>
          <div className="flex items-center gap-2.5 @tab:hidden">
            <span className="grow text-14 text-mist">
              {real.data ? `${count} · ${data.atualizacao}` : ""}
            </span>
            <Link
              href="/investimentos/novo"
              className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
            >
              Adicionar
              <Icon name="plus" size={16} />
            </Link>
          </div>
        </Skeleton>
        <Skeleton active={state === "carregando"}>
          <SummaryCards data={data} state={state} />
          <HoldingsBrowser data={data} state={state} />
        </Skeleton>
        {state === null && (
          <p className="m-0 text-13 leading-[1.55] text-caption @desk:hidden">
            Toque no selo de risco para ajustar. Preço médio aparece só quando foi informado.
          </p>
        )}
      </Page>
      <Suspense>
        <RiskDialog holdings={data} />
      </Suspense>
    </>
  );
}
