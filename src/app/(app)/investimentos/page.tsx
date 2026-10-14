import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ShowValuesButton } from "@/components/layout/privacy-toggle";
import { Page } from "@/components/layout/page";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { PriceAlertList } from "@/features/alertas/components/price-alert-list";
import { priceAlerts } from "@/features/alertas/data";
import {
  AllocationCard,
  AssetsCard,
  DuplicateBanner,
  PortfolioCard,
} from "@/features/investimentos/components/overview-cards";
import { PositionCards } from "@/features/investimentos/components/position-cards";
import { WorldCard } from "@/features/investimentos/components/world-card";
import { SortArrows } from "@/features/investimentos/components/position-parts";
import { PositionsTable } from "@/features/investimentos/components/positions-table";
import { NewUserInvestments } from "@/features/novo/empty-screens";
import { cn } from "@/lib/utils";

function GroupToggle() {
  return (
    <div
      role="group"
      aria-label="Agrupar posições"
      className="flex gap-1 rounded-full bg-field p-1"
    >
      {["Lista", "Por classe"].map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={mode === "Por classe"}
          className={cn(
            "flex h-[2.125rem] items-center rounded-full border-none px-3.5 text-14 font-semibold whitespace-nowrap",
            mode === "Por classe" ? "bg-sand text-canvas" : "bg-transparent text-mist",
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

function SeeAll() {
  return (
    <Link href="/investimentos/posicoes" className={cn(panelLinkClass, "text-15")}>
      Ver as 12
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}

function PositionsSection({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  if (variant === "desktop") {
    return (
      <Panel className="gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
              Posições
            </h2>
            <p className="m-0 text-14 text-mist">12 posições · R$ 48.310,90</p>
          </div>
          <div className="flex items-center gap-4">
            <GroupToggle />
            <SeeAll />
          </div>
        </div>
        <PositionsTable />
        <p className="m-0 flex items-center gap-2 text-14 text-mist">
          <span className="text-caption">
            <Icon name="info" size={16} />
          </span>
          Risco calculado pelo cadastro do ativo (volatilidade, risco de crédito e liquidez). Clique
          no selo para ajustar. Preço médio aparece só quando foi informado.
        </p>
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
          <p className="m-0 text-13 text-mist">12 posições</p>
        </div>
        <SeeAll />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <GroupToggle />
        <button
          type="button"
          aria-label="Ordenar posições. Atual: maior valor primeiro. Opções: valor da posição ou % da carteira"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-transparent px-3 text-14 font-semibold text-sand"
        >
          <SortArrows active size={16} />
          Maior valor
          <Icon name="chevron-down" size={14} />
        </button>
      </div>
      <PositionCards columns={mobile ? 1 : 2} />
    </Panel>
  );
}

function AlertsSection({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const mobile = variant === "mobile";
  return (
    <Panel className={cn("gap-1", mobile && "p-4", variant === "desktop" && "grow")}>
      <PanelHeader
        title="Alertas de preço"
        subtitle="Aviso por notificação e e-mail"
        titleClassName={mobile ? "text-18 tracking-normal" : undefined}
        action={
          mobile ? (
            <Link href="/alertas/novo-preco" className={panelLinkClass}>
              Novo
              <Icon name="plus" size={16} />
            </Link>
          ) : (
            <ButtonLink href="/alertas/novo-preco" size="sm">
              <Icon name="plus" size={18} />
              <span>Novo</span>
            </ButtonLink>
          )
        }
      />
      <PriceAlertList
        items={variant === "tablet" ? priceAlerts.slice(0, 2) : priceAlerts}
        columns={variant === "desktop" ? 3 : 1}
      />
    </Panel>
  );
}

export default async function InvestimentosPage({ searchParams }: PageProps<"/investimentos">) {
  if ((await searchParams).estado === "novo") return <NewUserInvestments />;
  return (
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
      {/* Mobile */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <p className="m-0 text-13 text-caption">
          Cotações atualizadas às 14:30 · posições dos bancos conectados e cadastradas por você
        </p>
        <PortfolioCard variant="mobile" />
        <DuplicateBanner variant="mobile" />
        <AllocationCard variant="mobile" />
        <WorldCard variant="mobile" />
        <AssetsCard variant="mobile" />
        <AlertsSection variant="mobile" />
        <PositionsSection variant="mobile" />
      </div>

      {/* Tablet e desktop */}
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Investimentos
          </h1>
          <p className="m-0 text-15 text-mist">
            Cotações atualizadas às 14:30
            <span className="hidden @desk:inline">
              {" "}
              · posições dos bancos conectados e cadastradas por você
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShowValuesButton variant="pill" />
          <Link
            href="/perfil/investidor"
            className="flex h-[2.875rem] items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-14 whitespace-nowrap text-sand no-underline"
          >
            <Icon name="shield" size={18} />
            Perfil <strong>Moderado</strong>
            <span className="hidden text-caption @desk:inline">· alterar</span>
          </Link>
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
        <DuplicateBanner variant="tablet" />
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
        <DuplicateBanner variant="desktop" />
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
    </Page>
  );
}
