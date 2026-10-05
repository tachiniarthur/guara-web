import { MobileHeader } from "@/components/layout/mobile-header";
import { Page, PageTitle } from "@/components/layout/page";
import { agentCards } from "@/features/assistentes/cards";
import { AgentCard } from "@/features/assistentes/components/agent-card";
import { agentOrder } from "@/features/assistentes/data";

export default function AssistentesPage() {
  return (
    <Page
      header={<MobileHeader variant="brand" notifications account />}
      className="gap-5 @tab:gap-6"
    >
      <header>
        <PageTitle
          title="Seus assistentes"
          subtitle="Cada um cuida de uma parte do seu dinheiro. Toque em um deles para conversar ou pergunte no chat, que a Capivara chama o certo."
        />
      </header>
      <div className="grid grid-cols-1 gap-3.5 @tab:grid-cols-2 @tab:gap-4 @desk:grid-cols-3 @desk:gap-6">
        {agentOrder.map((id) => (
          <AgentCard
            key={id}
            data={agentCards[id]}
            imageClassName="h-[9.375rem] @tab:h-46"
            actionClassName="size-[2.875rem]"
          />
        ))}
      </div>
    </Page>
  );
}
