"use client";

import { useState, type ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { useSession } from "@/features/acesso/session";

import {
  buildCut,
  buildGoal,
  buildRetirement,
  cutStart,
  goalStart,
  retirementStart,
  type CutState,
  type GoalState,
  type RetirementState,
} from "../build";
import type { Simulation, SimulatorId } from "../data";
import { PROTOTYPE_CONTEXT, type SimulatorContext } from "../inputs";
import { useSimulatorContext } from "../live";
import { AskGuaraCard, DetailCard, PremisesCard, ResultCard } from "./sections";
import { SimulatorNav } from "./simulator-nav";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

/** Caminho de cada aba do Simulador (Aposentadoria é a tela inicial do módulo). */
const simulatorCrumbs: Record<SimulatorId, Crumb[]> = {
  aposentadoria: [{ label: "Simulador" }],
  objetivo: [{ label: "Simulador", href: "/simulador" }, { label: "Juntar para um objetivo" }],
  corte: [{ label: "Simulador", href: "/simulador" }, { label: "Cortar um gasto" }],
};

/** A simulação da aba aberta, recalculada a cada mudança nas premissas. */
function useSimulation(id: SimulatorId, ctx: SimulatorContext): Simulation {
  const [retirement, setRetirement] = useState<RetirementState>(() => retirementStart(ctx));
  const [goal, setGoal] = useState<GoalState>(() => goalStart(ctx));
  const [cut, setCut] = useState<CutState>(() => cutStart(ctx));
  switch (id) {
    case "aposentadoria":
      return buildRetirement(
        retirement,
        (patch) => setRetirement((s) => ({ ...s, ...patch })),
        ctx,
      );
    case "objetivo":
      return buildGoal(goal, (patch) => setGoal((s) => ({ ...s, ...patch })), ctx);
    case "corte":
      return buildCut(cut, (patch) => setCut((s) => ({ ...s, ...patch })), ctx);
  }
}

/**
 * Molde das três simulações. Desktop: premissas ao lado do resultado, três cards de detalhe
 * e o fechamento ao lado da conversa. Tablet e mobile: resultado primeiro, tudo empilhado.
 */
export function SimulatorPage({ id }: { id: SimulatorId }) {
  const { live } = useSession();
  const context = useSimulatorContext({ enabled: live });
  if (!live) return <SimulatorBody id={id} ctx={PROTOTYPE_CONTEXT} />;
  if (context.data) return <SimulatorBody id={id} ctx={context.data} />;
  return (
    <SimulatorShell id={id} subtitle="Simule com os seus números">
      {context.error ? (
        <ErrorBlock />
      ) : (
        <>
          <LoadingStatus />
          <p className="m-0 text-14 text-mist">Carregando os seus números…</p>
        </>
      )}
    </SimulatorShell>
  );
}

function SimulatorBody({ id, ctx }: { id: SimulatorId; ctx: SimulatorContext }) {
  const simulation = useSimulation(id, ctx);
  const [first, second, third] = simulation.details;

  return (
    <SimulatorShell id={id} subtitle={simulation.subtitle}>
      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <PremisesCard premises={simulation.premises} className="order-last @desk:order-none" />
        <ResultCard simulation={simulation} />
      </div>

      <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @tab:gap-x-4 @tab:gap-y-5 @desk:grid-cols-3 @desk:gap-5">
        <DetailCard section={first} />
        <DetailCard section={second} />
        <DetailCard section={third} className="@tab:col-span-2 @desk:col-span-1" />
      </div>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <DetailCard section={simulation.closing} />
        <AskGuaraCard questions={simulation.questions} />
      </div>
    </SimulatorShell>
  );
}

function SimulatorShell({
  id,
  subtitle,
  children,
}: {
  id: SimulatorId;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Page
      padding="list"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Simulador"
          back="/investimentos"
          actions={
            <IconButtonLink href="/simulador/salvas" icon="clock" label="Simulações salvas" />
          }
        />
      }
    >
      <Breadcrumb className="hidden flex-wrap @tab:flex" items={simulatorCrumbs[id]} />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-34 leading-[1.15] font-bold tracking-[-0.01em]">
            Simulador
          </h1>
          <p className="m-0 text-15 text-mist">{subtitle}</p>
        </div>
        {/* As simulações salvas pelo "Salvar" do resultado ficam aqui. */}
        <ButtonLink href="/simulador/salvas" variant="secondary" size="sm" className="text-14">
          <Icon name="clock" size={18} />
          <span>Simulações salvas</span>
        </ButtonLink>
      </header>

      <SimulatorNav current={id} />

      {children}
    </Page>
  );
}
