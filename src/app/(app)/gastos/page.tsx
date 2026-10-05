import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { ButtonLink } from "@/components/ui/button";
import { AddChip, FilterChips } from "@/components/ui/filter-chips";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SearchField } from "@/components/ui/search-field";
import { CategoryBreakdown } from "@/features/gastos/components/category-breakdown";
import { ChartLegend } from "@/features/gastos/components/chart-legend";
import { LedgerList } from "@/features/gastos/components/ledger-list";
import {
  MonthlySpendingChart,
  SpendingPaceChart,
  WeekdaySpendingChart,
} from "@/features/gastos/components/spending-charts";
import { SubscriptionList } from "@/features/gastos/components/subscription-list";
import { TetoMeter } from "@/features/gastos/components/teto-meter";
import { ViewModeToggle } from "@/features/gastos/components/view-mode-toggle";
import { activeSubscriptions, ledger, otherSpending, tetos } from "@/features/gastos/data";
import { cn } from "@/lib/utils";

const SAIDAS = "#E0935A";

const bankOptions = [
  { value: "todos", label: "Todos os bancos", icon: "grid" as const },
  { value: "nubank", label: "Nubank" },
  { value: "itau", label: "Itaú" },
];

const anchors = [
  { href: "#g-ritmo", label: "Ritmo" },
  { href: "#g-meses", label: "6 meses" },
  { href: "#g-cat", label: "Categorias" },
  { href: "#g-tetos", label: "Tetos" },
  { href: "#g-ass", label: "Assinaturas" },
  { href: "#g-lanc", label: "Lançamentos" },
];

