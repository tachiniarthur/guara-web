import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { BillingCalendar } from "@/features/assinaturas/components/billing-calendar";
import { SubscriptionDetailList } from "@/features/assinaturas/components/subscription-detail-list";
import { subscriptions, subscriptionTotals } from "@/features/assinaturas/data";

function TotalCard() {
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

function PrimeTip({ className }: { className?: string }) {
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

function CalendarCard() {
  return (
    <Panel className="gap-3">
      <PanelHeader title="Cobranças de outubro" titleClassName="text-18 tracking-normal" />
      <BillingCalendar items={subscriptions} />
      <span className="text-13 text-mist">
        Todas as cobranças vencem até o dia 15. Nenhuma na segunda quinzena.
      </span>
    </Panel>
  );
}

function ActiveCard() {
  return (
    <Panel className="gap-1.5">
      <PanelHeader title="Ativas" subtitle="Detectadas por valor e empresa que se repetem" />
      <div className="@tab:hidden">
        <SubscriptionDetailList items={subscriptions} compact />
      </div>
      <div className="hidden @tab:block">
        <SubscriptionDetailList items={subscriptions} />
      </div>
    </Panel>
  );
}

export default function AssinaturasPage() {
  return (
    <Page
      padding="list"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Assinaturas" back="/gastos" />}
    >
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

      {/* Mobile e tablet: total e dica no topo, depois a lista e o calendário. */}
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
        <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2">
          <TotalCard />
          <PrimeTip />
        </div>
        <ActiveCard />
        <CalendarCard />
      </div>

      {/* Desktop: lista à esquerda (3/5), resumo, calendário e dica à direita. */}
      <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 @desk:grid">
        <ActiveCard />
        <div className="flex min-w-0 flex-col gap-5">
          <TotalCard />
          <CalendarCard />
          <PrimeTip className="grow" />
        </div>
      </div>
    </Page>
  );
}
