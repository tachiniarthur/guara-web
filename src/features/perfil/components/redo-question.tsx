"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSession } from "@/features/acesso/session";
import { useCurrentProfile } from "@/features/alocacao/live";
import {
  ProfileQuestionFields,
  QuestionContinue,
} from "@/features/onboarding/components/profile-question";
import { toProfileOptions, useQuestionnaire } from "@/features/onboarding/questionnaire";
import { formatDate } from "@/lib/format";

import { CompareProfilesLink, ProfileLevels, SavedTargets } from "./profile-today";
import { QuestionProgress } from "./redo-parts";

/** Refazer o perfil de investidor, uma pergunta por vez (`?pergunta=2`…), com o texto da API. */
export function RedoQuestionScreen({ numero: asked }: { numero: number }) {
  const { live } = useSession();
  const questionnaire = useQuestionnaire({ enabled: live });
  const current = useCurrentProfile({ enabled: live });
  const total = questionnaire.data?.questions.length ?? 0;
  const numero = total ? Math.min(Math.max(asked, 1), total) : asked;
  const question = questionnaire.data?.questions[numero - 1];
  const saved = current.data?.profile ?? null;
  const atual = saved?.label ?? null;
  const next =
    numero === total ? "/perfil/investidor/resultado" : `/perfil/investidor?pergunta=${numero + 1}`;
  const failed = !live || questionnaire.error || current.error;
  const subtitle = atual ? `Seu perfil atual: ${atual}` : "Você ainda não tem perfil salvo";

  const fields = (legendClassName: string, name: string) =>
    question && (
      <ProfileQuestionFields
        question={question}
        numero={numero}
        total={total}
        name={name}
        scope="refazer"
        kicker={`Mesmas ${total} perguntas do início · leva 2 minutos`}
        legendClassName={legendClassName}
      />
    );
  const progress = (
    <QuestionProgress label={`Pergunta ${numero} de ${total}`} done={numero} total={total} />
  );
  const note = atual && (
    <Note icon="info-lg" tone="info">
      Enquanto você não salvar, o perfil {atual} continua valendo.
    </Note>
  );

  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-5.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Refazer perfil" subtitle={subtitle} close="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Meu perfil", href: "/perfil" }, { label: "Refazer perfil" }]}
      />
      <DetailHeader title="Refazer perfil de investidor" subtitle={subtitle} />

      {failed ? (
        <ErrorBlock />
      ) : !question || !current.data ? (
        <LoadingStatus />
      ) : (
        <>
          {/* Celular e tablet */}
          <div className="flex flex-col gap-5.5 @tab:gap-5 @desk:hidden">
            <section className="contents @tab:flex @tab:flex-col @tab:gap-5.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6">
              {progress}
              {fields("", "refazer-m")}
            </section>
            {note}
          </div>

          {/* Desktop: a pergunta e, ao lado, o perfil de hoje. */}
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
            <Panel className="gap-5.5 p-7">
              {progress}
              {fields("text-26", "refazer-d")}
            </Panel>
            <div className="flex min-w-0 flex-col gap-5">
              {note}
              {saved && (
                <Panel className="grow gap-4 p-6">
                  <PanelHeader
                    title="Seu perfil hoje"
                    subtitle={`Respondido em ${formatDate(saved.createdAt)}`}
                    titleClassName="tracking-normal"
                  />
                  <ProfileLevels
                    levels={toProfileOptions(questionnaire.data!)}
                    current={saved.profile}
                  />
                  <SavedTargets saved={saved} />
                  <CompareProfilesLink count={questionnaire.data!.profiles.length} />
                </Panel>
              )}
            </div>
          </div>
        </>
      )}

      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        {question && <QuestionContinue scope="refazer" numero={numero} href={next} size="md" />}
      </div>
      {question && (
        <MobileActionBar>
          <QuestionContinue scope="refazer" numero={numero} href={next} className="grow" />
        </MobileActionBar>
      )}
    </Page>
  );
}
