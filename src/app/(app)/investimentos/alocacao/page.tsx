"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink, buttonVariants } from "@/components/ui/button";
import { GuaraTip } from "@/components/ui/guara-tip";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSession } from "@/features/acesso/session";
import {
  AllocationTiles,
  AllocationVsTarget,
  ClassBarHeading,
  ClassBarList,
  ClassGapList,
  ClassLegend,
  ClassMessages,
  OffTargetSummary,
} from "@/features/alocacao/components/class-allocation";
import { donutSizes } from "@/features/alocacao/components/donut";
import { useAllocation, type PortfolioAllocation } from "@/features/alocacao/live";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { useHoldings } from "@/features/investimentos/posicoes";
import { cn } from "@/lib/utils";

const headTitle = "text-18 tracking-normal";

type Props = { allocation: PortfolioAllocation; ativos: number };

function VersusPanel({ allocation, ativos, compact }: Props & { compact?: boolean }) {
  return (
    <Panel className={compact ? "p-4.5" : "p-5.5"}>
      <PanelHeader
        title={allocation.perfil ? "Sua carteira × alvo" : "Sua carteira"}
        subtitle="Imóveis e veículos não entram na conta"
        titleClassName={headTitle}
      />
      <AllocationVsTarget
        allocation={allocation}
        ativos={ativos}
        dims={compact ? donutSizes.sm : donutSizes.md}
      />
      <ClassLegend classes={allocation.classes} />
    </Panel>
  );
}

function ClassesPanel({
  allocation,
  compact,
}: {
  allocation: PortfolioAllocation;
  compact?: boolean;
}) {
  return (
    <Panel className={cn("gap-2", compact ? "p-4.5" : "p-5.5")}>
      <ClassBarHeading withTarget={Boolean(allocation.perfil)} />
      <ClassBarList allocation={allocation} stacked={compact} />
      <ClassMessages allocation={allocation} />
    </Panel>
  );
}

function GapPanel({
  allocation,
  layout,
  className,
}: {
  allocation: PortfolioAllocation;
  layout: "stacked" | "side";
  className?: string;
}) {
  // Sem perfil não há alvo: não há distância para mostrar.
  if (!allocation.perfil) return null;
  return (
    <Panel className={cn("p-5.5", className)}>
      <PanelHeader
        title="Quanto falta para o alvo"
        subtitle={`Em reais, sobre ${allocation.total} investidos`}
        titleClassName={headTitle}
      />
      <ClassGapList allocation={allocation} layout={layout} />
      <p className="m-0 text-13 leading-[1.55] text-caption">
        É só a distância até o alvo. O Guará não compra nem vende nada; você decide se e como
        ajustar.
      </p>
    </Panel>
  );
}

/** Atalho para conversar sobre a carteira (só com perfil: sem alvo, não há o que comparar). */
function ChatTip({
  allocation,
  className,
}: {
  allocation: PortfolioAllocation;
  className?: string;
}) {
  if (!allocation.perfil) return null;
  return (
    <GuaraTip
      named
      className={className}
      action={
        <OpenChat
          question="Como está minha carteira em relação ao meu perfil?"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          <span>Conversar com o Guará</span>
        </OpenChat>
      }
    >
      Quer entender a diferença entre a sua carteira e o alvo do perfil {allocation.perfil.nome}?
      Posso explicar classe por classe, com os seus números.
    </GuaraTip>
  );
}

/** Alocação: a carteira nas quatro classes da API contra o alvo do perfil de investidor. */
export default function AlocacaoPage() {
  const { live } = useSession();
  const allocation = useAllocation({ enabled: live });
  const holdings = useHoldings({ enabled: live });
  const data = allocation.data;
  const failed = !live || allocation.error || holdings.error;
  const perfil = data?.perfil;
  const ativos = holdings.data?.quantidade ?? 0;
  const unvalued =
    data && data.semValor > 0
      ? `${data.semValor === 1 ? "1 posição sem valor ficou" : `${data.semValor} posições sem valor ficaram`} de fora da conta.`
      : null;

  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Alocação"
          subtitle={perfil ? `Perfil ${perfil.nome}` : "Sem perfil definido"}
          back="/investimentos"
          actions={
            <IconButtonLink
              href="/perfil/investidor"
              icon="user"
              label={perfil ? "Mudar perfil" : "Definir perfil"}
            />
          }
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Alocação" }]}
      />
      <DetailHeader
        title="Alocação"
        subtitle={
          perfil
            ? `Carteira-alvo do perfil ${perfil.nome} em 4 classes`
            : "Sua carteira em 4 classes"
        }
        actions={
          <>
            <ButtonLink
              href="/investimentos/alocacao/perfis"
              variant="secondary"
              className="text-15"
            >
              <span>Comparar os perfis</span>
            </ButtonLink>
            <ButtonLink href="/perfil/investidor" variant="ghost" className="text-15">
              <span>{perfil ? "Mudar perfil" : "Definir perfil"}</span>
            </ButtonLink>
          </>
        }
      />

      {failed ? (
        <ErrorBlock />
      ) : !data || !holdings.data ? (
        <LoadingStatus />
      ) : (
        <>
          {/* Celular */}
          <div className="flex flex-col gap-4 @tab:hidden">
            <MataCard>
              <span className="text-14 text-[#C5D8CB]">
                {perfil ? `Perfil ${perfil.nome}` : "Sem perfil"} · {data.total} investidos
              </span>
              {perfil ? (
                <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
                  {data.foraDoAlvo.length} de {data.classes.length}
                  <span className="text-16 font-medium text-mist"> fora do alvo</span>
                </span>
              ) : (
                <span className="text-16 text-[#E4EEE6]">
                  Responda o perfil de investidor para comparar com um alvo.
                </span>
              )}
            </MataCard>
            <OffTargetSummary allocation={data} />
            {unvalued && <p className="m-0 text-13 text-caption">{unvalued}</p>}
            <VersusPanel allocation={data} ativos={ativos} compact />
            <ClassesPanel allocation={data} compact />
            <GapPanel allocation={data} layout="stacked" />
            <ChatTip allocation={data} />
          </div>

          {/* Tablet */}
          <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
            <AllocationTiles allocation={data} ativos={ativos} />
            <OffTargetSummary allocation={data} />
            {unvalued && <p className="m-0 text-13 text-caption">{unvalued}</p>}
            <div className="grid grid-cols-2 items-stretch gap-4">
              <div className="flex min-w-0 flex-col gap-5">
                <VersusPanel allocation={data} ativos={ativos} />
                <ChatTip allocation={data} className="grow" />
              </div>
              <GapPanel allocation={data} layout="stacked" />
            </div>
            <ClassesPanel allocation={data} />
          </div>

          {/* Desktop */}
          <div className="hidden flex-col gap-6 @desk:flex">
            <AllocationTiles allocation={data} ativos={ativos} large />
            {unvalued && <p className="m-0 text-13 text-caption">{unvalued}</p>}
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch gap-5">
              <ClassesPanel allocation={data} />
              <div className="flex min-w-0 flex-col gap-5">
                <VersusPanel allocation={data} ativos={ativos} />
                <ChatTip allocation={data} />
                <GapPanel allocation={data} layout="side" className="grow" />
              </div>
            </div>
          </div>
        </>
      )}
      <ButtonLink
        href="/investimentos/alocacao/perfis"
        variant="secondary"
        size="lg"
        block
        className="@tab:hidden"
      >
        <span>Comparar os perfis</span>
      </ButtonLink>
    </Page>
  );
}
