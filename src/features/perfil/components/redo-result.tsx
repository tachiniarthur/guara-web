"use client";

import { useRouter } from "next/navigation";

import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Button, ButtonLink } from "@/components/ui/button";
import { DetailGrid } from "@/components/ui/detail-list";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ClassSwatch } from "@/features/alocacao/components/class-allocation";
import { Donut, donutSizes } from "@/features/alocacao/components/donut";
import { formatPercent } from "@/features/alocacao/format";
import { useCurrentProfile, type InvestorProfileResponse } from "@/features/alocacao/live";
import { useSession } from "@/features/acesso/session";
import { RequireEarlierAnswers } from "@/features/onboarding/components/profile-question";
import { saveErrorText, useResultData } from "@/features/onboarding/components/profile-result";
import { profileEffects } from "@/features/onboarding/data";
import {
  answersSummary,
  classesOf,
  toProfileOptions,
  useSaveProfile,
  type AnswerMap,
  type ProfileOption,
  type Questionnaire,
} from "@/features/onboarding/questionnaire";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { IconRowList } from "./icon-row-list";
import { CompareProfilesLink, ProfileLevels } from "./profile-today";
import { QuestionProgress } from "./redo-parts";

type Saved = InvestorProfileResponse["profile"];

function Heading({ profile, titleClassName }: { profile: ProfileOption; titleClassName: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-13 text-caption">Resultado</span>
      <h1
        className={cn(
          "m-0 font-display leading-[1.2] font-extrabold tracking-[-0.01em]",
          titleClassName,
        )}
      >
        Seu perfil é <span className="text-tucano">{profile.nome}</span>
      </h1>
      <p className="m-0 text-15 leading-[1.55] text-mist">{profile.descricao}</p>
    </div>
  );
}

/** "Antes: Moderado… Agora: Arrojado." com o que muda ao salvar. */
function ChangeNote({ profile, saved }: { profile: ProfileOption; saved: Saved }) {
  if (!saved) {
    return (
      <Note icon="info" tone="info">
        Ao salvar, a Alocação passa a comparar a sua carteira com o alvo {profile.nome}.
      </Note>
    );
  }
  const same = profile.kind === saved.profile;
  return (
    <Note
      icon={same ? "check" : "info"}
      tone="info"
      className={same ? "bg-folha-bg" : undefined}
      iconClassName={same ? "text-folha" : undefined}
    >
      Antes: <strong>{saved.label}</strong>, respondido em {formatDate(saved.createdAt)}. Agora:{" "}
      <strong>{profile.nome}</strong>.{" "}
      {same
        ? "Seu perfil continua o mesmo; ao salvar, a data é atualizada."
        : "Ao salvar, a Alocação passa a comparar a sua carteira com o novo perfil."}
    </Note>
  );
}

function SplitPanel({
  profile,
  questionnaire,
  size,
}: {
  profile: ProfileOption;
  questionnaire: Questionnaire;
  size: "mobile" | "tablet" | "desktop";
}) {
  const classes = classesOf(questionnaire);
  const dims =
    size === "desktop" ? donutSizes.xl : size === "tablet" ? donutSizes.md : donutSizes.result;
  return (
    <Panel className={cn("gap-4", size === "desktop" ? "p-6" : "p-5")}>
      <PanelHeader
        title="Como o perfil divide a carteira"
        subtitle={`Carteira-alvo do perfil ${profile.nome} em ${classes.length} classes`}
        titleClassName={cn("tracking-normal", size === "mobile" ? "text-18" : "text-20")}
      />
      <div className="flex flex-col items-center gap-4 @tab:flex-row @tab:gap-8">
        <Donut
          arcs={classes.map((c) => ({ id: c.id, color: c.cor, value: profile.alvo[c.id] }))}
          dims={dims}
          caption="Alvo"
          value={profile.nome}
          label={`Carteira-alvo do perfil ${profile.nome}: ${classes
            .map((c) => `${c.nome} ${formatPercent(profile.alvo[c.id])}`)
            .join(", ")}`}
        />
        <ul className="m-0 w-full min-w-0 grow list-none p-0">
          {classes.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2.5 border-b border-line py-2 text-14 last:border-b-0"
            >
              <ClassSwatch color={c.cor} />
              <span className="min-w-0 grow">{c.nome}</span>
              <strong className="tabular-nums">{formatPercent(profile.alvo[c.id])}</strong>
            </li>
          ))}
        </ul>
      </div>
      <CompareProfilesLink count={questionnaire.profiles.length} />
    </Panel>
  );
}

