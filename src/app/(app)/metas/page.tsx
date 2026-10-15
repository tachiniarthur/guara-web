import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlocks, StateBlock, StateSwap } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const savedLink = (
  <Link
    href="/simulador/salvas"
    className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
  >
    Ver simulações salvas
    <Icon name="chevron-right" size={16} />
  </Link>
);

/** Erro de cada meta: tile no celular; no tablet, grande nos cards da primeira linha. */
const goalErrors = [
  <ErrorBlocks key="a" mobile="tile" tablet="big" desktop="compact" />,
  <ErrorBlocks key="b" mobile="tile" tablet="big" desktop="compact" />,
  <ErrorBlocks key="c" mobile="tile" tablet="tile" desktop="compact" />,
];

/** "Nenhuma meta ainda" (`?estado=vazio`): na mata no celular, num card de meta nas outras telas. */
function NoGoals() {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-card border border-line-strong bg-mata p-5",
        "@tab:min-h-[26.75rem] @tab:gap-3 @tab:rounded-[1.375rem] @tab:border-line @tab:bg-card @tab:p-4.5 @desk:min-h-75",
      )}
    >
      <StateBlock
        icon="target"
        title="Nenhuma meta ainda"
        action={
          <ButtonLink href="/metas/nova" variant="forest" size="md" className="text-15">
            <span>Criar primeira meta</span>
          </ButtonLink>
        }
      >
        Crie uma meta, como reserva de emergência ou viagem, e acompanhe o ritmo dos depósitos.
      </StateBlock>
    </div>
  );
}

export default async function MetasPage({ searchParams }: PageProps<"/metas">) {
  const state = parseScreenState((await searchParams).estado);
  const failed = state === "erro";

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
      {state === "carregando" && <LoadingStatus />}
      <DetailHeader
        title="Suas metas"
        subtitle={`Acompanhadas pela Onça · ${goals.length} metas`}
        actions={<NewGoalButton />}
      />
      {state === "vazio" ? (
        <>
          <NoGoals />
          <div className="hidden items-center gap-2.5 @tab:flex @tab:justify-end">{savedLink}</div>
        </>
      ) : (
        <Skeleton active={state === "carregando"}>
          <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:gap-5">
            <GoalsHero
              replacement={failed && <ErrorBlocks mobile="tile" tablet="big" desktop="compact" />}
            />
            <StateSwap
              replacement={failed && <ErrorBlocks mobile="big" desktop="compact" />}
              overlayClassName="rounded-bubble bg-shade p-4"
            >
              <OncaTip action={chatWithOnca}>{goalsSummary.dica}</OncaTip>
            </StateSwap>
          </div>
          <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:grid-cols-3 @desk:gap-5">
            {goals.map((goal, index) => (
              <StateSwap
                key={goal.id}
                replacement={failed && goalErrors[index]}
                overlayClassName="rounded-[1.375rem] border border-line bg-card p-4.5"
              >
                <GoalCard goal={goal} />
              </StateSwap>
            ))}
          </div>
          <div className="@tab:hidden">
            <NewGoalButton block />
          </div>
          <div className="flex items-center gap-2.5 @tab:justify-end">{savedLink}</div>
        </Skeleton>
      )}
    </Page>
  );
}
