"use client";

import Link from "next/link";

import { DetailGrid } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  donutSizes,
  GroupDetailsList,
  ProfileLevels,
  TargetDonutWithList,
} from "@/features/alocacao/components/allocation-parts";
import { OffTargetNote } from "@/features/alocacao/components/allocation-summary";
import { portfolioAllocation, profileById, type ProfileId } from "@/features/alocacao/data";
import { profileEffects } from "@/features/onboarding/data";
import {
  answersSummary,
  estimateProfile,
  profileDescription,
  type ProfileAnswerMap,
} from "@/features/onboarding/profile";
import { useResultAnswers } from "@/features/onboarding/use-result-answers";
import { cn } from "@/lib/utils";

import { IconRowList } from "./icon-row-list";
import { QuestionProgress } from "./redo-parts";

const saved = portfolioAllocation.perfil;

function Heading({
  profile,
  answers,
  titleClassName,
}: {
  profile: ProfileId;
  answers: ProfileAnswerMap;
  titleClassName: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-13 text-caption">Resultado</span>
      <h1
        className={cn(
          "m-0 font-display leading-[1.2] font-extrabold tracking-[-0.01em]",
          titleClassName,
        )}
      >
        Seu perfil é <span className="text-tucano">{profileById[profile].nome}</span>
      </h1>
      <p className="m-0 text-15 leading-[1.55] text-mist">{profileDescription(profile, answers)}</p>
    </div>
  );
}

/** "Antes: Moderado… Agora: Arrojado." com o que muda ao salvar. */
function ChangeNote({ profile }: { profile: ProfileId }) {
  const same = profile === saved;
  return (
    <Note
      icon={same ? "check" : "info"}
      tone="info"
      className={same ? "bg-folha-bg" : undefined}
      iconClassName={same ? "text-folha" : undefined}
    >
      Antes: <strong>{profileById[saved].nome}</strong>, respondido em{" "}
      {portfolioAllocation.definidoEm}. Agora: <strong>{profileById[profile].nome}</strong>.{" "}
      {same
        ? "Seu perfil continua o mesmo; ao salvar, a data é atualizada."
        : "Ao salvar, as sugestões de Investimentos passam a seguir o novo perfil."}
    </Note>
  );
}

function SplitPanel({
  profile,
  size,
}: {
  profile: ProfileId;
  size: "mobile" | "tablet" | "desktop";
}) {
  const dims =
    size === "desktop" ? donutSizes.xl : size === "tablet" ? donutSizes.md : donutSizes.result;
  return (
    <Panel className={size === "desktop" ? "p-6" : "p-5"}>
      <PanelHeader
        title="Como o Guará vai dividir as sugestões"
        subtitle={`Carteira-alvo do perfil ${profileById[profile].nome} em 5 grupos · toque num grupo para ver as subclasses · a marca branca é a sua carteira hoje`}
        titleClassName={cn("tracking-normal", size === "mobile" ? "text-18" : "text-20")}
      />
      <TargetDonutWithList profile={profile} dims={dims} />
      <GroupDetailsList
        profile={profile}
        layout={size === "mobile" ? "compact" : "wide"}
        openGroup="rv-br"
      />
      <OffTargetNote
        profile={profile}
        after="O Pacu pode sugerir como ajustar, mas nada muda sem você."
      />
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
  );
}

function Answers({ answers, wide }: { answers: ProfileAnswerMap; wide?: boolean }) {
  return (
    <Panel className={wide ? "p-6" : "p-5"}>
      <PanelHeader
        title="Suas respostas"
        titleClassName={cn("tracking-normal", wide ? "text-18" : "text-16")}
      />
      <DetailGrid
        items={answersSummary(answers).map((a) => ({ label: a.pergunta, value: a.resposta }))}
      />
    </Panel>
  );
}

/**
 * Resultado do "Refazer perfil": o perfil calculado das respostas desta vez, comparado com o que
 * vale hoje, a carteira-alvo dele e as respostas.
 */
export function RedoResult() {
  const answers = useResultAnswers("refazer");
  const profile = estimateProfile(answers);
  const effects = profileEffects.map((e) => ({
    ...e,
    texto: e.texto.replace("Moderado", profileById[profile].nome),
  }));
  return (
    <>
      {/* Celular */}
      <div className="flex flex-col gap-5 @tab:hidden">
        <QuestionProgress label="6 de 6 respondidas" done={6} total={6} />
        <Heading profile={profile} answers={answers} titleClassName="text-26" />
        <ProfileLevels profile={profile} />
        <ChangeNote profile={profile} />
        <SplitPanel profile={profile} size="mobile" />
        <Answers answers={answers} />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Heading profile={profile} answers={answers} titleClassName="text-30" />
        <ProfileLevels profile={profile} />
        <ChangeNote profile={profile} />
        <SplitPanel profile={profile} size="tablet" />
        <Answers answers={answers} />
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel className="gap-4.5 p-6">
            <Heading profile={profile} answers={answers} titleClassName="text-32" />
            <ProfileLevels profile={profile} />
            <ChangeNote profile={profile} />
          </Panel>
          <Answers answers={answers} wide />
          <Panel className="grow p-6">
            <PanelHeader
              title="O que o perfil muda no app"
              titleClassName="text-18 tracking-normal"
            />
            <IconRowList items={effects} />
          </Panel>
        </div>
        <SplitPanel profile={profile} size="desktop" />
      </div>
    </>
  );
}
