import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import {
  chatWithOnca,
  GoalCard,
  GoalsHero,
  NewGoalButton,
  OncaTip,
} from "@/features/metas/components/goal-parts";
import { goals, goalsSummary } from "@/features/metas/data";

const savedLink = (
  <Link
    href="/simulador/salvas"
    className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
  >
    Ver simulações salvas
    <Icon name="chevron-right" size={16} />
  </Link>
);

export default function MetasPage() {
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Suas metas"
          back="/"
          actions={<IconButtonLink href="/metas/nova" icon="plus" label="Nova meta" />}
        />
      }
    >
      <DetailHeader
        title="Suas metas"
        subtitle={`Acompanhadas pela Onça · ${goals.length} metas`}
        actions={<NewGoalButton />}
      />
      <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:gap-5">
        <GoalsHero />
        <OncaTip action={chatWithOnca}>{goalsSummary.dica}</OncaTip>
      </div>
      <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:grid-cols-3 @desk:gap-5">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
      <div className="@tab:hidden">
        <NewGoalButton block />
      </div>
      <div className="flex items-center gap-2.5 @tab:justify-end">{savedLink}</div>
    </Page>
  );
}
