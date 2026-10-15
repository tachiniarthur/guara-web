import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { OFFLINE_NOTE, parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import {
  ErrorBlock,
  FilterEmptyBlock,
  NoDataBlock,
  StateBlock,
  StateSwap,
} from "@/components/states/state-block";
import { inlineLinkClass } from "@/components/ui/text-link";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { AlertHistoryList } from "@/features/alertas/components/alert-history-list";
import { PriceAlertList } from "@/features/alertas/components/price-alert-list";
import { alertHistory, priceAlerts } from "@/features/alertas/data";
import { TetoMeter } from "@/features/gastos/components/teto-meter";
import { tetos } from "@/features/gastos/data";

function NewTetoLink({ className }: { className?: string }) {
  return (
    <ButtonLink href="/alertas/novo-teto" size="md" className={className}>
      <Icon name="plus" size={18} />
      <span>Novo teto</span>
    </ButtonLink>
  );
}

function NewPriceAlertLink({
  label,
  variant = "primary",
  className,
}: {
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <ButtonLink href="/alertas/novo-preco" variant={variant} size="md" className={className}>
      <Icon name="plus" size={18} />
      <span>{label}</span>
    </ButtonLink>
  );
}

/** "Nenhum alerta ainda" (`?estado=vazio`): fica no maior card de cada tamanho de tela. */
function NoAlertsBlock({ className }: { className?: string }) {
  return (
    <StateBlock
      icon="alert-triangle"
      title="Nenhum alerta ainda"
      className={className}
      action={
        <ButtonLink href="/alertas/novo-teto" variant="forest" size="md" className="text-15">
          <span>Novo teto</span>
        </ButtonLink>
      }
    >
      Crie um teto para uma categoria ou um alerta de preço para uma ação, FII, ETF ou cripto.
    </StateBlock>
  );
}

export default async function AlertasPage({ searchParams }: PageProps<"/alertas">) {
  const state = parseScreenState((await searchParams).estado);
  const loading = state === "carregando";
  const empty = state === "vazio";
  // Sem dados (erro ou vazio), os cards perdem o botão do canto.
  const noData = state === "erro" || empty;
  const note = (text: string) =>
    state === "sem-internet" ? <span className="text-tucano">{OFFLINE_NOTE}</span> : text;
  /** Bloco no lugar do conteúdo de um card; `main` diz em que telas ele é o card maior. */
  const swap = (main?: "mobile" | "wide") => {
    if (state === "erro") return <ErrorBlock />;
    if (!empty) return null;
    if (main === "mobile") {
      return (
        <>
          <NoAlertsBlock className="@tab:hidden" />
          <NoDataBlock className="hidden @tab:flex" />
        </>
      );
    }
    if (main === "wide") {
      return (
        <>
          <NoDataBlock className="@tab:hidden" />
          <NoAlertsBlock className="hidden @tab:flex" />
        </>
      );
    }
    return <NoDataBlock />;
  };

  return (
    <Page
      padding="list"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Alertas" back="/" />}
    >
      {loading && <LoadingStatus />}
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Alertas
          </h1>
          <p className="m-0 text-15 text-mist">
            <span className="@desk:hidden">3 tetos e 3 alertas de preço</span>
            <span className="hidden @desk:inline">
              3 tetos de gasto e 3 alertas de preço ativos
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewTetoLink className="hidden text-15 @desk:inline-flex" />
          <NewPriceAlertLink
            label="Novo alerta de preço"
            className="hidden text-15 @desk:inline-flex"
          />
        </div>
      </header>

      <Skeleton active={loading}>
        <div className="grid grid-cols-2 gap-2 @tab:flex @tab:gap-2.5 @desk:hidden">
          <NewTetoLink className="@tab:text-15" />
          <NewPriceAlertLink label="Alerta de preço" variant="secondary" className="@tab:hidden" />
          <NewPriceAlertLink
            label="Novo alerta de preço"
            className="hidden text-15 @tab:inline-flex"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @desk:gap-5">
          <Panel className="gap-5.5 p-4 @tab:gap-5 @tab:p-5">
            <PanelHeader
              className="-mb-2 @tab:mb-0"
              title={
                <Link href="/alertas/tetos" className={inlineLinkClass}>
                  Tetos do mês
                </Link>
              }
              subtitle={note("Cada aviso chega uma vez por mês, somando crédito e débito")}
              titleClassName="@max-tab:text-18 @max-tab:tracking-normal"
              action={
                !noData && (
                  <ButtonLink
                    href="/alertas/novo-teto"
                    size="sm"
                    className="hidden @tab:inline-flex"
                  >
                    <Icon name="plus" size={18} />
                    <span>Novo teto</span>
                  </ButtonLink>
                )
              }
            />
            <StateSwap replacement={swap()} className="grow gap-5.5 @tab:gap-5">
              {tetos.map((teto) => (
                <TetoMeter key={teto.id} teto={teto} />
              ))}
            </StateSwap>
          </Panel>

          <Panel className="gap-1 p-4 @tab:p-5">
            <PanelHeader
              title="Alertas de preço"
              subtitle={note("Aviso por notificação e e-mail")}
              titleClassName="@max-tab:text-18"
              action={
                !noData &&
                state !== "vazio-filtro" && (
                  <ButtonLink href="/alertas/novo-preco" size="sm">
                    <Icon name="plus" size={18} />
                    <span>Novo</span>
                  </ButtonLink>
                )
              }
            />
            <StateSwap
              replacement={
                state === "vazio-filtro" ? (
                  <FilterEmptyBlock>
                    Nenhum alerta de preço pausado. Todos os seus estão ativos.
                  </FilterEmptyBlock>
                ) : (
                  swap("mobile")
                )
              }
              className="grow"
            >
              <PriceAlertList items={priceAlerts} />
            </StateSwap>
          </Panel>
        </div>

        <Panel className="gap-1.5">
          <PanelHeader
            title="Histórico de avisos"
            subtitle={note("Cada aviso de teto chega só uma vez por mês")}
            titleClassName="@max-tab:text-18"
          />
          <StateSwap replacement={swap("wide")} className="grow">
            <div className="@tab:hidden">
              <AlertHistoryList items={alertHistory.slice(0, 3)} stacked />
            </div>
            <div className="hidden @tab:block">
              <AlertHistoryList items={alertHistory} />
            </div>
          </StateSwap>
        </Panel>
      </Skeleton>
    </Page>
  );
}
