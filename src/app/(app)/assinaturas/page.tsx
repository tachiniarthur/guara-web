import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { OFFLINE_NOTE, parseScreenState, type ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import {
  ErrorBlock,
  FilterEmptyBlock,
  NoDataBlock,
  StateBlock,
  StateSwap,
  TileEmptyBlock,
  TileErrorBlock,
} from "@/components/states/state-block";
import { inlineLinkClass } from "@/components/ui/text-link";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { BillingCalendar } from "@/features/assinaturas/components/billing-calendar";
import { SubscriptionDetailList } from "@/features/assinaturas/components/subscription-detail-list";
import { subscriptions, subscriptionTotals } from "@/features/assinaturas/data";

type Props = { state: ScreenState | null };

/**
 * Tiles sem título (total e dica) no erro e no vazio: no celular e no tablet, o aviso curto
 * empilhado; no desktop, a versão em linha.
 */
function tileState(state: ScreenState | null) {
  if (state === "erro") {
    return (
      <>
        <TileErrorBlock className="@desk:hidden" />
        <ErrorBlock compact className="hidden @desk:flex" />
      </>
    );
  }
  if (state === "vazio") {
    return (
      <>
        <TileEmptyBlock className="@desk:hidden" />
        <NoDataBlock compact className="hidden @desk:flex" />
      </>
    );
  }
  return null;
}

function TotalCard({ state }: Props) {
  return (
    <StateSwap
      replacement={tileState(state)}
      overlayClassName="rounded-card border border-line bg-card p-5"
    >
      <TotalPanel />
    </StateSwap>
  );
}

function TotalPanel() {
  return (
    <Panel className="gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-14 text-mist">Total em assinaturas</span>
        <span className="font-display text-32 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums @tab:text-36">
          {subscriptionTotals.mensal}
          <span className="text-16 font-medium text-mist"> /mês</span>
        </span>
        <span className="text-14 text-mist">{subscriptionTotals.anual}</span>
      </div>
    </Panel>
  );
}

function PrimeTip({ state, className }: Props & { className?: string }) {
  return (
    <StateSwap
      replacement={tileState(state)}
      overlayClassName="rounded-bubble bg-shade p-4"
      className={className}
    >
      <PrimeTipBubble className={className} />
    </StateSwap>
  );
}

function PrimeTipBubble({ className }: { className?: string }) {
  return (
    <AgentTip
      agent="tamandua"
      className={className}
      action={
        <Button size="sm">
          <Icon name="chat" size={18} />
          <span>Perguntar ao Tamanduá</span>
        </Button>
      }
    >
      Você não comprou na Amazon nos últimos 60 dias. Se cancelar o Prime, economiza{" "}
      <strong>R$ 238,80 por ano</strong>.
    </AgentTip>
  );
}

function CalendarCard({ state }: Props) {
  return (
    <Panel className="gap-3">
      <PanelHeader
        title={
          <Link href="/assinaturas/calendario" className={inlineLinkClass}>
            Cobranças de outubro
          </Link>
        }
        titleClassName="text-18 tracking-normal"
      />
      <StateSwap
        replacement={state === "erro" ? <ErrorBlock /> : state === "vazio" ? <NoDataBlock /> : null}
        className="grow gap-3"
      >
        <BillingCalendar items={subscriptions} />
        <span className="text-13 text-mist">
          Todas as cobranças vencem até o dia 15. Nenhuma na segunda quinzena.
        </span>
      </StateSwap>
    </Panel>
  );
}

function ActiveCard({ state }: Props) {
  return (
    <Panel className="gap-1.5">
      <PanelHeader
        title="Ativas"
        subtitle={
          state === "sem-internet" ? (
            <span className="text-tucano">{OFFLINE_NOTE}</span>
          ) : (
            "Detectadas por valor e empresa que se repetem"
          )
        }
      />
      <StateSwap
        className="grow"
        replacement={
          state === "erro" ? (
            <ErrorBlock />
          ) : state === "vazio" ? (
            <StateBlock
              icon="repeat-alt"
              title="Nenhuma assinatura encontrada"
              action={
                <ButtonLink href="/gastos/lancamentos" size="md">
                  <span>Ver lançamentos</span>
                </ButtonLink>
              }
            >
              Procuramos cobranças da mesma empresa, com o mesmo valor, todo mês. Com 2 ou 3 meses
              de lançamentos já dá para reconhecer.
            </StateBlock>
          ) : state === "vazio-filtro" ? (
            <FilterEmptyBlock>
              Nenhuma assinatura com “Disney”. As suas são Spotify, Netflix, Amazon Prime e iCloud+.
            </FilterEmptyBlock>
          ) : null
        }
      >
        <div className="@tab:hidden">
          <SubscriptionDetailList items={subscriptions} compact />
        </div>
        <div className="hidden @tab:block">
          <SubscriptionDetailList items={subscriptions} />
        </div>
      </StateSwap>
    </Panel>
  );
}

export default async function AssinaturasPage({ searchParams }: PageProps<"/assinaturas">) {
  const state = parseScreenState((await searchParams).estado);
  const loading = state === "carregando";
  return (
    <Page
      padding="list"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Assinaturas" back="/gastos" />}
    >
      {loading && <LoadingStatus />}
      <Breadcrumb
        className="hidden @desk:flex"
        items={[{ label: "Gastos", href: "/gastos" }, { label: "Assinaturas" }]}
      />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Assinaturas
          </h1>
          <p className="m-0 text-15 text-mist @desk:hidden">Detectadas automaticamente</p>
        </div>
        <div className="flex items-center gap-2" />
      </header>

      <Skeleton active={loading}>
        {/* Mobile e tablet: total e dica no topo, depois a lista e o calendário. */}
        <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
          <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2">
            <TotalCard state={state} />
            <PrimeTip state={state} />
          </div>
          <ActiveCard state={state} />
          <CalendarCard state={state} />
        </div>

        {/* Desktop: lista à esquerda (3/5), resumo, calendário e dica à direita. */}
        <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 @desk:grid">
          <ActiveCard state={state} />
          <div className="flex min-w-0 flex-col gap-5">
            <TotalCard state={state} />
            <CalendarCard state={state} />
            <PrimeTip state={state} className="grow" />
          </div>
        </div>
      </Skeleton>
    </Page>
  );
}
