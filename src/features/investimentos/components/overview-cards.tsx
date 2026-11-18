"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ChartFit } from "@/components/charts/chart-fit";
import { ButtonLink } from "@/components/ui/button";
import { chipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { CardAction, CardBody, CardNote } from "@/components/states/screen-state-context";
import { CompactStateBlock, RetryButton } from "@/components/states/state-block";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import {
  AllocationVsTarget,
  ClassBarHeading,
  ClassBarList,
  ClassLegend,
  OffTargetSummary,
} from "@/features/alocacao/components/class-allocation";
import { donutSizes } from "@/features/alocacao/components/donut";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import { useInvestimentosData, usePerformancePeriod } from "../context";
import { PERFORMANCE_PERIODS, performanceTitle } from "../performance";
import { PerformanceChart } from "./charts";

type Variant = "desktop" | "tablet" | "mobile";

function PeriodChips({ size }: { size: "md" | "sm" }) {
  const { period, setPeriod } = usePerformancePeriod();
  return (
    <div role="group" aria-label="Período do gráfico" className="flex gap-1.5">
      {PERFORMANCE_PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          aria-pressed={p.value === period}
          aria-label={`${p.label}: rentabilidade ${p.texto}`}
          onClick={() => setPeriod(p.value)}
          className={cn(
            chipClass(p.value === period),
            size === "sm" && "h-8 px-3 text-13 font-semibold",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Gráfico de rentabilidade do período escolhido. Enquanto o novo período carrega, a curva anterior
 * fica esmaecida (sem se redesenhar); se o período não vier, o aviso ocupa o lugar do gráfico.
 */
function PerformanceArea({ children }: { children: ReactNode }) {
  const { loading, error, retry } = usePerformancePeriod();
  if (error) {
    return (
      <div className="flex min-h-36 items-center rounded-tile border border-line px-4 py-3">
        <CompactStateBlock
          icon="alert-triangle"
          tone="error"
          title="Não deu para carregar o período"
          action={<RetryButton compact onClick={retry} />}
        >
          Tente de novo ou escolha outro período.
        </CompactStateBlock>
      </div>
    );
  }
  return (
    <div
      aria-busy={loading || undefined}
      className={cn(
        "transition-opacity duration-(--duration-hover) ease-out-soft",
        loading && "opacity-45",
      )}
    >
      {children}
    </div>
  );
}

function StatsList() {
  const { portfolio } = useInvestimentosData();
  return (
    <dl className="m-0 mt-auto flex flex-col">
      {portfolio.stats.map((stat) => (
        <div
          key={stat.id}
          className="flex items-baseline justify-between gap-3 border-t border-line py-2.5"
        >
          <dt className="flex min-w-0 flex-col leading-[1.35]">
            <span className="text-14 text-mist">{stat.rotulo}</span>
            <span className="text-12 text-caption">{stat.detalhe}</span>
          </dt>
          <dd
            className={cn(
              "m-0 text-16 font-bold whitespace-nowrap tabular-nums",
              stat.ganho ? "text-folha" : "text-sand",
            )}
          >
            {stat.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TotalWithAssets({ compact }: { compact?: boolean }) {
  const { portfolio } = useInvestimentosData();
  if (compact) {
    return (
      <div className="flex flex-col gap-0.5 rounded-tile border border-line px-3.5 py-3 text-12 text-caption">
        <span className="text-13 text-mist">Patrimônio total com bens</span>
        <strong className="text-18 text-sand tabular-nums">{portfolio.totalComBens}</strong>
        <span>investimentos + bens de {portfolio.bens}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-tile border border-line px-4 py-3 text-13 text-mist">
      <span>Patrimônio total com bens</span>
      <strong className="text-16 text-sand tabular-nums">{portfolio.totalComBens}</strong>
      <span>
        investimentos {portfolio.investido} + bens {portfolio.bens}
      </span>
    </div>
  );
}

/** Patrimônio investido, rentabilidade no período escolhido (6M, 12M, Tudo) e números do ano. */
export function PortfolioCard({ variant }: { variant: Variant }) {
  const { portfolio } = useInvestimentosData();
  if (variant === "desktop") {
    return (
      <Panel className="gap-4 p-6">
        <CardBody className="grow gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-14 text-mist">Patrimônio investido</span>
              <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
                {portfolio.patrimonio}
              </span>
              <span className="text-14 font-bold text-folha">{portfolio.variacaoMes}</span>
            </div>
            <PeriodChips size="md" />
          </div>
          <PerformanceArea>
            <ChartFit
              narrow={<PerformanceChart variant="mobile" />}
              wide={<PerformanceChart variant="desktop" />}
            />
          </PerformanceArea>
          <div className="mt-auto grid grid-cols-3 gap-3">
            {portfolio.stats.map((stat) => (
              <div
                key={stat.id}
                className="flex min-w-0 flex-col gap-0.5 rounded-tile bg-field px-4 py-3.5"
              >
                <span className="text-13 text-caption">{stat.rotulo}</span>
                <strong
                  className={cn(
                    "font-display text-22 tabular-nums",
                    stat.ganho ? "text-folha" : "text-sand",
                  )}
                >
                  {stat.valor}
                </strong>
                <span className="text-12 text-mist">{stat.detalhe}</span>
              </div>
            ))}
          </div>
          <TotalWithAssets />
        </CardBody>
      </Panel>
    );
  }

  if (variant === "tablet") {
    return (
      <Panel className="gap-3">
        <CardBody className="grow gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-14 text-mist">Patrimônio investido</span>
            <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
              {portfolio.patrimonio}
            </span>
            <span className="text-14 font-bold text-folha">{portfolio.variacaoMes}</span>
          </div>
          <PeriodChips size="sm" />
          <PerformanceArea>
            <ChartFit
              narrow={<PerformanceChart variant="mobile" />}
              wide={<PerformanceChart variant="desktop" />}
            />
          </PerformanceArea>
          <StatsList />
          <TotalWithAssets compact />
        </CardBody>
      </Panel>
    );
  }

  return (
    <Panel className="gap-2 p-4.5">
      <CardBody className="grow gap-2">
        <div className="flex items-center justify-between">
          <span className="text-14 text-mist">Patrimônio investido</span>
          <ProfileLink className="flex min-h-8 items-center gap-1 text-13 text-sand" />
        </div>
        <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {portfolio.patrimonio}
        </span>
        <span className="text-14 font-bold text-folha">{portfolio.variacaoMes}</span>
        <div className="mt-2">
          <PeriodChips size="sm" />
        </div>
        <div className="mt-2 flex items-center justify-between text-13 text-caption">
          <span>{performanceTitle(portfolio.rentabilidade.periodo)}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-0.5 w-3.5 bg-folha" />
              Carteira
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-0 w-3.5 border-t-2 border-dashed border-caption"
              />
              CDI
            </span>
          </span>
        </div>
        <PerformanceArea>
          <PerformanceChart variant="mobile" />
        </PerformanceArea>
        <div className="h-1" />
        <StatsList />
        <TotalWithAssets compact />
        <ButtonLink href="/simulador" variant="primary" size="md" block className="text-15">
          <Icon name="simulator" size={18} />
          <span>Simular cenário</span>
        </ButtonLink>
      </CardBody>
    </Panel>
  );
}

/** O perfil de investidor (ou o convite para responder), com link para o questionário. */
export function ProfileLink({ className, long }: { className?: string; long?: boolean }) {
  const { alocacao } = useInvestimentosData();
  const nome = alocacao.perfil?.nome;
  return (
    <Link href="/perfil/investidor" className={className}>
      <Icon name="shield" size={long ? 18 : 16} />
      {nome ? (
        long ? (
          <>
            Perfil <strong>{nome}</strong>
          </>
        ) : (
          nome
        )
      ) : (
        "Definir perfil"
      )}
      {long && nome && <span className="hidden text-caption @desk:inline">· alterar</span>}
    </Link>
  );
}

/** Alocação atual × alvo do perfil, classe por classe (as quatro classes da API). */
export function AllocationCard({ variant }: { variant: Variant }) {
  const { alocacao, positionGroups, portfolio } = useInvestimentosData();
  const ativos =
    positionGroups.reduce((sum, g) => sum + g.posicoes.length, 0) + portfolio.outras.quantidade;
  const desktop = variant === "desktop";
  const mobile = variant === "mobile";
  const linkClass =
    "inline-flex min-h-6 items-center gap-1 border-none bg-transparent p-0 text-14 font-bold whitespace-nowrap text-sand underline hover:text-tucano";
  const fullLink = (
    <Link href="/investimentos/alocacao" className={linkClass}>
      Ver alocação completa
      <Icon name="chevron-right" size={16} />
    </Link>
  );
  return (
    <Panel className={cn("gap-4", desktop ? "p-6" : mobile ? "p-4" : undefined)}>
      <PanelHeader
        title="Alocação"
        subtitle={
          <CardNote>
            {alocacao.perfil
              ? `Sua carteira comparada ao perfil ${alocacao.perfil.nome}`
              : "Sua carteira por classe"}
          </CardNote>
        }
        titleClassName={desktop ? undefined : "text-18"}
        action={desktop ? <CardAction>{fullLink}</CardAction> : undefined}
      />
      <CardBody className="grow gap-4">
        <AllocationVsTarget
          allocation={alocacao}
          ativos={ativos}
          dims={desktop ? donutSizes.lg : donutSizes.sm}
          titleClassName={variant === "tablet" ? "text-13" : "text-14"}
          gapClassName={variant === "tablet" ? "gap-2" : "gap-3"}
        />
        {variant !== "tablet" && <ClassLegend classes={alocacao.classes} />}
        <div className="flex flex-col gap-1.5 border-t border-line pt-3.5">
          <ClassBarHeading withTarget={alocacao.perfil !== null} />
          <ClassBarList allocation={alocacao} stacked={!desktop} />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
          <OffTargetSummary allocation={alocacao} withBiggest={variant !== "tablet"} />
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {!desktop && fullLink}
            {alocacao.perfil && (
              <OpenChat
                question="Como está minha carteira em relação ao meu perfil?"
                className={linkClass}
              >
                Conversar com o Guará
                <Icon name="chevron-right" size={16} />
              </OpenChat>
            )}
          </div>
        </div>
      </CardBody>
    </Panel>
  );
}

function NoAssets() {
  return (
    <p className="m-0 py-2 text-14 text-mist">
      Nenhum imóvel ou veículo cadastrado. Eles entram no patrimônio total, fora da alocação.
    </p>
  );
}

/** Imóveis e veículos (entram no patrimônio, fora da alocação). */
export function AssetsCard({ variant }: { variant: Variant }) {
  const { otherAssets, portfolio } = useInvestimentosData();
  if (variant === "mobile") {
    return (
      <Panel className="gap-2 p-4">
        <PanelHeader
          title="Imóveis e veículos"
          subtitle={<CardNote numbers>Somam {portfolio.bens} no patrimônio</CardNote>}
          titleClassName="text-18 tracking-normal"
          action={
            <CardAction>
              <Link
                href="/investimentos/novo"
                aria-label="Adicionar bem"
                className={panelLinkClass}
              >
                Novo
                <Icon name="plus" size={16} />
              </Link>
            </CardAction>
          }
        />
        <CardBody className="grow gap-2">
          {otherAssets.length === 0 && <NoAssets />}
          <ul className="m-0 list-none p-0">
            {otherAssets.map((a) => (
              <li key={a.id} className="border-b border-line">
                <Link
                  href={`/investimentos/bens/${a.id}`}
                  className="flex items-start gap-3 py-3 text-sand no-underline"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-shade text-tucano"
                  >
                    <Icon name={a.icone} />
                  </span>
                  <span className="flex min-w-0 grow flex-col gap-0.5 leading-[1.35]">
                    <span className="flex items-baseline justify-between gap-2">
                      <strong className="min-w-0 text-15">{a.nome}</strong>
                      <strong className="text-15 whitespace-nowrap tabular-nums">{a.valor}</strong>
                    </span>
                    <span className="text-13 text-mist">{a.detalheCurto}</span>
                    <span className="text-12 text-caption">{a.fonteCurta}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="m-0 text-13 leading-normal text-mist">
            Bens não entram na alocação do seu perfil. Imóveis e veículos valem o que você informar.
          </p>
        </CardBody>
      </Panel>
    );
  }

  return (
    <Panel className="gap-3">
      <PanelHeader
        title="Imóveis e veículos"
        subtitle={<CardNote numbers>Somam {portfolio.bens} · entram no patrimônio total</CardNote>}
        action={
          <CardAction>
            <Link
              href="/investimentos/novo"
              className="inline-flex h-[2.625rem] shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-13 font-bold whitespace-nowrap text-sand no-underline"
            >
              <Icon name="plus" size={16} />
              Adicionar bem
            </Link>
          </CardAction>
        }
      />
      <CardBody className="grow gap-3">
        {otherAssets.length === 0 && <NoAssets />}
        <ul className="m-0 list-none p-0">
          {otherAssets.map((a) => (
            <li key={a.id} className="border-b border-line">
              <Link
                href={`/investimentos/bens/${a.id}`}
                className="flex items-center gap-3.5 py-3 text-sand no-underline"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-shade text-tucano"
                >
                  <Icon name={a.icone} />
                </span>
                <span className="flex min-w-0 grow flex-col leading-[1.35]">
                  <strong className="text-15">{a.nome}</strong>
                  <span className="text-12 text-caption">{a.detalhe}</span>
                </span>
                <span className="flex flex-col items-end text-right leading-[1.35]">
                  <strong className="text-15 whitespace-nowrap tabular-nums">{a.valor}</strong>
                  <span className="text-12 text-caption">{a.fonte}</span>
                  <span className="text-12 text-mist">{a.extra}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="m-0 text-13 leading-normal text-mist">
          Bens não entram na alocação do seu perfil de investidor. Imóveis e veículos valem o que
          você informar; atualize o valor quando ele mudar.
        </p>
      </CardBody>
    </Panel>
  );
}
