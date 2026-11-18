"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Button } from "@/components/ui/button";
import { Collapse } from "@/components/ui/collapse";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Presence } from "@/components/ui/presence";
import { PendingLinkButton } from "@/components/ui/pending-link-button";
import { useSession } from "@/features/acesso/session";
import { ClassSwatch } from "@/features/alocacao/components/class-allocation";
import { Donut, donutSizes } from "@/features/alocacao/components/donut";
import { formatPercent } from "@/features/alocacao/format";
import type { ProfileKind } from "@/features/alocacao/live";
import { useTweenNumber } from "@/hooks/use-tween";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useProfileAnswers, type QuestionnaireScope } from "@/stores/profile-answers";

import { onboardingSteps, profileEffects } from "../data";
import {
  answersSummary,
  classesOf,
  riskShare,
  toAnswerBody,
  toProfileOptions,
  useProfilePreview,
  useQuestionnaire,
  useSaveProfile,
  type AnswerMap,
  type ProfileOption,
  type Questionnaire,
} from "../questionnaire";
import { OnboardingActions, OnboardingSteps } from "./onboarding-shell";
import { RequireEarlierAnswers } from "./profile-question";

const subscribeNothing = () => () => {};

/** Percentual que anda até o valor novo quando o perfil muda (em vez de pular). */
function TweenPercent({ value }: { value: number }) {
  return formatPercent(useTweenNumber(value));
}

/** Diferença entre dois perfis numa classe ("+5%", "−10%", "igual"), andando junto com os números. */
function TweenDiff({ value }: { value: number }) {
  const shown = useTweenNumber(value);
  if (shown === 0) return "igual";
  return `${shown > 0 ? "+" : "−"}${formatPercent(Math.abs(shown))}`;
}

type Classes = ReturnType<typeof classesOf>;

