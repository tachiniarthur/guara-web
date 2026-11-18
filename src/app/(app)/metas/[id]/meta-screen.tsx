"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { Icon, type IconName } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { Presence } from "@/components/ui/presence";
import { Tag } from "@/components/ui/tag";
import { useSession } from "@/features/acesso/session";
import { ChatAboutGoals, GuaraGoalTip } from "@/features/metas/components/goal-parts";
import {
  GoalBasics,
  GoalProgressFields,
  goalErrorText,
  goalPositionOptions,
  useGoalFields,
} from "@/features/metas/components/goal-form";
import {
  isGoalId,
  isPlanLimit,
  toGoalDetail,
  useGoal,
  useGoalPositions,
  useRemoveGoal,
  useUpdateGoal,
  type GoalDetail,
  type GoalInput,
} from "@/features/metas/live";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { ApiError } from "@/lib/api";
import { barWidth } from "@/lib/bar-width";
import { cn } from "@/lib/utils";

function Hero({ goal }: { goal: GoalDetail }) {
  return (
    <MataCard className="gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="grow text-14 text-[#C5D8CB]">Guardado</span>
        <Tag tone={goal.status.tom} status>
          {goal.status.texto}
        </Tag>
      </div>
      <span className="font-display text-36 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        {goal.guardado}
        <span className="text-16 font-medium text-mist">{` de ${goal.alvo}`}</span>
      </span>
      <div aria-hidden="true" className="relative h-3 rounded-md bg-[rgba(11,17,14,.55)]">
        <div
          className="h-3 origin-left animate-grow-x rounded-md bg-folha"
          style={{ width: barWidth(goal.percentual) }}
        />
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className={cn(
              "absolute -top-[3px] h-4.5 w-0.5 rounded-[1px]",
              m <= goal.percentual ? "bg-sand" : "bg-sand/50",
            )}
            style={{ left: `calc(${m}% - 1px)` }}
          />
        ))}
      </div>
      <span className="text-14 text-[#E4EEE6]">
        {`${goal.percentual}% · faltam `}
        <strong className="text-white">{goal.faltam}</strong>
        {` · até ${goal.prazo} (${goal.meses})`}
      </span>
    </MataCard>
  );
}

function Section({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn("p-4.5 @tab:p-5.5", className)}>
      <PanelHeader
        title={title}
        subtitle={subtitle}
        action={action}
        titleClassName="text-17 tracking-normal @tab:text-19"
      />
      {children}
    </Panel>
  );
}

/** Marcos de 25%, 50%, 75% e 100% pelo progresso de hoje (nada de avisos inventados). */
function Milestones({ goal }: { goal: GoalDetail }) {
  const marks = [25, 50, 75, 100];
  return (
    <Section title="Marcos" subtitle="Pelo guardado de hoje">
      <RowList>
        {marks.map((m, i) => {
          const done = goal.percentual >= m;
          const icon: IconName = done ? "check" : m === 100 ? "target" : "flag";
          return (
            <ListRow
              key={m}
              title={m === 100 ? "Meta completa" : `${m}% da meta`}
              meta={done ? "alcançado" : "ainda não"}
              leading={
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    done ? "bg-folha-bg text-folha" : "bg-shade text-caption",
                  )}
                >
                  <Icon name={icon} size={16} />
                </span>
              }
              divider={i < marks.length - 1}
            />
          );
        })}
      </RowList>
    </Section>
  );
}

function Monthly({ goal }: { goal: GoalDetail }) {
  return (
    <Section title="Quanto guardar" subtitle="Estimativa da API pelas premissas padrão">
      <DetailList
        items={[
          { label: "Por mês, em valores de hoje", value: goal.mensal },
          ...(goal.alvoHoje ? [{ label: "Alvo em valores de hoje", value: goal.alvoHoje }] : []),
          ...goal.premissas,
        ]}
      />
      {goal.motivoPremissa && (
        <p className="m-0 text-13 leading-[1.55] text-caption">{goal.motivoPremissa}</p>
      )}
      {goal.aviso && <p className="m-0 text-12 leading-[1.5] text-caption">{goal.aviso}</p>}
    </Section>
  );
}

function Source({ goal }: { goal: GoalDetail }) {
  if (goal.fonte === "manual") {
    return (
      <Section title="Acompanhamento" subtitle="Valor informado por você">
        <p className="m-0 text-14 leading-[1.55] text-mist">
          O guardado é o valor que você informa. Corrija sempre que guardar mais.
        </p>
      </Section>
    );
  }
  return (
    <Section title="Posições da meta" subtitle="O guardado é a soma do valor delas">
      <RowList>
        {goal.posicoes.map((p, i) => (
          <ListRow
            key={p.id}
            title={p.nome}
            href={`/investimentos/${p.id}`}
            value={p.valor}
            divider={i < goal.posicoes.length - 1}
          />
        ))}
      </RowList>
      {goal.semValor > 0 && (
        <Note icon="alert-triangle" tone="warning">
          {goal.semValor === 1
            ? "1 posição está sem valor e não entra no guardado."
            : `${goal.semValor} posições estão sem valor e não entram no guardado.`}
        </Note>
      )}
    </Section>
  );
}

