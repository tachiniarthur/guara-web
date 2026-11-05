"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ShowValuesButton } from "@/components/layout/privacy-toggle";
import { Page, PageTitle } from "@/components/layout/page";
import { parseScreenState } from "@/components/states/screen-state";
import {
  CardAction,
  CardBody,
  ScreenStateProvider,
} from "@/components/states/screen-state-context";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Card, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextLink } from "@/components/ui/text-link";
import { CategoryBudgetList } from "@/features/gastos/components/category-budget-list";
import { TransactionList } from "@/features/gastos/components/transaction-list";
import { categoryBudgets, recentTransactions } from "@/features/gastos/data";
import { NewUserHome } from "@/features/inicio/components/new-user-home";
import { OverviewCards } from "@/features/inicio/components/overview-cards";
import { PendingCard } from "@/features/inicio/components/pending-card";
import { SummaryCard } from "@/features/inicio/components/summary-card";
import { useSession } from "@/features/acesso/session";
import { useHomeView } from "@/features/inicio/live";
import { user } from "@/features/usuario/data";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * Início (e o caso de quem ainda não conectou banco: ?estado=novo). Estados do protótipo por
 * `?estado=`, abertos pela prévia (ver `src/proxy.ts`).
 */
export function InicioScreen({ estado }: { estado?: string }) {
  const { live } = useSession();
  const home = useHomeView({ enabled: live });
  if (estado === "novo" || (live && home.data?.semBanco)) return <NewUserHome />;
  // Modo real: carregando até a API responder, erro se alguma rota falhar. Protótipo: `?estado=`.
  const state = live
    ? home.error
      ? "erro"
      : home.data
        ? null
        : "carregando"
    : parseScreenState(estado);
  const loading = state === "carregando";
  const view = home.data;
  const notificacoes = view ? view.notificacoes : user.notificacoesNovas;
  const pendencias = view ? view.pendencias : 3;
  const mes = view?.mes ?? { name: "setembro", short: "Set 2026", long: "Setembro 2026" };
  return (
    <ScreenStateProvider state={state}>
      <Page
        header={
          <MobileHeader
            variant="brand"
            account
            actions={
              <>
                <ShowValuesButton variant="icon" />
                <IconButtonLink
                  href="/notificacoes"
                  icon="bell"
                  label={`Notificações, ${notificacoes} novas`}
                  variant="ghost"
                />
              </>
            }
          />
        }
        className="gap-6.5 md:gap-7 lg:gap-6.5 lg:text-16"
      >
        <Breadcrumb className="hidden flex-wrap @tab:flex" items={[]} />
        {loading && <LoadingStatus />}
        <header className="flex flex-wrap items-end justify-between gap-4 @desk:flex-nowrap @desk:gap-6">
          <PageTitle
            title={view ? view.titulo : `Boa tarde, ${user.nome}.`}
            subtitle={
              pendencias === 0 ? (
                <>{view ? view.data : "Quarta, 23 de setembro"} · nada precisa da sua atenção.</>
              ) : (
                <>
                  {view ? view.data : "Quarta, 23 de setembro"} ·{" "}
                  <strong className="text-sand">
                    {pendencias === 1 ? "1 item" : `${pendencias} itens`}
                  </strong>{" "}
                  {pendencias === 1 ? "precisa" : "precisam"} da sua atenção.
                </>
              )
            }
          />

          <div className="flex w-full items-center justify-between gap-2.5 @tab:w-auto @tab:justify-start @tab:gap-3">
            <SegmentedControl
              label="Como ver os bancos"
              itemClassName="px-3 @tab:px-4"
              options={[
                { value: "junto", label: "Tudo junto" },
                { value: "banco", label: "Por banco" },
              ]}
            />
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`Mês: ${mes.long.toLowerCase().replace(" ", " de ")}`}
              className="flex h-12 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-15 font-semibold whitespace-nowrap @tab:px-4.5"
            >
              <Icon name="calendar" size={18} className="hidden @tab:block" />
              <span className="@tab:hidden">{mes.short}</span>
              <span className="hidden @tab:inline">{mes.long}</span>
              <Icon name="chevron-down" size={16} />
            </button>
            <ShowValuesButton variant="pill" className="hidden @tab:flex" />
            <IconButtonLink
              href="/notificacoes"
              icon="bell"
              label={`Notificações, ${notificacoes} novas`}
              size="lg"
              className="hidden @tab:inline-flex"
            />
          </div>
        </header>

        <section aria-labelledby="sec-resumo" className="flex min-h-0 flex-col gap-3.5">
          <SectionHeader
            id="sec-resumo"
            title={`Resumo de ${mes.name}`}
            subtitle="Como está o seu mês"
            aside={
              view ? (
                view.atualizado && <span className="text-13 text-caption">{view.atualizado}</span>
              ) : (
                <span className="text-13 text-caption">Atualizado há 5 min · 2 de 4 bancos</span>
              )
            }
          />
          <Skeleton active={loading}>
            <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
              <SummaryCard
                className="@desk:col-span-8 @desk:h-[18.75rem]"
                summary={view?.summary}
                cashFlow={view?.cashFlow ?? undefined}
              />
              <PendingCard
                className="@desk:col-span-4 @desk:h-[18.75rem]"
                pendingItems={view?.pending}
              />
            </div>
          </Skeleton>
        </section>

        <section aria-labelledby="sec-visao" className="flex min-h-0 flex-col gap-3.5">
          <SectionHeader
            id="sec-visao"
            title="Visão geral"
            subtitle="Seus investimentos, cobranças, metas e alertas"
          />
          <Skeleton active={loading}>
            <OverviewCards data={view?.overview} />
          </Skeleton>
        </section>

        <section aria-labelledby="sec-detalhes" className="flex min-h-0 flex-col gap-3.5">
          <SectionHeader
            id="sec-detalhes"
            title={`Detalhes de ${mes.name}`}
            subtitle="Para onde foi o dinheiro"
            aside={<TextLink href="/relatorio">Relatório completo</TextLink>}
          />
          <Skeleton active={loading}>
            <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
              <Card className="gap-3.5 @desk:col-span-7">
                <CardHeader
                  title="Gastos por categoria"
                  action={
                    <CardAction>
                      <TextLink href="/alertas/novo-teto">Ajustar tetos</TextLink>
                    </CardAction>
                  }
                />
                <CardBody className="grow">
                  <CategoryBudgetList items={view ? view.categoryBudgets : categoryBudgets} />
                </CardBody>
              </Card>
              <Card className="gap-2.5 @desk:col-span-5">
                <CardHeader
                  title="Últimos lançamentos"
                  action={
                    <CardAction>
                      <TextLink href="/gastos">{view ? "Ver todos" : "Ver os 118"}</TextLink>
                    </CardAction>
                  }
                />
                <CardBody className="grow">
                  <TransactionList items={view ? view.recent : recentTransactions} />
                </CardBody>
              </Card>
            </div>
          </Skeleton>
        </section>
      </Page>
    </ScreenStateProvider>
  );
}
