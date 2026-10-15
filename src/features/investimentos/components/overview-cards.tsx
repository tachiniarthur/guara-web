import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { chipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { CardAction, CardBody, CardNote } from "@/components/states/screen-state-context";
import { ErrorBlock, NoDataBlock } from "@/components/states/state-block";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import {
  donutSizes,
  GroupBarHeading,
  GroupBarList,
  GroupLegend,
  PortfolioVsTarget,
} from "@/features/alocacao/components/allocation-parts";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import { otherAssets, portfolio } from "../data";
import { PerformanceChart } from "./charts";

type Variant = "desktop" | "tablet" | "mobile";

function PeriodChips({ size }: { size: "md" | "sm" }) {
  return (
    <div role="group" aria-label="Período do gráfico" className="flex gap-1.5">
      {["6M", "12M", "Tudo"].map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={p === "12M"}
          className={cn(chipClass(p === "12M"), size === "sm" && "h-8 px-3 text-13 font-semibold")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function StatsList() {
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
  if (compact) {
    return (
      <div className="flex flex-col gap-0.5 rounded-tile border border-line px-3.5 py-3 text-12 text-caption">
        <span className="text-13 text-mist">Patrimônio total com bens</span>
        <strong className="text-18 text-sand tabular-nums">{portfolio.totalComBens}</strong>
        <span>investimentos + bens de R$ 698.500</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-tile border border-line px-4 py-3 text-13 text-mist">
      <span>Patrimônio total com bens</span>
      <strong className="text-16 text-sand tabular-nums">{portfolio.totalComBens}</strong>
      <span>investimentos R$ 48.310,90 + bens R$ 698.500</span>
    </div>
  );
}

/** Patrimônio investido, rentabilidade em 12 meses e números do ano. */
export function PortfolioCard({ variant }: { variant: Variant }) {
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
          <PerformanceChart variant="desktop" />
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
          <PerformanceChart variant="tablet" />
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
          <Link
            href="/perfil/investidor"
            className="flex min-h-8 items-center gap-1 text-13 text-sand"
          >
            <Icon name="shield" size={16} />
            Moderado
          </Link>
        </div>
        <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {portfolio.patrimonio}
        </span>
        <span className="text-14 font-bold text-folha">{portfolio.variacaoMes}</span>
        <div className="mt-2">
          <PeriodChips size="sm" />
        </div>
        <div className="mt-2 flex items-center justify-between text-13 text-caption">
          <span>Rentabilidade em 12 meses</span>
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
        <PerformanceChart variant="mobile" />
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

/** Alocação atual × alvo do perfil, grupo por grupo (5 grupos). */
export function AllocationCard({ variant }: { variant: Variant }) {
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
        subtitle={<CardNote>Sua carteira comparada ao perfil Moderado, em 5 grupos</CardNote>}
        titleClassName={desktop ? undefined : "text-18"}
        action={desktop ? <CardAction>{fullLink}</CardAction> : undefined}
      />
      <CardBody className="grow gap-4">
        <PortfolioVsTarget
          dims={desktop ? donutSizes.lg : mobile ? donutSizes.sm : donutSizes.xs}
          titleClassName={variant === "tablet" ? "text-13" : "text-14"}
          gapClassName={variant === "tablet" ? "gap-2" : "gap-3"}
        />
        {variant !== "tablet" && <GroupLegend />}
        <div className="flex flex-col gap-1.5 border-t border-line pt-3.5">
          <GroupBarHeading />
          <GroupBarList stacked={!desktop} />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
          <p className="m-0 text-13 text-mist">
            Fora do alvo em <strong className="text-sand">3 de 5 grupos</strong>
            {variant === "tablet" ? (
              "."
            ) : (
              <>
                . A maior diferença é <strong className="text-tucano">Renda variável Brasil</strong>
                , <strong className="text-sand">17,2 p.p. acima</strong>.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {!desktop && fullLink}
            <OpenChat
              agent="pacu"
              question="Como rebalancear minha carteira?"
              className={linkClass}
            >
              Rebalancear com o Pacu
              <Icon name="chevron-right" size={16} />
            </OpenChat>
          </div>
        </div>
      </CardBody>
    </Panel>
  );
}

/** Imóveis, veículos e outros bens (entram no patrimônio, fora da alocação). */
export function AssetsCard({ variant }: { variant: Variant }) {
  if (variant === "mobile") {
    return (
      <Panel className="gap-2 p-4">
        <PanelHeader
          title="Imóveis e outros bens"
          subtitle={<CardNote numbers>Somam R$ 698.500 no patrimônio</CardNote>}
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
            Bens não entram na alocação do seu perfil. Veículos seguem a Tabela FIPE; imóveis, o
            valor que você informar.
          </p>
        </CardBody>
      </Panel>
    );
  }

  return (
    <Panel className="gap-3">
      <PanelHeader
        title="Imóveis, veículos e outros bens"
        subtitle={<CardNote numbers>Somam R$ 698.500 · entram no patrimônio total</CardNote>}
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
          Bens não entram na alocação do seu perfil de investidor. Veículos são atualizados pela
          Tabela FIPE; imóveis, pelo valor que você informar.
        </p>
      </CardBody>
    </Panel>
  );
}

/** Aviso de posição possivelmente duplicada (Open Finance × cadastro manual). */
export function DuplicateBanner({ variant }: { variant: Variant }) {
  if (variant === "mobile") {
    return (
      <section
        aria-label="Possível duplicidade"
        className="flex flex-col gap-2.5 rounded-bubble border border-tucano bg-tucano-bg p-4"
      >
        <CardBody className="grow gap-2.5">
          <strong className="text-15">Possível duplicidade</strong>
          <span className="text-14 text-mist">
            “Tesouro Selic 2029” veio do Itaú e também está no seu cadastro manual.
          </span>
          <div className="flex flex-col gap-2">
            <Button variant="light" size="md" block>
              <Icon name="merge" size={18} />
              <span>Somar em uma posição</span>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button size="md">
                <span>Manter separados</span>
              </Button>
              <Button size="md">
                <span>Excluir um</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </section>
    );
  }

  const actions = (
    <>
      <Button variant="light" size="sm">
        <Icon name="merge" size={18} />
        <span>Somar em uma posição</span>
      </Button>
      <Button size="sm">
        <span>Manter separados</span>
      </Button>
      <Button size="sm">
        <span>Excluir um</span>
      </Button>
    </>
  );

  if (variant === "tablet") {
    return (
      <section
        aria-label="Possível duplicidade"
        className="flex flex-col gap-2.5 rounded-bubble border border-tucano bg-tucano-bg px-4.5 py-4"
      >
        <CardBody
          className="grow gap-2.5"
          error={<ErrorBlock compact />}
          empty={<NoDataBlock compact />}
        >
          <strong className="text-15">Este investimento pode estar duplicado</strong>
          <span className="text-14 leading-normal text-mist">
            “Tesouro Selic 2029” chegou pelo Itaú e também foi cadastrado por você em agosto. Como
            prefere tratar?
          </span>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </CardBody>
      </section>
    );
  }

  return (
    <section
      aria-label="Possível duplicidade"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-bubble border border-tucano bg-tucano-bg px-5 py-4"
    >
      <CardBody
        className="grow flex-row flex-wrap items-center gap-x-4 gap-y-3"
        overlayClassName="items-center"
        error={<ErrorBlock compact />}
        empty={<NoDataBlock compact />}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-tucano">
          <Icon name="copy" size={18} strokeWidth={1.8} />
        </span>
        <div className="flex flex-[1_1_25rem] flex-col leading-[1.4]">
          <strong className="text-15">Este investimento pode estar duplicado</strong>
          <span className="text-14 text-mist">
            “Tesouro Selic 2029” chegou pelo Itaú e também foi cadastrado por você em agosto. Como
            prefere tratar?
          </span>
        </div>
        <div className="ml-13 flex gap-2">{actions}</div>
      </CardBody>
    </section>
  );
}
