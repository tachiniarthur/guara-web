"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock, StateSwap } from "@/components/states/state-block";
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
import { EMPTY_GASTOS, GastosDataProvider } from "@/features/gastos/context";
import { type FooterPart, gastosMonthOptions, useGastosView } from "@/features/gastos/live";
import { MonthPicker } from "@/features/gastos/components/month-picker";
import { useSession } from "@/features/acesso/session";
import { formatDate } from "@/lib/format";
import { futureMonthOrNull, labelsOfMonth, pastMonthOrNull, shiftMonth } from "@/lib/live-format";
import {
  PROJECTION_MONTHS,
  usePlannedExpenses,
  useProjection,
  useSuggestions,
} from "@/features/projecao/api";
import { NextMonthsBlock } from "@/features/projecao/components/next-months-block";
import { ProjectionView } from "@/features/projecao/components/projection-view";
import { SuggestionPrompt } from "@/features/projecao/components/suggestion-prompt";
import { useGastosMonth } from "@/stores/gastos-month";
import { NewUserSpending } from "@/features/novo/empty-screens";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SPENDING_BLOCKS } from "@/features/gastos/layout";
import { EditableGrid } from "@/features/layout/components/editable-grid";
import { EditLayoutButton, LayoutEditBar } from "@/features/layout/components/layout-edit-bar";
import { useScreenLayout } from "@/features/layout/use-screen-layout";

const SAIDAS = "#E0935A";

const ALL_BANKS = { value: "todos", label: "Todos os bancos", icon: "grid" as const };

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
  { href: "#g-proximos", label: "Próximos" },
  { href: "#g-lanc", label: "Lançamentos" },
];

function ChartFooter({ children }: { children: ReactNode }) {
  return <p className="m-0 text-13 leading-normal text-mist">{children}</p>;
}

/**
 * Gastos do mês (ou de um mês anterior, pelo seletor) e a previsão dos gastos fixos dos meses
 * seguintes, com os dados da API. Os blocos seguem o layout salvo da conta.
 */
