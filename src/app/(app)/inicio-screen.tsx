"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ShowValuesButton } from "@/components/layout/privacy-toggle";
import { Page, PageTitle } from "@/components/layout/page";
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
import { TextLink } from "@/components/ui/text-link";
import { CategoryBudgetList } from "@/features/gastos/components/category-budget-list";
import { TransactionList } from "@/features/gastos/components/transaction-list";
import { NewUserHome } from "@/features/inicio/components/new-user-home";
import { OverviewCards } from "@/features/inicio/components/overview-cards";
import { PendingCard } from "@/features/inicio/components/pending-card";
import { SummaryCard } from "@/features/inicio/components/summary-card";
import { useSession } from "@/features/acesso/session";
import { useHomeView } from "@/features/inicio/live";
import { useUser, withFirstName } from "@/features/usuario/live";
import { formatDate } from "@/lib/format";
import { capitalize, greeting, monthLabels } from "@/lib/live-format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HOME_BLOCKS } from "@/features/inicio/layout";
import { EditableGrid } from "@/features/layout/components/editable-grid";
import { EditLayoutButton, LayoutEditBar } from "@/features/layout/components/layout-edit-bar";
import { useScreenLayout } from "@/features/layout/use-screen-layout";

/**
 * Início: resumo do mês, visão geral e detalhes, com os dados da API. Quem ainda não conectou
 * banco vê os primeiros passos.
 */
export function InicioScreen() {
  const { live } = useSession();
  const home = useHomeView({ enabled: live });
  const layout = useScreenLayout("home", HOME_BLOCKS);
  const user = useUser();
  if (home.data?.semBanco) return <NewUserHome />;
  // Carregando até a API responder; erro se alguma rota falhar (ou se a API não está configurada).
  const state = home.error || !live ? "erro" : home.data ? null : "carregando";
  const loading = state === "carregando";
  const view = home.data;
  const notificacoes = view ? view.notificacoes : user.notificacoesNovas;
  // Enquanto a API responde: o mês e a data de hoje, sem contar pendências.
  const now = new Date();
  const pendencias = view ? view.pendencias : null;
  const mes = view?.mes ?? monthLabels(now);
  const hoje = view
    ? view.data
    : capitalize(formatDate(now, "EEEE, d 'de' MMMM").replace("-feira", ""));
  /** Seção sem nenhum bloco à vista some fora da edição (na edição, mostra onde ficaria). */
  const sectionShown = (group: string) =>
    layout.editing ||
    layout.blocks.some(
      (b) => !b.hidden && HOME_BLOCKS.some((def) => def.id === b.id && def.group === group),
    );
  const renderBlock = (id: string) => {
    switch (id) {
      case "resumo":
        return (
          <SummaryCard
            className="@desk:min-h-[18.75rem]"
            summary={view?.summary}
            cashFlow={view?.cashFlow}
            cashFlowYear={view?.cashFlowYear}
          />
        );
      case "pendencias":
        return <PendingCard className="@desk:min-h-[18.75rem]" pendingItems={view?.pending} />;
      case "investimentos":
      case "cobrancas":
      case "metas":
      case "alertas":
        return <OverviewCards data={view?.overview} only={id} />;
      case "categorias":
        return (
          <Card className="gap-3.5">
            <CardHeader
              title="Gastos por categoria"
              action={
                <CardAction>
                  <TextLink href="/alertas/novo-teto">Ajustar tetos</TextLink>
                </CardAction>
              }
            />
            <CardBody className="grow">
              <CategoryBudgetList items={view?.categoryBudgets ?? []} />
            </CardBody>
          </Card>
        );
      case "lancamentos":
        return (
          <Card className="gap-2.5">
            <CardHeader
              title="Últimos lançamentos"
              action={
                <CardAction>
                  <TextLink href="/gastos">Ver todos</TextLink>
                </CardAction>
              }
            />
            <CardBody className="grow">
              <TransactionList items={view?.recent ?? []} />
            </CardBody>
          </Card>
        );
      default:
        return null;
    }
  };
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
            title={
              view
                ? view.titulo
                : // Enquanto a API responde, já com o nome de quem entrou.
                  `${withFirstName(greeting(now), user.nome)}.`
            }
            subtitle={
              pendencias === null ? (
                <>{hoje}</>
              ) : pendencias === 0 ? (
                <>{hoje} · nada precisa da sua atenção.</>
              ) : (
                <>
                  {hoje} ·{" "}
                  <strong className="text-sand">
                    {pendencias === 1 ? "1 item" : `${pendencias} itens`}
                  </strong>{" "}
                  {pendencias === 1 ? "precisa" : "precisam"} da sua atenção.
                </>
              )
            }
          />

          <div className="flex w-full items-center justify-between gap-2.5 @tab:w-auto @tab:justify-start @tab:gap-3">
            <span className="flex h-12 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-15 font-semibold whitespace-nowrap @tab:px-4.5">
              <Icon name="calendar" size={18} className="hidden @tab:block" />
              <span className="@tab:hidden">{mes.short}</span>
              <span className="hidden @tab:inline">{mes.long}</span>
            </span>
            <ShowValuesButton variant="pill" className="hidden @tab:flex" />
            <EditLayoutButton layout={layout} className="hidden h-12 @desk:inline-flex" />
            <EditLayoutButton layout={layout} compact className="h-12 @desk:hidden" />
            <IconButtonLink
              href="/notificacoes"
              icon="bell"
              label={`Notificações, ${notificacoes} novas`}
              size="lg"
              className="hidden @tab:inline-flex"
            />
          </div>
        </header>

        <LayoutEditBar layout={layout} defs={HOME_BLOCKS} />

        {sectionShown("resumo") && (
          <section aria-labelledby="sec-resumo" className="flex min-h-0 flex-col gap-3.5">
            <SectionHeader
              id="sec-resumo"
              title={`Resumo de ${mes.name}`}
              subtitle="Como está o seu mês"
              aside={
                view?.atualizado && <span className="text-13 text-caption">{view.atualizado}</span>
              }
            />
            <Skeleton active={loading}>
              <EditableGrid
                layout={layout}
                defs={HOME_BLOCKS}
                group="resumo"
                renderBlock={renderBlock}
                emptyLabel="Os blocos desta seção estão ocultos."
              />
            </Skeleton>
          </section>
        )}

        {sectionShown("visao") && (
          <section aria-labelledby="sec-visao" className="flex min-h-0 flex-col gap-3.5">
            <SectionHeader
              id="sec-visao"
              title="Visão geral"
              subtitle="Seus investimentos, cobranças, metas e alertas"
            />
            <Skeleton active={loading}>
              <EditableGrid
                layout={layout}
                defs={HOME_BLOCKS}
                group="visao"
                renderBlock={renderBlock}
                emptyLabel="Os blocos desta seção estão ocultos."
              />
            </Skeleton>
          </section>
        )}

        {sectionShown("detalhes") && (
          <section aria-labelledby="sec-detalhes" className="flex min-h-0 flex-col gap-3.5">
            <SectionHeader
              id="sec-detalhes"
              title={`Detalhes de ${mes.name}`}
              subtitle="Para onde foi o dinheiro"
              aside={<TextLink href="/relatorio">Relatório completo</TextLink>}
            />
            <Skeleton active={loading}>
              <EditableGrid
                layout={layout}
                defs={HOME_BLOCKS}
                group="detalhes"
                renderBlock={renderBlock}
                emptyLabel="Os blocos desta seção estão ocultos."
              />
            </Skeleton>
          </section>
        )}
      </Page>
    </ScreenStateProvider>
  );
}
