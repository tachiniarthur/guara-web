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
import { user } from "@/features/usuario/data";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * Início (e o caso de quem ainda não conectou banco: ?estado=novo). Estados do protótipo por
 * `?estado=`, abertos pela prévia (ver `src/proxy.ts`).
 */
export function InicioScreen({ estado }: { estado?: string }) {
  if (estado === "novo") return <NewUserHome />;
  const state = parseScreenState(estado);
  const loading = state === "carregando";
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
                  label={`Notificações, ${user.notificacoesNovas} novas`}
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
            title={`Boa tarde, ${user.nome}.`}
            subtitle={
              <>
                Quarta, 23 de setembro · <strong className="text-sand">3 itens</strong> precisam da
                sua atenção.
              </>
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
              aria-label="Mês: setembro de 2026"
              className="flex h-12 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-15 font-semibold whitespace-nowrap @tab:px-4.5"
            >
              <Icon name="calendar" size={18} className="hidden @tab:block" />
              <span className="@tab:hidden">Set 2026</span>
              <span className="hidden @tab:inline">Setembro 2026</span>
              <Icon name="chevron-down" size={16} />
            </button>
            <ShowValuesButton variant="pill" className="hidden @tab:flex" />
            <IconButtonLink
              href="/notificacoes"
              icon="bell"
              label={`Notificações, ${user.notificacoesNovas} novas`}
              size="lg"
              className="hidden @tab:inline-flex"
            />
          </div>
        </header>

        <section aria-labelledby="sec-resumo" className="flex min-h-0 flex-col gap-3.5">
          <SectionHeader
            id="sec-resumo"
            title="Resumo de setembro"
            subtitle="Como está o seu mês"
            aside={
              <span className="text-13 text-caption">Atualizado há 5 min · 2 de 4 bancos</span>
            }
          />
          <Skeleton active={loading}>
            <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
              <SummaryCard className="@desk:col-span-8 @desk:h-[18.75rem]" />
              <PendingCard className="@desk:col-span-4 @desk:h-[18.75rem]" />
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
            <OverviewCards />
          </Skeleton>
        </section>

        <section aria-labelledby="sec-detalhes" className="flex min-h-0 flex-col gap-3.5">
          <SectionHeader
            id="sec-detalhes"
            title="Detalhes de setembro"
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
                  <CategoryBudgetList items={categoryBudgets} />
                </CardBody>
              </Card>
              <Card className="gap-2.5 @desk:col-span-5">
                <CardHeader
                  title="Últimos lançamentos"
                  action={
                    <CardAction>
                      <TextLink href="/gastos">Ver os 118</TextLink>
                    </CardAction>
                  }
                />
                <CardBody className="grow">
                  <TransactionList items={recentTransactions} />
                </CardBody>
              </Card>
            </div>
          </Skeleton>
        </section>
      </Page>
    </ScreenStateProvider>
  );
}
