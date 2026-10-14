import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { GroupDetailsList, ProfileLevels } from "@/features/alocacao/components/allocation-parts";
import { portfolioAllocation, profileById } from "@/features/alocacao/data";
import { ProfileQuestionFields } from "@/features/onboarding/components/profile-question";
import { profileQuestions } from "@/features/onboarding/data";
import { QuestionProgress } from "@/features/perfil/components/redo-parts";

const atual = profileById[portfolioAllocation.perfil].nome;

/** Refazer o perfil de investidor, uma pergunta por vez (`?pergunta=2`…). */
export default async function RefazerPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ pergunta?: string }>;
}) {
  const total = profileQuestions.length;
  const numero = Math.min(Math.max(Number((await searchParams).pergunta) || 1, 1), total);
  const question = profileQuestions[numero - 1]!;
  const next =
    numero === total ? "/perfil/investidor/resultado" : `/perfil/investidor?pergunta=${numero + 1}`;

  const progress = (
    <QuestionProgress label={`Pergunta ${numero} de ${total}`} done={numero} total={total} />
  );
  const fields = (legendClassName: string, name: string) => (
    <ProfileQuestionFields
      question={question}
      numero={numero}
      total={total}
      name={name}
      kicker={`Mesmas ${total} perguntas do início · leva 2 minutos`}
      legendClassName={legendClassName}
    />
  );
  const note = (
    <Note icon="info-lg" tone="info">
      Enquanto você não salvar, o perfil {atual} continua valendo.
    </Note>
  );
  const continueButton = (
    <ButtonLink href={next} variant="light" className="text-15">
      <span>Continuar</span>
    </ButtonLink>
  );

  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-5.5 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Refazer perfil"
          subtitle={`Seu perfil atual: ${atual}`}
          close="/perfil"
          balanced
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Meu perfil", href: "/perfil" }, { label: "Refazer perfil" }]}
      />
      <DetailHeader title="Refazer perfil de investidor" subtitle={`Seu perfil atual: ${atual}`} />

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
          <Panel className="grow p-6">
            <PanelHeader
              title="Seu perfil hoje"
              subtitle={`Respondido em ${portfolioAllocation.definidoEm}`}
              titleClassName="tracking-normal"
            />
            <ProfileLevels />
            <GroupDetailsList layout="wide" targetOnly />
            <div className="flex justify-end">
              <Link
                href="/investimentos/alocacao/perfis"
                className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
              >
                Comparar os 4 perfis
                <Icon name="chevron-right" size={16} />
              </Link>
            </div>
          </Panel>
        </div>
      </div>

      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        {continueButton}
      </div>
      <MobileActionBar>
        <ButtonLink href={next} variant="light" size="xl" block>
          <span>Continuar</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