function ChartFooter({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-13 leading-normal text-mist">{children}</p>;
}

export default function GastosPage() {
  return (
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
              Set
              <Icon name="chevron-down" size={16} />
            </button>
          }
        />
      }
    >
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Gastos
          </h1>
          <p className="m-0 text-15 text-mist">
            Setembro · 118 lançamentos<span className="hidden @desk:inline"> em 2 bancos</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-haspopup="dialog"
            className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-14 font-medium whitespace-nowrap"
          >
            <Icon name="calendar" size={18} />
            <span className="@desk:hidden">Set 2026</span>
            <span className="hidden @desk:inline">Setembro 2026</span>
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

      <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @tab:gap-x-4 @tab:gap-y-5 @desk:grid-cols-6 @desk:gap-x-5 @desk:gap-y-6">
        <Panel id="g-ritmo" className="@tab:col-span-2">
          <PanelHeader title="Ritmo do mês" subtitle="Gasto acumulado dia a dia" />
          <ChartLegend
            items={[
              { label: "Setembro", color: SAIDAS },
              { label: "Agosto", color: "#93A198", dashed: true },
            ]}
          />
          <div className="flex grow items-end">
            <div className="w-full @tab:hidden">
              <SpendingPaceChart variant="mobile" />
            </div>
            <div className="hidden w-full @tab:block @desk:hidden">
              <SpendingPaceChart variant="tablet" />
            </div>
            <div className="hidden w-full @desk:block">
              <SpendingPaceChart variant="desktop" />
            </div>
          </div>
          <ChartFooter>
            <strong className="text-sand">R$ 1.012 acima</strong> de agosto no mesmo dia, puxado
            pela compra de eletrônicos de hoje.
          </ChartFooter>
        </Panel>

        <Panel id="g-meses" className="@tab:-mt-1 @desk:col-span-2 @desk:mt-0">
          <PanelHeader title="Últimos 6 meses" subtitle="Total gasto por mês" />
          <ChartLegend
            items={[
              { label: "Gasto no mês", color: SAIDAS },
              { label: "Média de abr a ago", color: "#BDC6BE", dashed: true },
              { label: "Previsão de setembro", color: SAIDAS, dashed: true },
            ]}
          />
          <div className="flex grow items-end">
            <div className="w-full @desk:hidden">
              <MonthlySpendingChart variant="narrow" />
            </div>
            <div className="hidden w-full @desk:block">
              <MonthlySpendingChart variant="wide" />
            </div>
          </div>
          <ChartFooter>
            Setembro deve fechar perto de <strong className="text-sand">R$ 6.050</strong>, 4% acima
            da média dos últimos meses.
          </ChartFooter>
        </Panel>

        <Panel className="@tab:-mt-1 @desk:col-span-2 @desk:mt-0">
          <PanelHeader
            title="Por dia da semana"
            subtitle="Gasto médio por dia, sem aluguel e compras acima de R$ 1.000"
          />
          <div className="flex grow items-end">
            <div className="w-full @desk:hidden">
              <WeekdaySpendingChart variant="narrow" />
            </div>
            <div className="hidden w-full @desk:block">
              <WeekdaySpendingChart variant="wide" />
            </div>
          </div>
          <ChartFooter>
            Sexta e sábado concentram <strong className="text-sand">36%</strong> dos gastos do mês,
            quase tudo em delivery e lazer.
          </ChartFooter>
        </Panel>

        <Panel
          id="g-cat"
          className="gap-2 p-4 @tab:col-span-2 @tab:gap-4 @tab:p-5 @desk:col-span-3"
        >
          <div className="mb-1 flex flex-col gap-0.5 @tab:hidden">
            <h2 className="m-0 font-display text-18 leading-[1.25] font-bold">Por categoria</h2>
            <p className="m-0 text-13 text-caption">Toque numa categoria para ver os lançamentos</p>
          </div>
          <PanelHeader
            className="hidden @tab:flex"
            title="Por categoria"
            subtitle={`Outros gastos somam ${otherSpending.valorFormatado}`}
          />
          <div className="flex flex-col gap-2 @tab:hidden">
            <CategoryBreakdown variant="mobile" />
          </div>
          <div className="hidden @tab:block @desk:hidden">
            <CategoryBreakdown variant="tablet" />
          </div>
          <div className="hidden grow @desk:flex">
            <CategoryBreakdown variant="desktop" />
          </div>
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
              <a href="#" className={panelLinkClass}>
                Ver 118
                <Icon name="chevron-right" size={16} />
              </a>
            }
          />
          <SearchField
            label="Buscar lançamento"
            size="sm"
            className="mt-2 mb-1 @tab:my-0"
            inputClassName="@max-tab:text-16"
          />
          <div className="@tab:hidden">
            <LedgerList
              items={ledger.filter((l) => ["l1", "l2", "l3", "l6"].includes(l.id))}
              short
            />
          </div>
          <div className="hidden @tab:block @desk:hidden">
            <LedgerList items={ledger.slice(0, 5)} />
          </div>
          <div className="hidden @desk:block">
            <LedgerList items={ledger} />
          </div>
        </Panel>

        <Panel id="g-tetos" className="gap-5 p-4 @tab:p-5 @desk:col-span-3">
          <PanelHeader
            title="Tetos do mês"
            subtitle="Cada aviso chega uma vez por mês, somando crédito e débito"
            action={
              <ButtonLink href="/alertas/novo-teto" size="sm">
                <Icon name="plus" size={18} />
                <span>Novo teto</span>
              </ButtonLink>
            }
          />
          {tetos.map((teto, i) => (
            <div key={teto.id} className={cn(i === 2 && "hidden @desk:block")}>
              <TetoMeter teto={teto} />
            </div>
          ))}
        </Panel>

        <Panel id="g-ass" className="gap-4 p-4 @tab:p-5 @desk:col-span-3">
          <PanelHeader
            title="Assinaturas ativas"
            subtitle="4 detectadas automaticamente · R$ 101,60/mês"
            action={
              <Link href="/assinaturas" className={panelLinkClass}>
                Ver todas
                <Icon name="chevron-right" size={16} />
              </Link>
            }
          />
          <div className="@desk:hidden">
            <SubscriptionList items={activeSubscriptions.slice(0, 3)} />
          </div>
          <div className="hidden @desk:block">
            <SubscriptionList items={activeSubscriptions} />
          </div>
        </Panel>
      </div>
    </Page>
  );
}
