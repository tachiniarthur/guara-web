"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { OFFLINE_NOTE, parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock, NoDataBlock, StateBlock, StateSwap } from "@/components/states/state-block";
import { inlineLinkClass } from "@/components/ui/text-link";
import { ButtonLink } from "@/components/ui/button";
import { AddChip, FilterChips } from "@/components/ui/filter-chips";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SearchField } from "@/components/ui/search-field";
import { CategoryBreakdown } from "@/features/gastos/components/category-breakdown";
import { ChartLegend } from "@/features/gastos/components/chart-legend";
import { ChartFit } from "@/components/charts/chart-fit";
import { LedgerList } from "@/features/gastos/components/ledger-list";
import {
  MonthlySpendingChart,
  SpendingPaceChart,
  WeekdaySpendingChart,
} from "@/features/gastos/components/spending-charts";
import { MonthForecast } from "@/features/gastos/components/month-forecast";
import { TetoMeter } from "@/features/gastos/components/teto-meter";
import { ViewModeToggle } from "@/features/gastos/components/view-mode-toggle";
import { GastosDataProvider, prototypeGastos } from "@/features/gastos/context";
import { type FooterPart, useGastosView } from "@/features/gastos/live";
import { useSession } from "@/features/acesso/session";
import { NewUserSpending } from "@/features/novo/empty-screens";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const SAIDAS = "#E0935A";

const prototypeBanks = [
  { value: "todos", label: "Todos os bancos", icon: "grid" as const },
  { value: "nubank", label: "Nubank", bank: "nubank" },
  { value: "itau", label: "Itaú", bank: "itau" },
];

/** Rodapé dos gráficos montado com os números da API (`forte` em negrito). */
function Footer({ parts }: { parts: FooterPart[] }) {
  return (
    <ChartFooter>
      {parts.map((part, i) =>
        part.forte ? (
          <strong key={i} className="text-sand">
            {part.texto}
          </strong>
        ) : (
          <span key={i}>{part.texto}</span>
        ),
      )}
    </ChartFooter>
  );
}

const anchors = [
  { href: "#g-ritmo", label: "Ritmo" },
  { href: "#g-meses", label: "6 meses" },
  { href: "#g-cat", label: "Categorias" },
  { href: "#g-tetos", label: "Tetos" },
  { href: "#g-previsao", label: "Previsão" },
  { href: "#g-lanc", label: "Lançamentos" },
];

function ChartFooter({ children }: { children: ReactNode }) {
  return <p className="m-0 text-13 leading-normal text-mist">{children}</p>;
}

const noSpending = (
  <StateBlock
    icon="wallet"
    title="Ainda sem gastos"
    action={
      <ButtonLink href="/onboarding/bancos" variant="forest" size="md" className="text-15">
        <span>Conectar banco</span>
      </ButtonLink>
    }
  >
    Conecte um banco para ver seus gastos por categoria, por dia da semana e mês a mês.
  </StateBlock>
);

