"use client";

import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ShowValuesButton } from "@/components/layout/privacy-toggle";
import { Page } from "@/components/layout/page";
import {
  CardAction,
  CardBody,
  CardNote,
  ScreenStateProvider,
} from "@/components/states/screen-state-context";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { StateBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { PriceAlertList } from "@/features/alertas/components/price-alert-list";
import {
  AllocationCard,
  AssetsCard,
  PortfolioCard,
  ProfileLink,
} from "@/features/investimentos/components/overview-cards";
import { DuplicatesNote } from "@/features/investimentos/components/duplicates-note";
import { PositionCards } from "@/features/investimentos/components/position-cards";
import { WorldCard } from "@/features/investimentos/components/world-card";
import { PositionsTable } from "@/features/investimentos/components/positions-table";
import { NewUserInvestments } from "@/features/novo/empty-screens";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useSession } from "@/features/acesso/session";
import {
  EMPTY_INVESTIMENTOS,
  InvestimentosDataProvider,
  PerformancePeriodProvider,
  useInvestimentosData,
} from "@/features/investimentos/context";
import { useInvestimentosView, usePerformance } from "@/features/investimentos/live";
import {
  emptyPerformance,
  withPerformance,
  type PerformancePeriod,
} from "@/features/investimentos/performance";
import { createContext, useContext, useState } from "react";