export function GastosScreen() {
  const { live } = useSession();
  // Mês escolhido no seletor; `null` = o atual. Um mês guardado que já saiu da lista (virou o ano)
  // volta ao atual.
  const now = new Date();
  const currentMonth = formatDate(now, "yyyy-MM");
  const chosen = useGastosMonth((state) => state.month);
  const setChosen = useGastosMonth((state) => state.setMonth);
  const month = pastMonthOrNull(chosen, now) ?? currentMonth;
  // Mês depois do atual: a tela mostra a previsão dos gastos fixos dele.
  const futureMonth = futureMonthOrNull(chosen, now, PROJECTION_MONTHS);
  const gastos = useGastosView({ enabled: live, month });
  const layout = useScreenLayout("spending", SPENDING_BLOCKS);
  const projection = useProjection({ enabled: live });
  const planned = usePlannedExpenses({ enabled: live });
  // O pop-up de gasto recorrente aparece só no mês atual.
  const onCurrentMonth = !futureMonth && month === currentMonth;
  const suggestions = useSuggestions({ enabled: live && onCurrentMonth });
  const plannedCount = planned.data?.data.length ?? 0;
  if (gastos.data?.semDados) return <NewUserSpending />;
  // Carregando até a API responder; erro se alguma rota falhar (ou se a API não está configurada).
  const state = gastos.error || !live ? "erro" : gastos.data ? null : "carregando";
  const view = gastos.data;
  // Enquanto carrega, a forma dos cards sem números (o carregando cobre cada um).
  const data = view ?? EMPTY_GASTOS;
  const { ledger, tetos } = data;
  const mes = futureMonth ? labelsOfMonth(futureMonth) : (view?.mes ?? labelsOfMonth(month));
  const shownMonth = futureMonth ?? month;
  const fechado = view?.mesFechado ?? false;
  // No celular, só o mês ("Out"); de outro ano, com o ano ("Out/25").
  const mesCurto =
    shownMonth.slice(0, 4) === currentMonth.slice(0, 4)
      ? mes.short.slice(0, 3)
      : `${mes.short.slice(0, 3)}/${shownMonth.slice(2, 4)}`;
  // Os 12 meses seguintes (previsão) acima do atual e dos anteriores, do mais novo ao mais velho.
  const monthOptions = [
    ...Array.from({ length: PROJECTION_MONTHS }, (_, index) => {
      const value = shiftMonth(currentMonth, PROJECTION_MONTHS - index);
      return { value, ...labelsOfMonth(value), section: "Previsão" };
    }),
    ...gastosMonthOptions(now).map((option) => ({ ...option, section: "Gasto real" })),
  ];
  const monthPicker = (variant: "mobile" | "desktop") => (
    <MonthPicker
      options={monthOptions}
      value={shownMonth}
      onChange={(value) => setChosen(value === currentMonth ? null : value)}
      className="h-11 text-14"
    >
      {variant === "mobile" ? (
        mesCurto
      ) : (
        <>
          <span className="@desk:hidden">{mes.short}</span>
          <span className="hidden @desk:inline">{mes.long}</span>
        </>
      )}
    </MonthPicker>
  );
  const bankOptions = [
    ALL_BANKS,
    ...(view?.bancos ?? []).map((bank) => ({ value: bank, label: bank })),
  ];
  // No erro, cada card mostra o aviso e perde a ação e os números do subtítulo.
  const noData = state === "erro";
  const body = () => (noData ? <ErrorBlock /> : null);
  const sub = (text: ReactNode, withNumbers?: boolean) =>
    noData && withNumbers ? undefined : text;
  const renderBlock = (id: string) => {
    switch (id) {
      case "ritmo":
        return (
          <Panel id="g-ritmo">
            <PanelHeader title="Ritmo do mês" subtitle={sub("Gasto acumulado dia a dia")} />
            <StateSwap replacement={body()} className="grow gap-3.5">
              <ChartLegend
                items={[
                  { label: data.spendingPace.nomeAtual, color: SAIDAS },
                  { label: data.spendingPace.nomeAnterior, color: "#93A198", dashed: true },
                ]}
              />
              <div className="flex grow flex-col">
                <ChartFit
                  className="grow"
                  narrow={<SpendingPaceChart variant="mobile" />}
                  wide={<SpendingPaceChart variant="desktop" />}
                />
              </div>
              {view && <Footer parts={view.rodapes.ritmo} />}
            </StateSwap>
          </Panel>
        );
      case "meses":
        return (
          <Panel id="g-meses">
            <PanelHeader
              title={fechado ? `6 meses até ${mes.name}` : "Últimos 6 meses"}
              subtitle={sub("Total gasto por mês")}
            />
            <StateSwap replacement={body()} className="grow gap-3.5">
              <ChartLegend
                items={[
                  { label: "Gasto no mês", color: SAIDAS },
                  { label: data.monthlySpending.rotuloMedia, color: "#BDC6BE", dashed: true },
                  // Mês fechado não tem previsão.
                  ...(data.monthlySpending.previsao !== null
                    ? [{ label: data.monthlySpending.rotuloPrevisao, color: SAIDAS, dashed: true }]
                    : []),
                ]}
              />
              <div className="flex grow flex-col">
                <ChartFit
                  className="grow"
                  narrow={<MonthlySpendingChart variant="narrow" />}
                  wide={<MonthlySpendingChart variant="wide" />}
                />
              </div>
              {view && <Footer parts={view.rodapes.meses} />}
            </StateSwap>
          </Panel>
        );
      case "semana":
        return (
          <Panel>
            <PanelHeader
              title="Por dia da semana"
              subtitle={sub(
                fechado
                  ? `Gasto médio por dia nos 3 meses antes de ${mes.name}`
                  : "Gasto médio por dia nos últimos 3 meses",
                true,
              )}
            />
            <StateSwap replacement={body()} className="grow gap-3.5">
              <div className="flex grow flex-col">
                <ChartFit
                  className="grow"
                  narrow={<WeekdaySpendingChart variant="narrow" />}
                  wide={<WeekdaySpendingChart variant="wide" />}
                />
              </div>
              {view && <Footer parts={view.rodapes.semana} />}
            </StateSwap>
          </Panel>
        );
      case "categorias":
        return (
          <Panel id="g-cat" className="gap-2 p-4 @tab:gap-4 @tab:p-5">
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
            <StateSwap replacement={body()} className="grow gap-2 @tab:gap-4">
              {/* Pela largura do bloco (que a pessoa pode mudar), não da página. */}
              <ChartFit
                className="flex grow flex-col"
                narrow={
                  <div className="flex flex-col gap-2">
                    <CategoryBreakdown variant="mobile" />
                  </div>
                }
                medium={<CategoryBreakdown variant="tablet" />}
                wide={<CategoryBreakdown variant="desktop" />}
              />
            </StateSwap>
          </Panel>
        );
      case "lancamentos":
        return (
          <Panel id="g-lanc" className="gap-1 p-4 @tab:gap-3 @tab:p-5">
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
                    Ver todos
                    <Icon name="chevron-right" size={16} />
                  </Link>
                )
              }
            />
            <StateSwap replacement={body()} className="grow gap-1 @tab:gap-3">
              <SearchField
                label="Buscar lançamento"
                size="sm"
                className="mt-2 mb-1 @tab:my-0"
                inputClassName="@max-tab:text-16"
              />
              <div className="@tab:hidden">
                <LedgerList items={ledger.slice(0, 4)} short />
              </div>
              <div className="hidden @tab:block @desk:hidden">
                <LedgerList items={ledger.slice(0, 5)} />
              </div>
              <div className="hidden @desk:block">
                <LedgerList items={ledger} />
              </div>
            </StateSwap>
          </Panel>
        );
      case "tetos":
        return (
          <Panel id="g-tetos" className="gap-5 p-4 @tab:p-5">
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
        );
      case "previsao":
        return (
          <Panel id="g-previsao" className="gap-4 p-4 @tab:p-5">
            <PanelHeader
              title={fechado ? "Fechamento do mês" : "Previsão do mês"}
              subtitle={sub(
                fechado
                  ? `Como ${mes.name} fechou, comparado aos meses anteriores`
                  : `No ritmo de ${mes.name}, comparado aos últimos meses`,
              )}
            />
            <StateSwap replacement={body()} className="grow">
              <MonthForecast />
            </StateSwap>
          </Panel>
        );
      case "proximos":
        return (
          <NextMonthsBlock
            projection={projection.data}
            error={Boolean(projection.error)}
            plannedCount={plannedCount}
            onSelect={(value) => setChosen(value)}
          />
        );
      default:
        return null;
    }
  };
  return (
    <GastosDataProvider value={data}>
      <Page
        padding="list"
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={
          <MobileHeader
            title="Gastos"
            // Acima do conteúdo: o menu do mês abre por cima dele.
            className="relative z-10"
            account
            actions={
              <>
                <EditLayoutButton layout={layout} compact />
                {monthPicker("mobile")}
              </>
            }
          />
        }
      >
        <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Gastos" }]} />
        {state === "carregando" && <LoadingStatus />}
        {/* Acima dos cards: o menu do mês abre por cima deles. */}
        <header className="relative z-10 hidden items-end justify-between gap-4 @tab:flex">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
              Gastos
            </h1>
            <p className="m-0 text-15 text-mist">
              {futureMonth ? (
                <>{mes.long.split(" ")[0]} · previsão dos gastos fixos</>
              ) : view ? (
                <>
                  {mes.long.split(" ")[0]} · {view.gastosNoMes}{" "}
                  {view.gastosNoMes === 1 ? "gasto" : "gastos"}
                  <span className="hidden @desk:inline">
                    {" "}
                    em {view.bancos.length === 1 ? "1 banco" : `${view.bancos.length} bancos`}
                  </span>
                </>
              ) : (
                <>{mes.long.split(" ")[0]}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {monthPicker("desktop")}
            <EditLayoutButton layout={layout} className="hidden @desk:inline-flex" />
            <EditLayoutButton layout={layout} compact className="@desk:hidden" />
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

        {futureMonth ? (
          <ProjectionView
            month={futureMonth}
            projection={projection.data}
            error={Boolean(projection.error)}
            plannedCount={plannedCount}
            onSelect={(value) => setChosen(value)}
            onBackToCurrent={() => setChosen(null)}
          />
        ) : (
          <>
            <Skeleton active={state === "carregando"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FilterChips
                  label="Filtrar por banco"
                  options={bankOptions}
                  wrap
                  className="@max-tab:flex-nowrap @max-tab:overflow-hidden"
                  trailing={<AddChip>Conectar</AddChip>}
                />
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
              <LayoutEditBar layout={layout} defs={SPENDING_BLOCKS} className="mb-4" />
              <EditableGrid
                layout={layout}
                defs={SPENDING_BLOCKS}
                renderBlock={renderBlock}
                className="@tab:gap-x-4 @tab:gap-y-5 @desk:gap-x-5 @desk:gap-y-6"
                emptyLabel="Todos os blocos estão ocultos. Reexiba algum pela barra acima."
              />
            </Skeleton>
          </>
        )}
        {live && onCurrentMonth && suggestions.data && suggestions.data.data.length > 0 && (
          <SuggestionPrompt suggestions={suggestions.data.data} />
        )}
      </Page>
    </GastosDataProvider>
  );
}
