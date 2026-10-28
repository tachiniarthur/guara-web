"use client";

import { useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  donutSizes,
  GroupDonut,
  GroupSwatch,
} from "@/features/alocacao/components/allocation-parts";
import {
  formatPercent,
  groups,
  portfolioAllocation,
  profileById,
  type ProfileId,
} from "@/features/alocacao/data";
import { cn } from "@/lib/utils";

import { onboardingSteps, profileAnswers, profileEffects } from "../data";
import { OnboardingActions, OnboardingSteps } from "./onboarding-shell";

const LEVELS = ["conservador", "moderado", "arrojado", "sofisticado"] as const;

/** Parte em renda variável e cripto da carteira-alvo (o risco do perfil). */
const riskShare = (id: ProfileId) => {
  const alvo = profileById[id].alvo;
  return alvo["rv-br"] + alvo["rv-int"] + alvo.cripto;
};

/** Escala dos 4 perfis, clicável: o do questionário vem marcado e tem a etiqueta "indicado". */
function ProfilePicker({
  current,
  viewing,
  suggested,
  onPick,
}: {
  current: ProfileId;
  /** O perfil aberto na comparação (contorno). */
  viewing: ProfileId | null;
  suggested: ProfileId;
  onPick: (id: ProfileId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Perfil de investidor" className="flex gap-1.5">
      {LEVELS.map((level) => {
        const on = level === current;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(level)}
            className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 border-none bg-transparent p-0 text-sand"
          >
            <span
              className={cn(
                "h-2 w-full rounded-[4px] transition-colors",
                on
                  ? "bg-tucano"
                  : level === viewing
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
              {profileById[level].nome}
              {level === suggested && (
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
 * Comparação do perfil indicado com o que a pessoa abriu: para quem é cada um, quanto vai para
 * renda variável e cripto e a diferença grupo a grupo. Daqui ela escolhe trocar (com o termo) ou
 * mantém o indicado.
 */
function ProfileComparison({
  base,
  other,
  onChoose,
  onClose,
}: {
  base: ProfileId;
  other: ProfileId;
  onChoose: () => void;
  onClose: () => void;
}) {
  const a = profileById[base];
  const b = profileById[other];
  return (
    <Panel
      aria-label={`Comparação: ${a.nome} e ${b.nome}`}
      className="animate-fade-up gap-4 border-sand/40 p-4.5 md:p-5.5 lg:col-span-3 lg:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelHeader
          title={`${a.nome} × ${b.nome}`}
          subtitle="O que muda nas sugestões se você escolher outro perfil"
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
          { profile: a, tag: "indicado pelo questionário" },
          { profile: b, tag: "o que você abriu" },
        ].map(({ profile, tag }) => (
          <div key={profile.id} className="flex flex-col gap-1 rounded-tile bg-field px-4 py-3.5">
            <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">{tag}</span>
            <strong className="font-display text-20">{profile.nome}</strong>
            <span className="text-13 text-mist">{profile.paraQuem}</span>
            <span className="text-13 text-sand">
              <strong>{riskShare(profile.id)}%</strong> em renda variável e cripto
            </span>
          </div>
        ))}
      </div>
      <div role="table" aria-label="Carteira-alvo grupo a grupo" className="flex flex-col">
        <div
          role="row"
          className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-2 border-b border-line pb-2 text-12 font-bold text-caption"
        >
          <span role="columnheader">Grupo</span>
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
        {groups.map((g) => {
          const diff = b.alvo[g.id] - a.alvo[g.id];
          return (
            <div
              key={g.id}
              role="row"
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] items-center gap-2 border-b border-line py-2 text-13 last:border-b-0"
            >
              <span role="cell" className="flex min-w-0 items-center gap-2">
                <GroupSwatch id={g.id} />
                <span className="truncate">{g.nome}</span>
              </span>
              <span role="cell" className="text-right tabular-nums">
                {formatPercent(a.alvo[g.id])}
              </span>
              <span role="cell" className="text-right font-bold tabular-nums">
                {formatPercent(b.alvo[g.id])}
              </span>
              <span
                role="cell"
                className={cn(
                  "text-right font-bold tabular-nums",
                  diff > 0 ? "text-tucano" : diff < 0 ? "text-arara" : "text-caption",
                )}
              >
                {diff === 0
                  ? "igual"
                  : `${diff > 0 ? "+" : "\u2212"}${formatPercent(Math.abs(diff))}`}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="light" onClick={onChoose}>
          <span>Escolher o perfil {b.nome}</span>
        </Button>
        <Button variant="ghost" onClick={onClose}>
          <span>Manter {a.nome}</span>
        </Button>
      </div>
    </Panel>
  );
}

/**
 * Termo para trocar o perfil do questionário por outro escolhido pela pessoa. Fica no centro da
 * coluna das etapas (no desktop, à direita da faixa lateral), não da janela inteira.
 */
function ChangeTerm({
  from,
  to,
  onCancel,
  onConfirm,
}: {
  from: ProfileId;
  to: ProfileId;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const fromName = profileById[from].nome;
  const toName = profileById[to].nome;
  const riskier = LEVELS.indexOf(to) > LEVELS.indexOf(from);

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
        className="absolute inset-0 animate-fade-in border-none bg-[rgba(5,9,7,0.72)]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 lg:left-[35rem]">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={`Trocar para o perfil ${toName}?`}
          className="pointer-events-auto flex max-h-full w-full max-w-[35rem] animate-dialog-in flex-col gap-4 overflow-y-auto rounded-card border border-line-strong bg-card p-6"
        >
          <h2 className="m-0 font-display text-22 leading-tight font-extrabold">
            Trocar para o perfil {toName}?
          </h2>
          <div className="flex flex-col gap-3.5 text-14 leading-[1.55] text-mist">
            <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">
              Termo de alteração do perfil de investidor
            </span>
            <p className="m-0">
              O questionário indicou o perfil <strong className="text-sand">{fromName}</strong>. Ao
              confirmar, você declara que escolheu o perfil{" "}
              <strong className="text-sand">{toName}</strong> por conta própria.
            </p>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              <li>
                As sugestões do Pacu passam a seguir a carteira-alvo {toName}:{" "}
                <strong className="text-sand">{riskShare(to)}%</strong> em renda variável e cripto
                (no {fromName}, {riskShare(from)}%).
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
              <span>Li e concordo com a troca para o perfil {toName}.</span>
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

/** Carteira-alvo do perfil: rosca e percentual de cada grupo, sem comparar com a carteira. */
function TargetAllocation({ profile }: { profile: ProfileId }) {
  const target = profileById[profile];
  return (
    <Panel className="animate-fade-up gap-4 p-4.5 [animation-delay:160ms] md:p-5.5 lg:p-5">
      <PanelHeader
        title={`Carteira-alvo ${target.nome}`}
        subtitle="Como o Guará vai dividir as sugestões"
        titleClassName="text-18 tracking-normal"
      />
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8 lg:flex-col lg:gap-3">
        {/* A rosca é refeita (e anima de novo) quando o perfil muda. */}
        <GroupDonut
          key={profile}
          values={target.alvo}
          dims={donutSizes.card}
          caption="Alvo"
          value={target.nome}
          label={`Carteira-alvo do perfil ${target.nome}: ${groups
            .map((g) => `${g.nome} ${formatPercent(target.alvo[g.id])}`)
            .join(", ")}`}
        />
        <ul className="m-0 w-full min-w-0 grow list-none p-0">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-2.5 border-b border-line py-1.5 text-13 last:border-b-0"
            >
              <GroupSwatch id={g.id} />
              <span className="min-w-0 grow">{g.nome}</span>
              <strong className="tabular-nums">{formatPercent(target.alvo[g.id])}</strong>
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

/**
 * Resultado do questionário: o perfil indicado, a escala para escolher outro (com termo de
 * troca), a carteira-alvo, as respostas e o que muda no app.
 */
export function ProfileResult() {
  const suggested = portfolioAllocation.perfil;
  const [profile, setProfile] = useState<ProfileId>(suggested);
  /** Perfil aberto na comparação (ainda não escolhido). */
  const [viewing, setViewing] = useState<ProfileId | null>(null);
  /** Perfil a confirmar no termo. */
  const [pending, setPending] = useState<ProfileId | null>(null);
  const chosen = profile !== suggested;
  const name = profileById[profile].nome;

  // Tocar num perfil abre a comparação com o indicado; tocar no que já vale fecha.
  const pick = (id: ProfileId) => {
    if (id === profile) return setViewing(null);
    if (id === suggested) {
      // Voltar ao perfil do questionário não precisa de termo.
      setProfile(id);
      return setViewing(null);
    }
    setViewing(id);
  };

  return (
    <>
      <OnboardingSteps current={3} steps={onboardingSteps} />
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-5">
        <div className="flex animate-fade-up flex-col gap-2 lg:col-span-3">
          <span className="text-13 text-caption">Resultado · 6 de 6 respondidas</span>
          <h1 className="m-0 font-display text-26 leading-[1.2] font-extrabold tracking-[-0.01em] md:text-30">
            Seu perfil é <span className="text-tucano">{name}</span>
          </h1>
          {chosen ? (
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-15 leading-[1.55] text-mist">
              <span>
                Escolhido por você: {profileById[profile].paraQuem.toLowerCase()}. O questionário
                indicou {profileById[suggested].nome}.
              </span>
              <button
                type="button"
                onClick={() => setProfile(suggested)}
                className="cursor-pointer border-none bg-transparent p-0 text-14 font-bold text-sand underline underline-offset-4 hover:text-tucano"
              >
                Voltar ao {profileById[suggested].nome}
              </button>
            </p>
          ) : (
            <p className="m-0 text-15 leading-[1.55] text-mist">
              Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte
              do dinheiro protegida. Seu prazo de 3 a 10 anos e a parte pequena que talvez precise
              resgatar combinam com uma carteira equilibrada. Quer ver outro? Toque num perfil
              abaixo para comparar.
            </p>
          )}
        </div>
        <div className="animate-fade-up [animation-delay:80ms] lg:col-span-3">
          <ProfilePicker current={profile} viewing={viewing} suggested={suggested} onPick={pick} />
        </div>
        {viewing && (
          <ProfileComparison
            base={suggested}
            other={viewing}
            onChoose={() => setPending(viewing)}
            onClose={() => setViewing(null)}
          />
        )}
        <TargetAllocation profile={profile} />
        <Panel className="animate-fade-up gap-3.5 p-4.5 [animation-delay:240ms] md:p-5.5 lg:p-5">
          <PanelHeader title="Suas respostas" titleClassName="text-18 tracking-normal" />
          <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13">
            {profileAnswers.map((answer) => (
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
                    {effect.texto.replace("Moderado", name)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <OnboardingActions>
        <ButtonLink href="/onboarding/perfil/1" variant="secondary" size="xl">
          <span>Refazer</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href="/onboarding/assistentes" variant="light" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </OnboardingActions>
      {pending && (
        <ChangeTerm
          from={suggested}
          to={pending}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setProfile(pending);
            setPending(null);
            setViewing(null);
          }}
        />
      )}
    </>
  );
}