function SeeAll() {
  const { count } = useContext(PositionsCount);
  return (
    <Link href="/investimentos/posicoes" className={cn(panelLinkClass, "text-15")}>
      {`Ver as ${count}`}
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}

const noInvestments = (
  <StateBlock
    icon="trending-up"
    title="Nenhum investimento ainda"
    action={
      <ButtonLink href="/investimentos/novo" variant="forest" size="md" className="text-15">
        <span>Adicionar investimento</span>
      </ButtonLink>
    }
  >
    Conecte o banco ou a corretora pelo Open Finance, ou cadastre à mão. A carteira é comparada com
    o seu perfil.
  </StateBlock>
);

/** Quantas posições e o total, para o subtítulo da lista. */
const PositionsCount = createContext<{ count: number; total: string }>({ count: 0, total: "—" });

function PositionsSection({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const { count, total } = useContext(PositionsCount);
  const label = count === 1 ? "1 posição" : `${count} posições`;
  if (variant === "desktop") {
    return (
      <Panel className="gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
              Posições
            </h2>
            <p className="m-0 text-14 text-mist">
              <CardNote numbers>{`${label} · ${total}`}</CardNote>
            </p>
          </div>
          <CardAction>
            <SeeAll />
          </CardAction>
        </div>
        <CardBody main={noInvestments} className="grow gap-4">
          <PositionsTable />
          <p className="m-0 flex items-center gap-2 text-14 text-mist">
            <span className="text-caption">
              <Icon name="info" size={16} />
            </span>
            O risco é o padrão do tipo de investimento; dá para mudar na página da posição. Preço
            médio aparece só quando foi informado.
          </p>
        </CardBody>
      </Panel>
    );
  }
  const mobile = variant === "mobile";
  return (
    <Panel className={cn("gap-3", mobile && "p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2
            className={cn(
              "m-0 font-display leading-[1.25] font-bold",
              mobile ? "text-18" : "text-20",
            )}
          >
            Posições
          </h2>
          <p className="m-0 text-13 text-mist">
            <CardNote>{label}</CardNote>
          </p>
        </div>
        <CardAction>
          <SeeAll />
        </CardAction>
      </div>
      <CardBody main={noInvestments} className="grow gap-3">
        <PositionCards columns={mobile ? 1 : 2} />
      </CardBody>
    </Panel>
  );
}

function AlertsSection({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const { priceAlerts } = useInvestimentosData();
  const mobile = variant === "mobile";
  return (
    <Panel className={cn("gap-1", mobile && "p-4", variant === "desktop" && "grow")}>
      <PanelHeader
        title="Alertas de preço"
        subtitle={<CardNote>Aviso por notificação e e-mail</CardNote>}
        titleClassName={mobile ? "text-18 tracking-normal" : undefined}
        action={
          <CardAction>
            {mobile ? (
              <Link href="/alertas/novo-preco" className={panelLinkClass}>
                Novo
                <Icon name="plus" size={16} />
              </Link>
            ) : (
              <ButtonLink href="/alertas/novo-preco" size="sm">
                <Icon name="plus" size={18} />
                <span>Novo</span>
              </ButtonLink>
            )}
          </CardAction>
        }
      />
      <CardBody className="grow">
        <PriceAlertList
          items={variant === "tablet" ? priceAlerts.slice(0, 2) : priceAlerts}
          columns={variant === "desktop" ? 3 : 1}
        />
      </CardBody>
    </Panel>
  );
}

/** Investimentos: carteira, alocação, exposição por país, bens, alertas e posições (API). */
export function InvestimentosScreen() {
  const { live } = useSession();
  const real = useInvestimentosView({ enabled: live });
  // Período do gráfico de rentabilidade: 12 meses vem com a tela; 6M e Tudo, ao escolher.
  const [period, setPeriod] = useState<PerformancePeriod>("12m");
  const chosen = usePerformance(period, { enabled: live });
  if (real.data?.semInvestimentos) return <NewUserInvestments />;
  // Sem conta (sem as variáveis da API) não há o que mostrar: o mesmo aviso de erro.
  const state = real.error || !live ? "erro" : real.data ? null : "carregando";
  const view = real.data;
  const base = view ?? EMPTY_INVESTIMENTOS;
  const performance = chosen.error ? emptyPerformance(period) : chosen.performance;
  const data =
    view && performance
      ? { ...base, portfolio: withPerformance(base.portfolio, performance) }
      : base;
  const periodState = {
    period,
    setPeriod,
    loading: chosen.loading && !!view,
    error: !!chosen.error,
    retry: chosen.retry,
  };
  return (
    <InvestimentosDataProvider value={data}>
      <PerformancePeriodProvider value={periodState}>
        <PositionsCount value={{ count: view?.posicoes ?? 0, total: base.portfolio.patrimonio }}>
          <ScreenStateProvider state={state}>
            <Page
              padding="list"
              className="gap-4 lg:px-10 @tab:gap-5 @desk:gap-6"
              header={
                <MobileHeader
                  title="Investimentos"
                  account
                  actions={
                    <>
                      <ShowValuesButton variant="icon" />
                      <IconButtonLink
                        href="/investimentos/novo"
                        icon="plus"
                        label="Adicionar investimento"
                        variant="ghost"
                      />
                    </>
                  }
                />
              }
            >
              <Breadcrumb
                className="hidden flex-wrap @tab:flex"
                items={[{ label: "Investimentos" }]}
              />
              {state === "carregando" && <LoadingStatus />}
              <DuplicatesNote />
              {/* Mobile */}
              <div className="flex flex-col gap-4 @tab:hidden">
                <Skeleton active={state === "carregando"}>
                  <p className="m-0 text-13 text-caption">
                    {base.portfolio.atualizacao} · posições dos bancos conectados e cadastradas por
                    você
                  </p>
                  <PortfolioCard variant="mobile" />
                  <AllocationCard variant="mobile" />
                  <WorldCard variant="mobile" />
                  <AssetsCard variant="mobile" />
                  <AlertsSection variant="mobile" />
                  <PositionsSection variant="mobile" />
                </Skeleton>
              </div>

              {/* Tablet e desktop */}
              <header className="hidden items-end justify-between gap-4 @tab:flex">
                <div className="flex flex-col gap-1.5">
                  <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
                    Investimentos
                  </h1>
                  <p className="m-0 text-15 text-mist">
                    {base.portfolio.atualizacao}
                    <span className="hidden @desk:inline">
                      {" "}
                      · posições dos bancos conectados e cadastradas por você
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ShowValuesButton variant="pill" />
                  <ProfileLink
                    long
                    className="flex h-[2.875rem] items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-14 whitespace-nowrap text-sand no-underline"
                  />
                  <ButtonLink
                    href="/investimentos/novo"
                    size="md"
                    className="hidden text-15 @desk:inline-flex"
                  >
                    <Icon name="plus" size={18} />
                    <span>Adicionar</span>
                  </ButtonLink>
                  <ButtonLink
                    href="/simulador"
                    variant="primary"
                    size="md"
                    className="hidden text-15 @desk:inline-flex"
                  >
                    <Icon name="simulator" size={18} />
                    <span>Simular cenário</span>
                  </ButtonLink>
                </div>
              </header>

              <Skeleton active={state === "carregando"}>
                <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
                  <div className="flex gap-2.5">
                    <ButtonLink href="/investimentos/novo" size="md" className="text-15">
                      <Icon name="plus" size={18} />
                      <span>Adicionar investimento</span>
                    </ButtonLink>
                    <ButtonLink href="/simulador" variant="primary" size="md" className="text-15">
                      <Icon name="simulator" size={18} />
                      <span>Simular cenário</span>
                    </ButtonLink>
                  </div>
                  <div className="grid grid-cols-2 items-stretch gap-4">
                    <PortfolioCard variant="tablet" />
                    <AllocationCard variant="tablet" />
                  </div>
                  <WorldCard variant="tablet" />
                  <AssetsCard variant="tablet" />
                  <AlertsSection variant="tablet" />
                  <PositionsSection variant="tablet" />
                </div>

                <div className="hidden flex-col gap-6 @desk:flex">
                  <div className="grid grid-cols-2 gap-5">
                    <PortfolioCard variant="desktop" />
                    <AllocationCard variant="desktop" />
                  </div>
                  <div className="flex flex-col gap-5">
                    <PositionsSection variant="desktop" />
                    <div className="grid grid-cols-2 items-stretch gap-6">
                      <div className="flex min-w-0 flex-col gap-6">
                        <AssetsCard variant="desktop" />
                        <AlertsSection variant="desktop" />
                      </div>
                      <WorldCard variant="desktop" />
                    </div>
                  </div>
                </div>
              </Skeleton>
            </Page>
          </ScreenStateProvider>
        </PositionsCount>
      </PerformancePeriodProvider>
    </InvestimentosDataProvider>
  );
}
