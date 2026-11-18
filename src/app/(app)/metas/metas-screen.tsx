"use client";

import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { useSession } from "@/features/acesso/session";
import {
  ChatAboutGoals,
  GoalCard,
  GoalsHero,
  GuaraGoalTip,
  NewGoalButton,
} from "@/features/metas/components/goal-parts";
import { isPlanLimit, useMetasView, type GoalsSummary } from "@/features/metas/live";
import { cn } from "@/lib/utils";

const linkClass =
  "flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3";

const savedLink = (
  <Link href="/simulador/salvas" className={linkClass}>
    Ver simulações salvas
    <Icon name="chevron-right" size={16} />
  </Link>
);

/** Carregando: a forma da tela com "—" (nada de valores de exemplo). */
const EMPTY_SUMMARY: GoalsSummary = {
  guardado: "—",
  mensal: "—",
  mensalNota: "",
  sobrou: "—",
  sobrouQuando: "",
  dica: "",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-card border border-line-strong bg-mata p-5",
        "@tab:min-h-[26.75rem] @tab:gap-3 @tab:rounded-[1.375rem] @tab:border-line @tab:bg-card @tab:p-4.5 @desk:min-h-75",
      )}
    >
      {children}
    </div>
  );
}

/** "Nenhuma meta ainda": na mata no celular, num card de meta nas outras telas. */
function NoGoals() {
  return (
    <Card>
      <StateBlock
        icon="target"
        title="Nenhuma meta ainda"
        action={
          <ButtonLink href="/metas/nova" variant="forest" size="md" className="text-15">
            <span>Criar primeira meta</span>
          </ButtonLink>
        }
      >
        Crie uma meta, como reserva de emergência ou viagem, e acompanhe quanto falta.
      </StateBlock>
    </Card>
  );
}

/** Metas não fazem parte do plano atual. */
function PlanBlock() {
  return (
    <Card>
      <StateBlock
        icon="lock"
        title="Metas fazem parte de outro plano"
        action={
          <ButtonLink href="/configuracoes/planos" variant="forest" size="md" className="text-15">
            <span>Ver planos</span>
          </ButtonLink>
        }
      >
        Com metas, o Guará mostra quanto você já tem, quanto falta e quanto guardar por mês.
      </StateBlock>
    </Card>
  );
}

/** Metas: tudo da API (carregando = forma vazia; sem API = erro). */
export function MetasScreen() {
  const { live } = useSession();
  const real = useMetasView({ enabled: live });
  const plan = isPlanLimit(real.error);
  const state = plan ? "plano" : real.error || !live ? "erro" : !real.data ? "carregando" : null;
  const goals = real.data?.goals ?? [];
  const summary = real.data?.summary ?? EMPTY_SUMMARY;
  const empty = state === null && goals.length === 0;

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Suas metas"
          back="/"
          actions={
            plan ? undefined : <IconButtonLink href="/metas/nova" icon="plus" label="Nova meta" />
          }
        />
      }
    >
      <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Metas" }]} />
      {state === "carregando" && <LoadingStatus />}
      <DetailHeader
        title="Suas metas"
        subtitle={
          real.data
            ? `Acompanhadas pelo Guará · ${goals.length === 1 ? "1 meta" : `${goals.length} metas`}`
            : "Acompanhadas pelo Guará"
        }
        actions={plan ? undefined : <NewGoalButton />}
      />
      {state === "plano" ? (
        <PlanBlock />
      ) : state === "erro" ? (
        <ErrorBlock />
      ) : empty ? (
        <>
          <NoGoals />
          <div className="hidden items-center gap-2.5 @tab:flex @tab:justify-end">{savedLink}</div>
        </>
      ) : (
        <Skeleton active={state === "carregando"}>
          {/*
           * Desktop: as metas em cards largos à esquerda; o resumo, a dica do Guará e os atalhos numa
           * coluna à direita. Celular e tablet: resumo e a dica do Guará primeiro, depois as metas.
           */}
          <div className="flex flex-col gap-4 @desk:grid @desk:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] @desk:items-start @desk:gap-5">
            <div className="flex min-w-0 flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:order-2 @desk:flex @desk:flex-col">
              <GoalsHero summary={summary} />
              {summary.dica && (
                <GuaraGoalTip action={<ChatAboutGoals question="Como estão as minhas metas?" />}>
                  {summary.dica}
                </GuaraGoalTip>
              )}
              <div className="hidden flex-col gap-1 @desk:flex">
                {savedLink}
                <Link href="/simulador/objetivo" className={linkClass}>
                  Simular uma meta nova
                  <Icon name="chevron-right" size={16} />
                </Link>
              </div>
            </div>
            <section aria-label="Metas" className="flex min-w-0 flex-col gap-3.5 @desk:order-1">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </section>
          </div>
          <div className="@tab:hidden">
            <NewGoalButton block />
          </div>
          <div className="flex items-center gap-2.5 @tab:justify-end @desk:hidden">{savedLink}</div>
        </Skeleton>
      )}
    </Page>
  );
}