function EditDialog({
  goal,
  positions,
  onClose,
}: {
  goal: GoalDetail;
  positions: ReturnType<typeof goalPositionOptions> | undefined;
  onClose: () => void;
}) {
  const update = useUpdateGoal(goal.id);
  const f = useGoalFields(goal.form);
  const [invalid, setInvalid] = useState<string | null>(null);

  function save() {
    const result = f.read();
    if ("error" in result) return setInvalid(result.error);
    setInvalid(null);
    const before = goal.form;
    const next = result.body;
    const body: Partial<GoalInput> = {};
    if (next.name !== before.name) body.name = next.name;
    if (next.targetCents !== before.targetCents) body.targetCents = next.targetCents;
    if (next.targetDate !== before.targetDate) body.targetDate = next.targetDate;
    if (next.progressSource !== before.progressSource) body.progressSource = next.progressSource;
    if (next.progressSource === "manual" && next.currentAmountCents !== before.currentAmountCents)
      body.currentAmountCents = next.currentAmountCents;
    if (
      next.progressSource === "positions" &&
      JSON.stringify([...(next.positionIds ?? [])].sort()) !==
        JSON.stringify([...before.positionIds].sort())
    )
      body.positionIds = next.positionIds;
    if (Object.keys(body).length === 0) return onClose();
    update.mutate(body, { onSuccess: onClose });
  }

  const error = invalid ?? (update.error ? goalErrorText(update.error) : null);
  return (
    <ConfirmDialog
      title={`Corrigir ${goal.nome}`}
      onClose={onClose}
      className="max-h-[90dvh] overflow-y-auto md:w-[34rem]"
    >
      <div className="flex flex-col gap-4">
        <GoalBasics fields={f} idPrefix="editar-meta" />
        <GoalProgressFields fields={f} positions={positions} idPrefix="editar-meta" />
      </div>
      {error && (
        <Note icon="alert-triangle" tone="warning">
          {error}
        </Note>
      )}
      <Button variant="primary" size="lg" block disabled={update.isPending} onClick={save}>
        <span>{update.isPending ? "Salvando…" : "Salvar"}</span>
      </Button>
    </ConfirmDialog>
  );
}

function RemoveDialog({ goal, onClose }: { goal: GoalDetail; onClose: () => void }) {
  const router = useRouter();
  const remove = useRemoveGoal(goal.id);
  return (
    <ConfirmDialog
      title={`Excluir ${goal.nome}`}
      onClose={onClose}
      centered
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            onClick={() => remove.mutate(undefined, { onSuccess: () => router.replace("/metas") })}
          >
            <span>{remove.isPending ? "Excluindo…" : "Excluir"}</span>
          </Button>
        </>
      }
    >
      <DialogText>
        A meta sai da lista. As posições vinculadas continuam na carteira. Não dá para desfazer.
      </DialogText>
      {remove.error && (
        <Note icon="alert-triangle" tone="warning">
          {goalErrorText(remove.error)}
        </Note>
      )}
    </ConfirmDialog>
  );
}

/** Uma meta (`/metas/<id>`), toda com dados da API. */
export function MetaScreen({ id }: { id: string }) {
  const { live } = useSession();
  const query = useGoal(id, { enabled: live });
  const positions = useGoalPositions({ enabled: live });
  const [dialog, setDialog] = useState<"editar" | "excluir" | null>(null);

  if (!isGoalId(id)) notFound();
  if (query.error instanceof ApiError && query.error.code === "not_found") notFound();

  const goal = query.data ? toGoalDetail(query.data, positions.data ?? { data: [] }) : null;
  const header = <MobileHeader title={goal?.nome ?? "Meta"} back="/metas" balanced />;

  if (!live || query.error || !goal) {
    return (
      <Page padding="detail" header={header}>
        {isPlanLimit(query.error) ? (
          <StateBlock
            icon="lock"
            title="Metas fazem parte de outro plano"
            action={
              <ButtonLink href="/configuracoes/planos" size="md">
                <span>Ver planos</span>
              </ButtonLink>
            }
          >
            Com metas, o Guará mostra quanto você já tem, quanto falta e quanto guardar por mês.
          </StateBlock>
        ) : !live || query.error ? (
          <ErrorBlock />
        ) : (
          <LoadingStatus />
        )}
      </Page>
    );
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => setDialog("editar")}>
        <Icon name="edit" size={18} />
        <span>Corrigir</span>
      </Button>
      <Button variant="danger-outline" size="sm" onClick={() => setDialog("excluir")}>
        <Icon name="trash" size={18} />
        <span>Excluir</span>
      </Button>
    </div>
  );

  return (
    <Page padding="detail" zoom={1.4} className="gap-4 @tab:gap-5 @desk:gap-6" header={header}>
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Metas", href: "/metas" }, { label: goal.nome }]}
      />
      <DetailHeader
        title={goal.nome}
        subtitle={goal.criada ?? undefined}
        actions={<div className="hidden @tab:block">{actions}</div>}
      />
      <div className="@tab:hidden">{actions}</div>
      <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-start @desk:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @desk:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <Hero goal={goal} />
          <Monthly goal={goal} />
          <GuaraGoalTip
            action={<ChatAboutGoals question={`Como está a minha meta ${goal.nome}?`} />}
          >
            {`Quer ajuda para chegar em ${goal.alvo} até ${goal.prazo}? Pergunte ao Guará: ele lê esta meta e a sua carteira.`}
          </GuaraGoalTip>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Source goal={goal} />
          <Milestones goal={goal} />
          <Link href="/simulador/objetivo" className={panelLinkClass}>
            Simular outro ritmo
            <Icon name="chevron-right" size={16} />
          </Link>
        </div>
      </div>
      <Presence show={dialog !== null}>
        {dialog === "editar" && (
          <EditDialog
            goal={goal}
            positions={positions.data ? goalPositionOptions(positions.data.data) : undefined}
            onClose={() => setDialog(null)}
          />
        )}
        {dialog === "excluir" && <RemoveDialog goal={goal} onClose={() => setDialog(null)} />}
      </Presence>
    </Page>
  );
}
