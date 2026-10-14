import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { MataCard } from "@/features/gastos/components/teto-cards";
import {
  donutSizes,
  GroupDetailsList,
  GroupLegend,
  PortfolioVsTarget,
} from "@/features/alocacao/components/allocation-parts";
import {
  AllocationStatTiles,
  allocationStats,
  OffTargetNote,
  TargetGapList,
} from "@/features/alocacao/components/allocation-summary";
import { portfolioAllocation, type GroupId } from "@/features/alocacao/data";
import { cn } from "@/lib/utils";

const headTitle = "text-18 tracking-normal";

function VersusPanel({ compact }: { compact?: boolean }) {
  return (
    <Panel className={compact ? "p-4.5" : "p-5.5"}>
      <PanelHeader
        title="Sua carteira × alvo"
        subtitle="Bens (imóvel e veículo) não entram na conta"
        titleClassName={headTitle}
      />
      <PortfolioVsTarget dims={compact ? donutSizes.sm : donutSizes.md} />
      <GroupLegend />
    </Panel>
  );
}

function GroupsPanel({
  layout,
  openGroup,
  compact,
}: {
  layout: "wide" | "compact";
  openGroup: GroupId | GroupId[] | "all";
  compact?: boolean;
}) {
  return (
    <Panel className={cn("gap-2", compact ? "p-4.5" : "p-5.5")}>
      <PanelHeader
        title="Grupo por grupo"
        subtitle="Toque num grupo para ver as subclasses · a marca branca é o alvo"
        titleClassName={headTitle}
      />
      <GroupDetailsList layout={layout} openGroup={openGroup} />
    </Panel>
  );
}

function GapPanel({ layout, className }: { layout: "stacked" | "side"; className?: string }) {
  return (
    <Panel className={cn("p-5.5", className)}>
      <PanelHeader
        title="Quanto falta para o alvo"
        subtitle={`Em reais, sobre ${portfolioAllocation.total} investidos`}
        titleClassName={headTitle}
      />
      <TargetGapList layout={layout} />
      <p className="m-0 text-13 leading-[1.55] text-caption">
        É só a distância até o alvo. O Guará não compra nem vende nada; você decide se e como
        ajustar.
      </p>
    </Panel>
  );
}

function PacuTip({ className, chatHref }: { className?: string; chatHref: string }) {
  return (
    <AgentTip
      agent="pacu"
      named
      className={className}
      action={
        <ButtonLink href={chatHref} variant="secondary" size="sm">
          <span>Conversar com o Pacu</span>
        </ButtonLink>
      }
    >
      Dá para chegar mais perto do alvo sem vender nada: se os próximos aportes forem para renda
      fixa internacional e renda variável internacional, a parte de renda variável Brasil vai
      diminuindo. Quer que eu simule com R$ 1.500 por mês?
    </AgentTip>
  );
}

export default function AlocacaoPage() {
  const stats = allocationStats();
  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Alocação"
          subtitle={`Perfil ${stats.perfil}`}
          back="/investimentos"
          actions={<IconButtonLink href="/perfil/investidor" icon="user" label="Mudar perfil" />}
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Alocação" }]}
      />
      <DetailHeader
        title="Alocação"
        subtitle={`Carteira-alvo do perfil ${stats.perfil} em 5 grupos`}
        actions={
          <>
            <ButtonLink
              href="/investimentos/alocacao/perfis"
              variant="secondary"
              className="text-15"
            >
              <span>Comparar os 4 perfis</span>
            </ButtonLink>
            <ButtonLink href="/perfil/investidor" variant="ghost" className="text-15">
              <span>Mudar perfil</span>
            </ButtonLink>
          </>
        }
      />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <MataCard>
          <span className="text-14 text-[#C5D8CB]">
            Perfil {stats.perfil} · {portfolioAllocation.total} investidos
          </span>
          <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
            {stats.fora}
            <span className="text-16 font-medium text-mist"> fora do alvo</span>
          </span>
          {stats.maior && (
            <span className="text-14 text-[#E4EEE6]">
              Maior diferença:{" "}
              <strong className="text-white">
                {stats.maior.grupo}, {stats.maior.diff}
              </strong>
            </span>
          )}
        </MataCard>
        <OffTargetNote />
        <VersusPanel compact />
        <GroupsPanel layout="compact" openGroup="rv-br" compact />
        <GapPanel layout="stacked" />
        <PacuTip chatHref="/conversas" />
        <ButtonLink href="/investimentos/alocacao/perfis" variant="secondary" size="lg" block>
          <span>Comparar os 4 perfis</span>
        </ButtonLink>
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <AllocationStatTiles />
        <OffTargetNote />
        <div className="grid grid-cols-2 items-stretch gap-4">
          <div className="flex min-w-0 flex-col gap-5">
            <VersusPanel />
            <PacuTip className="grow" chatHref="/conversas" />
          </div>
          <GapPanel layout="stacked" />
        </div>
        <GroupsPanel layout="wide" openGroup={["rf-br", "rf-int", "rv-br"]} />
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <AllocationStatTiles large />
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch gap-5">
          <GroupsPanel layout="wide" openGroup="all" />
          <div className="flex min-w-0 flex-col gap-5">
            <VersusPanel />
            <PacuTip chatHref="/conversas" />
            <GapPanel layout="side" className="grow" />
          </div>
        </div>
      </div>
    </Page>
  );
}