function Answers({
  questionnaire,
  answers,
  wide,
}: {
  questionnaire: Questionnaire;
  answers: AnswerMap;
  wide?: boolean;
}) {
  return (
    <Panel className={wide ? "p-6" : "p-5"}>
      <PanelHeader
        title="Suas respostas"
        titleClassName={cn("tracking-normal", wide ? "text-18" : "text-16")}
      />
      <DetailGrid
        items={answersSummary(questionnaire, answers).map((a) => ({
          label: a.pergunta,
          value: a.resposta,
        }))}
      />
    </Panel>
  );
}

function Actions({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  const label = saving ? "Salvando…" : "Salvar perfil";
  return (
    <>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        <ButtonLink href="/perfil/investidor" variant="secondary" className="text-15">
          <span>Refazer</span>
        </ButtonLink>
        <Button variant="primary" className="text-15" disabled={saving} onClick={onSave}>
          <Icon name="check" size={18} />
          <span>{label}</span>
        </Button>
      </div>
      <MobileActionBar className="items-center">
        <ButtonLink href="/perfil/investidor" variant="secondary" size="xl">
          <span>Refazer</span>
        </ButtonLink>
        <Button variant="primary" size="xl" className="grow" disabled={saving} onClick={onSave}>
          <Icon name="check" size={18} />
          <span>{label}</span>
        </Button>
      </MobileActionBar>
    </>
  );
}

/**
 * Resultado do "Refazer perfil": o perfil que a API calcula das respostas (sem gravar),
 * comparado com o que vale hoje, a carteira-alvo dele e as respostas. "Salvar perfil" grava.
 */
export function RedoResult() {
  const router = useRouter();
  const { live } = useSession();
  const { questionnaire, answers, body, preview, failed } = useResultData("refazer");
  const current = useCurrentProfile({ enabled: live });
  const save = useSaveProfile();

  if (failed || current.error) return <ErrorBlock />;
  if (!questionnaire || !answers || !body || !preview || !current.data)
    return (
      <>
        {questionnaire && (
          <RequireEarlierAnswers before={questionnaire.questions.length + 1} scope="refazer" />
        )}
        <LoadingStatus />
      </>
    );

  const profiles = toProfileOptions(questionnaire);
  const profile = profiles.find((p) => p.kind === preview.profile)!;
  const saved = current.data.profile;
  const total = questionnaire.questions.length;
  const effects = profileEffects.map((e) => ({
    ...e,
    texto: e.texto.replace("Moderado", profile.nome),
  }));
  const levels = <ProfileLevels levels={profiles} current={profile.kind} />;
  const onSave = () =>
    save.mutate(
      { version: questionnaire.version, answers: body, chosen: null },
      { onSuccess: () => router.push("/perfil") },
    );
  const error = save.error && (
    <Note icon="alert-triangle" tone="warning">
      {saveErrorText(save.error)}
    </Note>
  );

  return (
    <>
      {/* Celular */}
      <div className="flex flex-col gap-5 @tab:hidden">
        <QuestionProgress label={`${total} de ${total} respondidas`} done={total} total={total} />
        <Heading profile={profile} titleClassName="text-26" />
        {levels}
        <ChangeNote profile={profile} saved={saved} />
        <SplitPanel profile={profile} questionnaire={questionnaire} size="mobile" />
        <Answers questionnaire={questionnaire} answers={answers} />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Heading profile={profile} titleClassName="text-30" />
        {levels}
        <ChangeNote profile={profile} saved={saved} />
        <SplitPanel profile={profile} questionnaire={questionnaire} size="tablet" />
        <Answers questionnaire={questionnaire} answers={answers} />
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel className="gap-4.5 p-6">
            <Heading profile={profile} titleClassName="text-32" />
            {levels}
            <ChangeNote profile={profile} saved={saved} />
          </Panel>
          <Answers questionnaire={questionnaire} answers={answers} wide />
          <Panel className="grow p-6">
            <PanelHeader
              title="O que o perfil muda no app"
              titleClassName="text-18 tracking-normal"
            />
            <IconRowList items={effects} />
          </Panel>
        </div>
        <SplitPanel profile={profile} questionnaire={questionnaire} size="desktop" />
      </div>
      {error}
      <Actions saving={save.isPending} onSave={onSave} />
    </>
  );
}
