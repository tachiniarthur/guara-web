import { MobileHeader } from "@/components/layout/mobile-header";
import { Page, PageTitle } from "@/components/layout/page";
import { agentCards } from "@/features/assistentes/cards";
import { AgentCard } from "@/features/assistentes/components/agent-card";
import { agentOrder, type AgentId } from "@/features/assistentes/data";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * Grade em mosaico: o Capivara (o coordenador) e a Onça deitados e largos, o Tamanduá alto no
 * desktop e os demais menores. Tablet: largos nas pontas, dois por linha no meio.
 */
const mosaic: Partial<Record<AgentId, { layout: "wide" | "tall"; className: string }>> = {
  capivara: { layout: "wide", className: "@tab:col-span-2" },
  tamandua: { layout: "tall", className: "@desk:row-span-2" },
  onca: { layout: "wide", className: "@tab:col-span-2" },
};

export default function AssistentesPage() {
  return (
    <Page
      header={<MobileHeader variant="brand" notifications account />}
      className="gap-5 @tab:gap-6"
    >
      <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Assistentes" }]} />
      <header>
        <PageTitle
          title="Seus assistentes"
          subtitle="Cada um cuida de uma parte do seu dinheiro. Toque em um deles para conversar ou pergunte no chat, que o Guará chama o certo."
        />
      </header>
      <div className="grid grid-cols-1 gap-3.5 @tab:grid-cols-2 @tab:gap-4 @desk:grid-cols-3 @desk:gap-6">
        {agentOrder.map((id) => (
          <AgentCard
            key={id}
            data={agentCards[id]}
            imageClassName="h-[9.375rem] @tab:h-46"
            actionClassName="size-[2.875rem]"
            layout={mosaic[id]?.layout}
            className={mosaic[id]?.className}
          />
        ))}
      </div>
    </Page>
  );
}
