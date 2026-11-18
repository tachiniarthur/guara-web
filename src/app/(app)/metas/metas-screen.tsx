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
import { Note } from "@/components/ui/note";
import { useSession } from "@/features/acesso/session";
import {
  ChatAboutGoals,
  GoalCard,
  GoalsHero,
  GuaraGoalTip,
  NewGoalButton,
} from "@/features/metas/components/goal-parts";
import { isPlanLimit, useMetasView, type Goal, type GoalsSummary } from "@/features/metas/live";
import { useMyPlan } from "@/features/perfil/api";
import { cn } from "@/lib/utils";

const linkClass =
  "flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3";

const savedLink = (
  <Link href="/simulador/salvas" className={linkClass}>
    Ver simulações salvas
    <Icon name="chevron-right" size={16} />
  </Link>
);

/*
 * Carregando: a forma da tela com "—" (nada de valores de exemplo). Os textos só guardam a altura
 * de cada linha (ficam escondidos), para os cards terem o tamanho dos cards prontos.
 */
const EMPTY_SUMMARY: GoalsSummary = {
  guardado: "—",
  mensal: "—",
  mensalNota: "para — metas em andamento",
  sobrou: "—",
  sobrouQuando: "em —",
  dica: "Uma meta já foi atingida. A mais próxima é Nome da meta aqui, até mmm/aaaa: pede cerca de R$ 000 por mês.",
};

/**
 * Três metas só com a forma: os cards de meta aparecem girando enquanto a lista vem. Os textos
 * neutros ("R$ 00.000", "mmm/aaaa") têm o comprimento dos reais, para quebrar nas mesmas linhas.
 */
const LOADING_GOALS: Goal[] = [1, 2, 3].map((n) => ({
  id: `carregando-${n}`,
  href: "/metas",
  nome: "Nome da meta",
  onde: "Valor informado por você",
  icone: "target",
  status: { texto: "Em andamento", tom: "arara" },
  guardado: "R$ 00.000",
  alvo: "R$ 00.000",
  percentual: 0,
  mensal: "R$ 0.000/mês",
  previsao: "até mmm/aaaa",
}));

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
          <ButtonLink href="/perfil/planos" variant="forest" size="md" className="text-15">
            <span>Ver planos</span>
          </ButtonLink>
        }
      >
        Com metas, o Guará mostra quanto você já tem, quanto falta e quanto guardar por mês.
      </StateBlock>
    </Card>
  );
}

/** "Você usa as 2 metas do seu plano": para criar outra, exclua uma ou veja os planos. */
function FullNote({ max }: { max: number }) {
  return (
    <Note icon="info-lg" tone="info">
      Você usa {max === 1 ? "a meta" : `as ${max} metas`} do seu plano. Para criar outra, exclua uma
      meta ou{" "}
      <Link href="/perfil/planos" className="font-bold text-sand underline">
        veja os planos
      </Link>
      .
    </Note>
  );
}

/** Metas: tudo da API (carregando = forma vazia; sem API = erro). */
export function MetasScreen() {
  const { live } = useSession();
  const real = useMetasView({ enabled: live });
  const myPlan = useMyPlan({ enabled: live });
  const plan = isPlanLimit(real.error);
  const state = plan ? "plano" : real.error || !live ? "erro" : !real.data ? "carregando" : null;
  const goals = real.data?.goals ?? [];
  const shownGoals = state === "carregando" ? LOADING_GOALS : goals;
  const summary = real.data?.summary ?? EMPTY_SUMMARY;
  const empty = state === null && goals.length === 0;
  // Limite do plano (2, 4 ou 8 metas): cheio, some o "Nova meta" e aparece o aviso.
  const max = myPlan.data?.plan?.limits.maxGoals;
  const full = state === null && max !== undefined && goals.length >= max;
  const canCreate = !plan && !full;
  const count = goals.length === 1 ? "1 meta" : `${goals.length} metas`;

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
            canCreate ? (
              <IconButtonLink href="/metas/nova" icon="plus" label="Nova meta" />
            ) : undefined
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
            ? `Acompanhadas pelo Guará · ${max === undefined ? count : `${goals.length} de ${max} metas do plano`}`
            : "Acompanhadas pelo Guará"
        }
        actions={canCreate ? <NewGoalButton /> : undefined}
      />
      {full && <FullNote max={max} />}
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
              {shownGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </section>
          </div>
          {canCreate && (
            <div className="@tab:hidden">
              <NewGoalButton block />
            </div>
          )}
          <div className="flex items-center gap-2.5 @tab:justify-end @desk:hidden">{savedLink}</div>
        </Skeleton>
      )}
    </Page>
  );
}
