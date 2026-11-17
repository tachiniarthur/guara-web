"use client";

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
import { GuaraTip } from "@/components/ui/guara-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { BillingCalendar } from "@/features/assinaturas/components/billing-calendar";
import { SubscriptionDetailList } from "@/features/assinaturas/components/subscription-detail-list";
import { SubscriptionStats } from "@/features/assinaturas/components/subscription-stats";
import { subscriptions } from "@/features/assinaturas/data";
import {
  calendarNote,
  useAssinaturasView,
  type AssinaturasView,
} from "@/features/assinaturas/live";
import { useSession } from "@/features/acesso/session";

/** Com login, o que veio da API; no protótipo, `undefined` (os dados de exemplo). */
type Props = { state: ScreenState | null; view?: AssinaturasView };

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

/** Resumo do topo (ativas, mensal, anual e média), com os estados de erro e vazio. */
function StatsStrip({ state, view }: Props) {
  return (
    <StateSwap
      replacement={tileState(state)}
      overlayClassName="rounded-card border border-line bg-card p-5"
    >
      <SubscriptionStats stats={view?.stats} />
    </StateSwap>
  );
}

function PrimeTip({ state, view, className }: Props & { className?: string }) {
  // Com login, a dica vem dos dados (maior aumento ou o peso no ano); sem assinatura, não há dica.
  if (view && !view.dica) return null;
  return (
    <StateSwap
      replacement={tileState(state)}
      overlayClassName="rounded-bubble bg-shade p-4"
      className={className}
    >
      {view?.dica ? (
        <GuaraTip
          className={className}
          action={
            <ButtonLink href={view.dica.acao.href} size="sm">
              <span>{view.dica.acao.label}</span>
            </ButtonLink>
          }
        >
          {view.dica.texto}
        </GuaraTip>
      ) : (
        <PrimeTipBubble className={className} />
      )}
    </StateSwap>
  );
}

function PrimeTipBubble({ className }: { className?: string }) {
  return (
    <GuaraTip
      className={className}
      action={
        <Button size="sm">
          <Icon name="chat" size={18} />
          <span>Perguntar ao Guará</span>
        </Button>
      }
    >
      Você não comprou na Amazon nos últimos 60 dias. Se cancelar o Prime, economiza{" "}
      <strong>R$ 238,80 por ano</strong>.
    </GuaraTip>
  );
}

function CalendarCard({ state, view }: Props) {
  const month = view?.calendario;
  return (
    <Panel className="gap-3">
      <PanelHeader
        title={
          <Link href="/assinaturas/calendario" className={inlineLinkClass}>
            Cobranças de {month ? month.nome : "outubro"}
          </Link>
        }
        titleClassName="text-18 tracking-normal"
      />
      <StateSwap
        replacement={state === "erro" ? <ErrorBlock /> : state === "vazio" ? <NoDataBlock /> : null}
        className="grow gap-3"
      >
        {month ? (
          <>
            <BillingCalendar
              items={month.cobrancas.map((c) => ({ dia: c.dia, nome: c.item.nome }))}
              days={month.dias}
              month={month.nome}
            />
            <span className="text-13 text-mist">{calendarNote(month)}</span>
          </>
        ) : (
          <>
            <BillingCalendar items={subscriptions} />
            <span className="text-13 text-mist">
              Todas as cobranças vencem até o dia 15. Nenhuma na segunda quinzena.
            </span>
          </>
        )}
      </StateSwap>
    </Panel>
  );
}

function ActiveCard({ state, view }: Props) {
  const items = view?.items ?? subscriptions;
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
          <SubscriptionDetailList items={items} compact />
        </div>
        <div className="hidden @tab:block">
          <SubscriptionDetailList items={items} />
        </div>
      </StateSwap>
    </Panel>
  );
}

/** `estado`: estados do protótipo (`?estado=`), abertos pela prévia (ver `src/proxy.ts`). */
export function AssinaturasScreen({ estado }: { estado?: string }) {
  const { live } = useSession();
  const assinaturas = useAssinaturasView({ enabled: live });
  const view = live ? assinaturas.data : undefined;
  // Com login: carregando até a API responder, erro se falhar, vazio sem assinatura ativa.
  const state: ScreenState | null = live
    ? assinaturas.error
      ? "erro"
      : !view
        ? "carregando"
        : view.items.length === 0
          ? "vazio"
          : null
    : parseScreenState(estado);
  const loading = state === "carregando";
  return (
    <Page
      padding="list"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Assinaturas" back="/gastos" />}
    >
      {loading && <LoadingStatus />}
      <Breadcrumb className="hidden @desk:flex" items={[{ label: "Assinaturas" }]} />
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
        {/* O resumo em faixa no topo, em todos os tamanhos. */}
        <StatsStrip state={state} view={view} />

        {/* Mobile e tablet: dica, depois a lista e o calendário. */}
        <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
          <PrimeTip state={state} view={view} />
          <ActiveCard state={state} view={view} />
          <CalendarCard state={state} view={view} />
        </div>

        {/* Desktop: lista à esquerda (3/5), calendário e dica à direita. */}
        <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 @desk:grid">
          <ActiveCard state={state} view={view} />
          <div className="flex min-w-0 flex-col gap-5">
            <CalendarCard state={state} view={view} />
            {/* Do tamanho do texto: esticada, a dica sobrava vazia embaixo. */}
            <PrimeTip state={state} view={view} />
          </div>
        </div>
      </Skeleton>
    </Page>
  );
}
