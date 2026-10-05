import { MobileHeader } from "@/components/layout/mobile-header";
import { Page, PageTitle } from "@/components/layout/page";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextLink } from "@/components/ui/text-link";
import { agentCards } from "@/features/assistentes/cards";
import { AgentCard } from "@/features/assistentes/components/agent-card";
import { CategoryBudgetList } from "@/features/gastos/components/category-budget-list";
import { TransactionList } from "@/features/gastos/components/transaction-list";
import { categoryBudgets, recentTransactions } from "@/features/gastos/data";
import { PendingCard } from "@/features/inicio/components/pending-card";
import { SummaryCard } from "@/features/inicio/components/summary-card";
import { user } from "@/features/usuario/data";

const homeAgents = [
  agentCards.tamandua,
  agentCards.pacu,
  agentCards.caramelo,
  agentCards["quero-quero"],
];

export default function InicioPage() {
  return (
    <Page
      header={<MobileHeader variant="brand" notifications account />}
      className="gap-6.5 md:gap-7 lg:gap-6.5 lg:text-16"
    >
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
          <IconButton
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
          aside={<span className="text-13 text-caption">Atualizado há 5 min · 2 de 3 bancos</span>}
        />
        <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
          <SummaryCard className="@desk:col-span-8 @desk:h-[18.75rem]" />
          <PendingCard className="@desk:col-span-4 @desk:h-[18.75rem]" />
        </div>
      </section>

      <section aria-labelledby="sec-equipe" className="flex min-h-0 flex-col gap-3.5">
        <SectionHeader
          id="sec-equipe"
          title="Seus assistentes"
          subtitle="Cada um cuida de uma parte do seu dinheiro"
          aside={<TextLink href="/assistentes">Ver assistentes</TextLink>}
        />
        <div className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 @tab:mx-0 @tab:grid @tab:grid-cols-2 @tab:gap-4 @tab:overflow-visible @tab:px-0 @tab:pb-0 @desk:grid-cols-4 @desk:gap-6">
          {homeAgents.map((data) => (
            <AgentCard
              key={data.agent}
              data={data}
              className="shrink-0 basis-[17.25rem] snap-start @tab:basis-auto @desk:h-[28.875rem]"
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="sec-detalhes" className="flex min-h-0 flex-col gap-3.5">
        <SectionHeader
          id="sec-detalhes"
          title="Detalhes de setembro"
          subtitle="Para onde foi o dinheiro"
          aside={<TextLink href="/relatorio">Relatório completo</TextLink>}
        />
        <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
          <Card className="gap-3.5 @desk:col-span-7">
            <CardHeader
              title="Gastos por categoria"
              action={<TextLink href="/alertas/novo-teto">Ajustar tetos</TextLink>}
            />
            <CategoryBudgetList items={categoryBudgets} />
          </Card>
          <Card className="gap-2.5 @desk:col-span-5">
            <CardHeader
              title="Últimos lançamentos"
              action={<TextLink href="/gastos">Ver os 118</TextLink>}
            />
            <TransactionList items={recentTransactions} />
          </Card>
        </div>
      </section>
    </Page>
  );
}
