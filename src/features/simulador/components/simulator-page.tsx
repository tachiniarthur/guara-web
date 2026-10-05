import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";

import { simulations, type SimulatorId } from "../data";
import { AskAgentCard, DetailCard, PremisesCard, ResultCard } from "./sections";
import { SimulatorNav } from "./simulator-nav";

/**
 * Molde das três simulações. Desktop: premissas ao lado do resultado, três cards de detalhe
 * e o fechamento ao lado da conversa. Tablet e mobile: resultado primeiro, tudo empilhado.
 */
export function SimulatorPage({ id }: { id: SimulatorId }) {
  const simulation = simulations[id];
  const [first, second, third] = simulation.details;

  return (
    <Page
      padding="list"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Simulador" back="/investimentos" />}
    >
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-34 leading-[1.15] font-bold tracking-[-0.01em]">
            Simulador
          </h1>
          <p className="m-0 text-15 text-mist">{simulation.subtitle}</p>
        </div>
      </header>

      <SimulatorNav current={id} />

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <PremisesCard premises={simulation.premises} className="order-last @desk:order-none" />
        <ResultCard result={simulation.result} agent={simulation.agent} />
      </div>

      <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @tab:gap-x-4 @tab:gap-y-5 @desk:grid-cols-3 @desk:gap-5">
        <DetailCard section={first} />
        <DetailCard section={second} />
        <DetailCard section={third} className="@tab:col-span-2 @desk:col-span-1" />
      </div>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <DetailCard section={simulation.closing} />
        <AskAgentCard agent={simulation.agent} />
      </div>
    </Page>
  );
}