/** Escala dos perfis, clicável: o do questionário vem marcado e tem a etiqueta "indicado". */
function ProfilePicker({
  profiles,
  current,
  viewing,
  suggested,
  onPick,
}: {
  profiles: ProfileOption[];
  current: ProfileKind;
  /** O perfil aberto na comparação (contorno). */
  viewing: ProfileKind | null;
  suggested: ProfileKind;
  onPick: (kind: ProfileKind) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Perfil de investidor" className="flex gap-1.5">
      {profiles.map((p) => {
        const on = p.kind === current;
        return (
          <button
            key={p.kind}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(p.kind)}
            className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 border-none bg-transparent p-0 text-sand"
          >
            <span
              className={cn(
                "h-2 w-full rounded-[4px] transition-colors",
                on
                  ? "bg-tucano"
                  : p.kind === viewing
                    ? "bg-sand/70"
                    : "bg-shade group-hover:bg-line-strong",
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1.5 text-13",
                on ? "font-extrabold text-sand" : "font-medium text-caption group-hover:text-sand",
              )}
            >
              {p.nome}
              {p.kind === suggested && (
                <span className="rounded-full bg-shade px-1.5 py-px text-11 font-bold text-mist">
                  indicado
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Comparação do perfil que vale com o que a pessoa abriu: para quem é cada um, quanto vai para
 * renda variável e alternativos e a diferença classe a classe. Daqui ela escolhe trocar (com o
 * termo) ou mantém o que vale.
 */
function ProfileComparison({
  a,
  b,
  classes,
  suggested,
  onChoose,
  onClose,
}: {
  /** O perfil que vale agora (o indicado, ou o escolhido depois do termo). */
  a: ProfileOption;
  b: ProfileOption;
  classes: Classes;
  suggested: ProfileKind;
  onChoose: () => void;
  onClose: () => void;
}) {
  return (
    <Panel
      aria-label={`Comparação: ${a.nome} e ${b.nome}`}
      className="gap-4 border-sand/40 p-4.5 md:p-5.5 lg:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelHeader
          title={`${a.nome} × ${b.nome}`}
          subtitle="O que muda no alvo da carteira se você escolher outro perfil"
          titleClassName="text-18 tracking-normal"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar a comparação"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent text-sand hover:bg-shade"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { profile: a, tag: a.kind === suggested ? "seu perfil (indicado)" : "seu perfil agora" },
          {
            profile: b,
            tag: b.kind === suggested ? "indicado pelo questionário" : "o que você abriu",
          },
        ].map(({ profile, tag }) => (
          // A chave troca com o perfil: o card novo entra esmaecendo em vez de trocar seco.
          <div
            key={profile.kind}
            className="flex animate-fade-in flex-col gap-1 rounded-tile bg-field px-4 py-3.5"
          >
            <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">{tag}</span>
            <strong className="font-display text-20">{profile.nome}</strong>
            <span className="text-13 text-mist">{profile.descricao}</span>
            <span className="text-13 text-sand">
              <strong>
                <TweenPercent value={riskShare(profile)} />
              </strong>{" "}
              em renda variável e alternativos
            </span>
          </div>
        ))}
      </div>
      <div role="table" aria-label="Carteira-alvo classe a classe" className="flex flex-col">
        <div
          role="row"
          className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-2 border-b border-line pb-2 text-12 font-bold text-caption"
        >
          <span role="columnheader">Classe</span>
          <span role="columnheader" className="text-right">
            {a.nome}
          </span>
          <span role="columnheader" className="text-right">
            {b.nome}
          </span>
          <span role="columnheader" className="text-right">
            Diferença
          </span>
        </div>
        {classes.map((c) => {
          const diff = b.alvo[c.id] - a.alvo[c.id];
          return (
            <div
              key={c.id}
              role="row"
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] items-center gap-2 border-b border-line py-2 text-13 last:border-b-0"
            >
              <span role="cell" className="flex min-w-0 items-center gap-2">
                <ClassSwatch color={c.cor} />
                <span className="truncate">{c.nome}</span>
              </span>
              <span role="cell" className="text-right tabular-nums">
                <TweenPercent value={a.alvo[c.id]} />
              </span>
              <span role="cell" className="text-right font-bold tabular-nums">
                <TweenPercent value={b.alvo[c.id]} />
              </span>
              <span
                role="cell"
                className={cn(
                  "text-right font-bold tabular-nums transition-colors duration-300",
                  diff > 0 ? "text-tucano" : diff < 0 ? "text-arara" : "text-caption",
                )}
              >
                <TweenDiff value={diff} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="light" onClick={onChoose}>
          <span>
            {b.kind === suggested ? `Voltar ao ${b.nome}` : `Escolher o perfil ${b.nome}`}
          </span>
        </Button>
        <Button variant="ghost" onClick={onClose}>
          <span>Manter {a.nome}</span>
        </Button>
      </div>
    </Panel>
  );
}

/**
 * Termo para trocar o perfil do questionário por outro escolhido pela pessoa. A API guarda a
 * troca com data e hora. Fica no centro da coluna das etapas (no desktop, à direita da faixa
 * lateral), não da janela inteira.
 */
function ChangeTerm({
  from,
  to,
  riskier,
  onCancel,
  onConfirm,
}: {
  from: ProfileOption;
  to: ProfileOption;
  riskier: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("input, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onCancel}
        data-motion="backdrop"
        className="absolute inset-0 border-none bg-[rgba(5,9,7,0.72)]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 lg:left-[35rem]">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={`Trocar para o perfil ${to.nome}?`}
          data-motion="dialog"
          className="pointer-events-auto flex max-h-full w-full max-w-[35rem] flex-col gap-4 overflow-y-auto rounded-card border border-line-strong bg-card p-6"
        >
          <h2 className="m-0 font-display text-22 leading-tight font-extrabold">
            Trocar para o perfil {to.nome}?
          </h2>
          <div className="flex flex-col gap-3.5 text-14 leading-[1.55] text-mist">
            <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">
              Termo de alteração do perfil de investidor
            </span>
            <p className="m-0">
              O questionário indicou o perfil <strong className="text-sand">{from.nome}</strong>. Ao
              confirmar, você declara que escolheu o perfil{" "}
              <strong className="text-sand">{to.nome}</strong> por conta própria.
            </p>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              <li>
                A Alocação passa a comparar a sua carteira com o alvo {to.nome}:{" "}
                <strong className="text-sand">{formatPercent(riskShare(to))}</strong> em renda
                variável e alternativos (no {from.nome}, {formatPercent(riskShare(from))}).
              </li>
              <li>
                {riskier
                  ? "Mais risco: a carteira pode oscilar mais e ter perdas maiores no curto prazo."
                  : "Menos risco: a carteira oscila menos, mas tende a render menos no longo prazo."}
              </li>
              <li>
                A troca fica registrada com data e hora. Você pode voltar ao perfil do questionário
                quando quiser, em Meu perfil.
              </li>
            </ul>
            <label className="flex cursor-pointer items-start gap-3 rounded-tile bg-shade px-3.5 py-3 text-sand">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="m-0 mt-0.5 size-5 shrink-0 accent-tucano"
              />
              <span>Li e concordo com a troca para o perfil {to.nome}.</span>
            </label>
            <p className="m-0 text-12 text-caption">
              Simulações e sugestões são educativas e não são recomendação de investimento.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              <span>Cancelar</span>
            </Button>
            <Button variant="primary" disabled={!agreed} onClick={onConfirm}>
              <span>Confirmar troca</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Carteira-alvo do perfil: rosca e percentual de cada classe, sem comparar com a carteira. */
function TargetAllocation({ profile, classes }: { profile: ProfileOption; classes: Classes }) {
  return (
    <Panel className="animate-fade-up gap-4 p-4.5 [animation-delay:160ms] md:p-5.5 lg:p-5">
      <PanelHeader
        title={`Carteira-alvo ${profile.nome}`}
        subtitle="Como o perfil divide a carteira entre as classes"
        titleClassName="text-18 tracking-normal"
      />
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8 lg:flex-col lg:gap-3">
        <Donut
          arcs={classes.map((c) => ({ id: c.id, color: c.cor, value: profile.alvo[c.id] }))}
          dims={donutSizes.card}
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
              className="flex items-center gap-2.5 border-b border-line py-1.5 text-13 last:border-b-0"
            >
              <ClassSwatch color={c.cor} />
              <span className="min-w-0 grow">{c.nome}</span>
              <strong className="tabular-nums">
                <TweenPercent value={profile.alvo[c.id]} />
              </strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="m-0 mt-auto flex items-start gap-2 text-12 leading-[1.5] text-mist">
        <Icon name="info" size={16} className="mt-px shrink-0" />
        <span>
          Para comparar com a sua carteira, acesse{" "}
          <strong className="text-sand">Investimentos</strong> depois do cadastro.
        </span>
      </p>
    </Panel>
  );
}

/** Mensagem de erro ao salvar o perfil. */
export function saveErrorText(error: unknown) {
  if (error instanceof ApiError && error.code === "validation_failed")
    return "O questionário mudou desde que você respondeu. Refaça as perguntas, por favor.";
  return error instanceof ApiError ? error.message : "Não deu para salvar o perfil. Tente de novo.";
}

/**
 * Resultado do questionário (o que a tela mostra com os dados prontos): o perfil indicado pela
 * API, a escala para escolher outro (com termo de troca), a carteira-alvo, as respostas e o que
 * muda no app. "Continuar" grava o perfil (com a troca, se houver).
 */
export function ProfileResultView({
  questionnaire,
  answers,
  suggested,
  saving,
  error,
  onContinue,
}: {
  questionnaire: Questionnaire;
  answers: AnswerMap;
  /** O perfil que a API indicou para as respostas. */
  suggested: ProfileKind;
  saving: boolean;
  error: string | null;
  onContinue: (chosen: ProfileKind | null) => void;
}) {
  const profiles = toProfileOptions(questionnaire);
  const classes = classesOf(questionnaire);
  const byKind = (kind: ProfileKind) => profiles.find((p) => p.kind === kind)!;
  const levelOf = (kind: ProfileKind) => profiles.findIndex((p) => p.kind === kind);
  // Outro perfil escolhido pela pessoa (depois do termo); `null` = vale o do questionário.
  const [override, setOverride] = useState<ProfileKind | null>(null);
  const kind = override ?? suggested;
  const setProfile = (next: ProfileKind) => setOverride(next === suggested ? null : next);
  /**
   * Comparação aberta: o perfil que valia ao abrir e o que a pessoa abriu (ainda não escolhido).
   * Fica guardada enquanto a comparação fecha, para ela recolher sem trocar de conteúdo.
   */
  const [compare, setCompare] = useState<{ base: ProfileKind; other: ProfileKind } | null>(null);
  const [open, setOpen] = useState(false);
  const viewing = open ? (compare?.other ?? null) : null;
  /** Perfil a confirmar no termo. */
  const [pending, setPending] = useState<ProfileKind | null>(null);
  const profile = byKind(kind);
  const total = questionnaire.questions.length;

  const show = (other: ProfileKind) => {
    setCompare({ base: kind, other });
    setOpen(true);
  };
  // Tocar num perfil abre a comparação com o que vale agora; tocar no que já vale fecha.
  const pick = (other: ProfileKind) => (other === kind ? setOpen(false) : show(other));
  // Escolher na comparação: voltar ao indicado não precisa de termo; outro perfil, sim.
  const choose = (other: ProfileKind) => {
    if (other === suggested) {
      setProfile(other);
      setOpen(false);
    } else {
      setPending(other);
    }
  };

  return (
    <>
      <OnboardingSteps current={3} steps={onboardingSteps} />
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-5">
        <div className="flex animate-fade-up flex-col gap-2 lg:col-span-3">
          <span className="text-13 text-caption">
            Resultado · {total} de {total} respondidas
          </span>
          <h1 className="m-0 font-display text-26 leading-[1.2] font-extrabold tracking-[-0.01em] md:text-30">
            Seu perfil é <span className="text-tucano">{profile.nome}</span>
          </h1>
          {override ? (
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-15 leading-[1.55] text-mist">
              <span>Escolhido por você. O questionário indicou {byKind(suggested).nome}.</span>
              <button
                type="button"
                onClick={() => show(suggested)}
                className="cursor-pointer border-none bg-transparent p-0 text-14 font-bold text-sand underline underline-offset-4 hover:text-tucano"
              >
                Comparar com o {byKind(suggested).nome}
              </button>
            </p>
          ) : (
            <p className="m-0 text-15 leading-[1.55] text-mist">
              {profile.descricao} Quer ver outro? Toque num perfil abaixo para comparar.
            </p>
          )}
        </div>
        <div className="animate-fade-up [animation-delay:80ms] lg:col-span-3">
          <ProfilePicker
            profiles={profiles}
            current={kind}
            viewing={viewing}
            suggested={suggested}
            onPick={pick}
          />
          {compare && (
            <Collapse open={open} className="pt-5 md:pt-6">
              <ProfileComparison
                a={byKind(compare.base)}
                b={byKind(compare.other)}
                classes={classes}
                suggested={suggested}
                onChoose={() => choose(compare.other)}
                onClose={() => setOpen(false)}
              />
            </Collapse>
          )}
        </div>
        <TargetAllocation profile={profile} classes={classes} />
        <Panel className="animate-fade-up gap-3.5 p-4.5 [animation-delay:240ms] md:p-5.5 lg:p-5">
          <PanelHeader title="Suas respostas" titleClassName="text-18 tracking-normal" />
          <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13">
            {answersSummary(questionnaire, answers).map((answer) => (
              <div key={answer.pergunta} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption">{answer.pergunta}</dt>
                <dd className="m-0 font-semibold text-sand">{answer.resposta}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 mt-auto text-12 leading-[1.5] text-caption">
            O perfil vale só para Investimentos. Dá para refazer quando quiser em Meu perfil.
          </p>
        </Panel>
        <Panel className="animate-fade-up gap-3.5 p-4.5 [animation-delay:320ms] md:p-5.5 lg:p-5">
          <PanelHeader title="O que o perfil muda" titleClassName="text-18 tracking-normal" />
          <ul className="m-0 flex list-none flex-col p-0">
            {profileEffects.map((effect, i) => (
              <li
                key={effect.titulo}
                className={cn(
                  "flex items-start gap-3 py-2.5",
                  i < profileEffects.length - 1 && "border-b border-line",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
                >
                  <Icon name={effect.icon} />
                </span>
                <span className="flex min-w-0 grow flex-col leading-[1.35]">
                  <span className="font-medium">{effect.titulo}</span>
                  <span className="text-12 text-caption">
                    {effect.texto.replace("Moderado", profile.nome)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      {error && (
        <Note icon="alert-triangle" tone="warning">
          {error}
        </Note>
      )}
      <ResultActions saving={saving} onContinue={() => onContinue(override)} />
      <Presence show={pending !== null}>
        {pending && (
          <ChangeTerm
            from={byKind(suggested)}
            to={byKind(pending)}
            riskier={levelOf(pending) > levelOf(suggested)}
            onCancel={() => setPending(null)}
            onConfirm={() => {
              setProfile(pending);
              setPending(null);
              setOpen(false);
            }}
          />
        )}
      </Presence>
    </>
  );
}

/** "Refazer" e "Continuar" (que grava o perfil): barra fixa no celular, rodapé nas outras. */
function ResultActions({ saving, onContinue }: { saving: boolean; onContinue: () => void }) {
  const refazer = (
    <PendingLinkButton href="/onboarding/perfil/1" variant="secondary" size="xl">
      <span>Refazer</span>
    </PendingLinkButton>
  );
  const label = saving ? "Salvando…" : "Continuar";
  return (
    <>
      <OnboardingActions>
        {refazer}
        <div className="grow" />
        <Button variant="light" size="xl" disabled={saving} onClick={onContinue}>
          <span>{label}</span>
        </Button>
      </OnboardingActions>
      <MobileActionBar>
        {refazer}
        <Button variant="light" size="xl" disabled={saving} onClick={onContinue} className="grow">
          <span>{label}</span>
        </Button>
      </MobileActionBar>
    </>
  );
}

/** As respostas guardadas na aba (só depois de hidratar: o servidor não as vê). */
export function useStoredAnswers(scope: QuestionnaireScope): AnswerMap | null {
  const stored = useProfileAnswers((state) => state.answers[scope]);
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return hydrated ? stored : null;
}

/**
 * Estado do resultado: o questionário, as respostas da aba e a prévia da API (o perfil indicado,
 * sem gravar). Quem chama mostra carregando, erro ou a tela.
 */
export function useResultData(scope: QuestionnaireScope) {
  const { live } = useSession();
  const questionnaire = useQuestionnaire({ enabled: live });
  const answers = useStoredAnswers(scope);
  const body = questionnaire.data && answers ? toAnswerBody(questionnaire.data, answers) : null;
  const preview = useProfilePreview(questionnaire.data?.version, body);
  const failed = !live || Boolean(questionnaire.error) || Boolean(preview.error);
  return { questionnaire: questionnaire.data, answers, body, preview: preview.data, failed };
}

/** Resultado do perfil no onboarding: prévia da API e, ao continuar, o perfil gravado. */
export function ProfileResult({ onSaved }: { onSaved?: () => void } = {}) {
  const router = useRouter();
  const { questionnaire, answers, body, preview, failed } = useResultData("onboarding");
  const save = useSaveProfile();

  if (failed) return <ErrorBlock />;
  // Falta resposta (link direto, aba nova): volta para a primeira pergunta sem resposta.
  const guard = questionnaire && (
    <RequireEarlierAnswers before={questionnaire.questions.length + 1} />
  );
  if (!questionnaire || !answers || !body || !preview)
    return (
      <>
        {guard}
        <LoadingStatus />
      </>
    );

  return (
    <ProfileResultView
      questionnaire={questionnaire}
      answers={answers}
      suggested={preview.profile}
      saving={save.isPending}
      error={save.error ? saveErrorText(save.error) : null}
      onContinue={(chosen) =>
        save.mutate(
          { version: questionnaire.version, answers: body, chosen },
          { onSuccess: () => (onSaved ? onSaved() : router.push("/onboarding/avisos")) },
        )
      }
    />
  );
}