/** `estado`: estados do protótipo (`?estado=`), abertos pela prévia (ver `src/proxy.ts`). */
export function GastosScreen({ estado }: { estado?: string }) {
  const { live } = useSession();
  const gastos = useGastosView({ enabled: live });
  if (estado === "novo" || (live && gastos.data?.semDados)) return <NewUserSpending />;
  // Modo real: carregando até a API responder, erro se alguma rota falhar. Protótipo: `?estado=`.
  const state = live
    ? gastos.error
      ? "erro"
      : gastos.data
        ? null
        : "carregando"
    : parseScreenState(estado);
  const view = gastos.data;
  const data = view ?? prototypeGastos;
  const { ledger, tetos } = data;
  const mes = view?.mes ?? { name: "setembro", short: "Set 2026", long: "Setembro 2026" };
  const bankOptions = view
    ? [
        { value: "todos", label: "Todos os bancos", icon: "grid" as const },
        ...view.bancos.map((bank) => ({ value: bank, label: bank })),
      ]
    : prototypeBanks;
  // Sem dados (erro ou vazio), cada card mostra o aviso e perde a ação e os números do subtítulo.
  const noData = state === "erro" || state === "vazio";
  const body = (main?: ReactNode) =>
    state === "erro" ? <ErrorBlock /> : state === "vazio" ? (main ?? <NoDataBlock />) : null;
  const sub = (text: ReactNode, withNumbers?: boolean) =>
    state === "sem-internet" ? (
      <span className="text-tucano">{OFFLINE_NOTE}</span>
    ) : noData && withNumbers ? undefined : (
      text
    );
  /** O aviso "Ainda sem gastos" vai no maior card: categorias (celular e desktop) ou lançamentos. */
  const categoryMain = (
    <>
      <div className="flex grow flex-col @tab:hidden @desk:flex">{noSpending}</div>
      <div className="hidden grow flex-col @tab:flex @desk:hidden">
        <NoDataBlock />
      </div>
    </>
  );
  const ledgerMain = (
    <>
      <div className="flex grow flex-col @tab:hidden @desk:flex">
        <NoDataBlock />
      </div>
      <div className="hidden grow flex-col @tab:flex @desk:hidden">{noSpending}</div>
    </>
  );
  return (
    <GastosDataProvider value={data}>
      <Page
        padding="list"
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={
          <MobileHeader
            title="Gastos"
            account
            actions={
              <button
                type="button"
                aria-haspopup="dialog"
                className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-14 font-medium whitespace-nowrap"
              >
                <Icon name="calendar" size={18} />
                {mes.short.slice(0, 3)}
                <Icon name="chevron-down" size={16} />
              </button>
            }
          />
        }
      >
        <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Gastos" }]} />
        {state === "carregando" && <LoadingStatus />}
        <header className="hidden items-end justify-between gap-4 @tab:flex">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
              Gastos
            </h1>
            <p className="m-0 text-15 text-mist">
              {view ? (
                <>
                  {mes.long.split(" ")[0]} · {view.gastosNoMes}{" "}
                  {view.gastosNoMes === 1 ? "gasto" : "gastos"}
                  <span className="hidden @desk:inline">
                    {" "}
                    em {view.bancos.length === 1 ? "1 banco" : `${view.bancos.length} bancos`}
                  </span>
                </>
              ) : (
                <>
                  Setembro · 118 lançamentos
                  <span className="hidden @desk:inline"> em 2 bancos</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-haspopup="dialog"
              className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-14 font-medium whitespace-nowrap"
            >
              <Icon name="calendar" size={18} />
              <span className="@desk:hidden">{mes.short}</span>
              <span className="hidden @desk:inline">{mes.long}</span>
              <Icon name="chevron-down" size={16} />
            </button>
            <ButtonLink
              href="/alertas/novo-teto"
              size="md"
              className="hidden text-15 @desk:inline-flex"
            >
              <Icon name="plus" size={18} />
              <span>Novo teto</span>
            </ButtonLink>
          </div>
        </header>

        <Skeleton active={state === "carregando"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              label="Filtrar por banco"
              options={bankOptions}
              wrap
              className="@max-tab:flex-nowrap @max-tab:overflow-hidden"
              trailing={<AddChip>Conectar</AddChip>}
            />
            <div className="hidden @tab:block">
              <ViewModeToggle appearance="card" />
            </div>
          </div>

          <div className="flex flex-col gap-4 @tab:hidden">
            <ViewModeToggle appearance="pill" />
          </div>
        </Skeleton>
        <div className="flex flex-col gap-4 @tab:hidden">
          <nav aria-label="Ir para" className="-mr-4 flex gap-1.5 overflow-hidden">
            {anchors.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="flex h-9 shrink-0 items-center rounded-full border border-line-strong px-3 text-13 font-bold whitespace-nowrap text-mist no-underline"
              >
                {anchor.label}
              </a>
            ))}
          </nav>
        </div>

        <Skeleton active={state === "carregando"}>
          <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @tab:gap-x-4 @tab:gap-y-5 @desk:grid-cols-6 @desk:gap-x-5 @desk:gap-y-6">
            <Panel id="g-ritmo" className="@tab:col-span-2">
              <PanelHeader title="Ritmo do mês" subtitle={sub("Gasto acumulado dia a dia")} />
              <StateSwap replacement={body()} className="grow gap-3.5">
                <ChartLegend
                  items={[
                    { label: data.spendingPace.nomeAtual, color: SAIDAS },
                    { label: data.spendingPace.nomeAnterior, color: "#93A198", dashed: true },
                  ]}
                />
                <div className="flex grow items-end">
                  <ChartFit
                    narrow={<SpendingPaceChart variant="mobile" />}
                    wide={<SpendingPaceChart variant="desktop" />}
                  />
                </div>
                {view ? (
                  <Footer parts={view.rodapes.ritmo} />
                ) : (
                  <ChartFooter>
                    <strong className="text-sand">R$ 1.012 acima</strong> de agosto no mesmo dia,
                    puxado pela compra de eletrônicos de hoje.
                  </ChartFooter>
                )}
              </StateSwap>
            </Panel>

            <Panel id="g-meses" className="@tab:-mt-1 @desk:col-span-2 @desk:mt-0">
              <PanelHeader title="Últimos 6 meses" subtitle={sub("Total gasto por mês")} />
              <StateSwap replacement={body()} className="grow gap-3.5">
                <ChartLegend
                  items={[
                    { label: "Gasto no mês", color: SAIDAS },
                    { label: data.monthlySpending.rotuloMedia, color: "#BDC6BE", dashed: true },
                    { label: data.monthlySpending.rotuloPrevisao, color: SAIDAS, dashed: true },
                  ]}
                />
                <div className="flex grow items-end">
                  <ChartFit
                    narrow={<MonthlySpendingChart variant="narrow" />}
                    wide={<MonthlySpendingChart variant="wide" />}
                  />
                </div>
                {view ? (
                  <Footer parts={view.rodapes.meses} />
                ) : (
                  <ChartFooter>
                    Setembro deve fechar perto de <strong className="text-sand">R$ 6.050</strong>,
                    4% acima da média dos últimos meses.
                  </ChartFooter>
                )}
              </StateSwap>
            </Panel>

            <Panel className="@tab:-mt-1 @desk:col-span-2 @desk:mt-0">
              <PanelHeader
                title="Por dia da semana"
                subtitle={sub(
                  view
                    ? "Gasto médio por dia nos últimos 3 meses"
                    : "Gasto médio por dia, sem aluguel e compras acima de R$ 1.000",
                  true,
                )}
              />
              <StateSwap replacement={body()} className="grow gap-3.5">
                <div className="flex grow items-end">
                  <ChartFit
                    narrow={<WeekdaySpendingChart variant="narrow" />}
                    wide={<WeekdaySpendingChart variant="wide" />}
                  />
                </div>
                {view ? (
                  <Footer parts={view.rodapes.semana} />
                ) : (
                  <ChartFooter>
                    Sexta e sábado concentram <strong className="text-sand">36%</strong> dos gastos
                    do mês, quase tudo em delivery e lazer.
                  </ChartFooter>
                )}
              </StateSwap>
            </Panel>

            <Panel
              id="g-cat"
              className="gap-2 p-4 @tab:col-span-2 @tab:gap-4 @tab:p-5 @desk:col-span-3"
            >
              <div className="mb-1 flex flex-col gap-0.5 @tab:hidden">
                <h2 className="m-0 font-display text-18 leading-[1.25] font-bold">Por categoria</h2>
                <p className="m-0 text-13 text-caption">
                  {sub("Toque numa categoria para ver os lançamentos")}
                </p>
              </div>
              <PanelHeader
                className="hidden @tab:flex"
                title="Por categoria"
                subtitle={sub("Clique numa categoria para ver os lançamentos")}
              />
              <StateSwap replacement={body(categoryMain)} className="grow gap-2 @tab:gap-4">
                <div className="flex flex-col gap-2 @tab:hidden">
                  <CategoryBreakdown variant="mobile" />
                </div>
                <div className="hidden @tab:block @desk:hidden">
                  <CategoryBreakdown variant="tablet" />
                </div>
                <div className="hidden grow @desk:flex">
                  <CategoryBreakdown variant="desktop" />
                </div>
              </StateSwap>
            </Panel>

            <Panel
              id="g-lanc"
              className="order-last gap-1 p-4 @tab:order-none @tab:col-span-2 @tab:gap-3 @tab:p-5 @desk:col-span-3"
            >
              <PanelHeader
                title={
                  <>
                    <span className="@tab:hidden">Últimos lançamentos</span>
                    <span className="hidden @tab:inline">Lançamentos</span>
                  </>
                }
                titleClassName="@max-tab:text-18 @max-tab:tracking-normal"
                action={
                  !noData && (
                    <Link href="/gastos/lancamentos" className={panelLinkClass}>
                      {view ? "Ver todos" : "Ver 118"}
                      <Icon name="chevron-right" size={16} />
                    </Link>
                  )
                }
              />
              <StateSwap replacement={body(ledgerMain)} className="grow gap-1 @tab:gap-3">
                <SearchField
                  label="Buscar lançamento"
                  size="sm"
                  className="mt-2 mb-1 @tab:my-0"
                  inputClassName="@max-tab:text-16"
                />
                <div className="@tab:hidden">
                  <LedgerList
                    items={
                      view
                        ? ledger.slice(0, 4)
                        : ledger.filter((l) => ["l1", "l2", "l3", "l6"].includes(l.id))
                    }
                    short
                  />
                </div>
                <div className="hidden @tab:block @desk:hidden">
                  <LedgerList items={ledger.slice(0, 5)} />
                </div>
                <div className="hidden @desk:block">
                  <LedgerList items={ledger} />
                </div>
              </StateSwap>
            </Panel>

            <Panel id="g-tetos" className="gap-5 p-4 @tab:p-5 @desk:col-span-3">
              <PanelHeader
                title={
                  <Link href="/alertas/tetos" className={inlineLinkClass}>
                    Tetos do mês
                  </Link>
                }
                subtitle={sub("Cada aviso chega uma vez por mês, somando crédito e débito")}
                action={
                  !noData && (
                    <ButtonLink href="/alertas/novo-teto" size="sm">
                      <Icon name="plus" size={18} />
                      <span>Novo teto</span>
                    </ButtonLink>
                  )
                }
              />
              <StateSwap replacement={body()} className="grow gap-5">
                {tetos.map((teto, i) => (
                  <div key={teto.id} className={cn(i === 2 && "hidden @desk:block")}>
                    <TetoMeter teto={teto} />
                  </div>
                ))}
              </StateSwap>
            </Panel>

            <Panel id="g-previsao" className="gap-4 p-4 @tab:p-5 @desk:col-span-3">
              <PanelHeader
                title="Previsão do mês"
                subtitle={sub(`No ritmo de ${mes.name}, comparado aos últimos meses`)}
              />
              <StateSwap replacement={body()} className="grow">
                <MonthForecast />
              </StateSwap>
            </Panel>
          </div>
        </Skeleton>
      </Page>
    </GastosDataProvider>
  );
}
