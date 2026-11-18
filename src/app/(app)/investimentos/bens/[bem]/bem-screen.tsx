"use client";

import { notFound, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Presence } from "@/components/ui/presence";
import { StatTile } from "@/components/ui/stat-tile";
import { useSession } from "@/features/acesso/session";
import {
  BelongingFieldsView,
  errorText,
  useBelongingFields,
} from "@/features/bens/components/belonging-form";
import {
  EMPTY_BELONGING,
  isBelongingId,
  toBelongingView,
  useBelonging,
  useNetWorth,
  useRemoveBelonging,
  useUpdateBelonging,
  type BelongingInput,
  type BelongingView,
} from "@/features/bens/live";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { ApiError } from "@/lib/api";
import { barWidth } from "@/lib/bar-width";
import { cn } from "@/lib/utils";

function Hero({ bem, wide }: { bem: BelongingView; wide?: boolean }) {
  return (
    <MataCard className={cn("gap-2", wide && "p-6")}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
        >
          <Icon name={bem.kind === "real_estate" ? "building" : "car-front"} size={20} />
        </span>
        <span className="flex flex-col leading-[1.3]">
          <span className="text-14 text-[#C5D8CB]">{bem.linha}</span>
          <strong className="text-18">{bem.nome}</strong>
        </span>
      </div>
      <span className="text-14 text-[#C5D8CB]">Valor estimado por você</span>
      <span
        className={cn(
          "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
          wide ? "text-38" : "text-36",
        )}
      >
        {bem.valor}
      </span>
      <span className="text-14 text-[#E4EEE6]">{bem.atualizacao}</span>
    </MataCard>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel className="p-4.5 @tab:p-5.5">
      <PanelHeader title={title} titleClassName="text-17 tracking-normal @tab:text-19" />
      {children}
    </Panel>
  );
}

function Financing({ bem }: { bem: BelongingView }) {
  if (!bem.financiado) {
    return (
      <Section title="Financiamento">
        <p className="m-0 text-14 text-mist">Quitado: não há saldo devedor informado.</p>
      </Section>
    );
  }
  return (
    <Section title="Financiamento">
      <div className="grid grid-cols-2 items-stretch gap-2.5">
        <StatTile label="Saldo devedor" value={bem.saldo} valueClassName="text-19 text-urucum" />
        <StatTile
          label="Valor líquido"
          value={bem.liquido}
          hint="valor menos a dívida"
          valueClassName="text-19 text-folha"
        />
      </div>
      {bem.quitado !== null && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-13 text-mist">
            <span>Já é seu</span>
            <strong className="text-sand">{bem.quitado}%</strong>
          </div>
          <div aria-hidden="true" className="relative h-2.5 rounded-[5px] bg-shade">
            <div
              className="h-2.5 origin-left animate-grow-x rounded-[5px] bg-folha"
              style={{ width: barWidth(bem.quitado) }}
            />
          </div>
        </div>
      )}
      <Note icon="info-lg" tone="info">
        O saldo devedor não atualiza sozinho. Quando chegar o extrato do financiamento, corrija o
        saldo aqui.
      </Note>
    </Section>
  );
}

function NetWorth({ bem }: { bem: BelongingView }) {
  return (
    <Section title="No seu patrimônio">
      <DetailList
        items={[
          { label: "Valor líquido deste bem", value: bem.liquido },
          { label: "Parte do patrimônio", value: bem.noPatrimonio ?? "—" },
          { label: "Alocação do perfil", value: "não entra" },
        ]}
      />
    </Section>
  );
}

function EditDialog({ bem, onClose }: { bem: BelongingView; onClose: () => void }) {
  const update = useUpdateBelonging(bem.id);
  const f = useBelongingFields(bem.form);
  const [invalid, setInvalid] = useState<string | null>(null);

  function save() {
    const result = f.read();
    if ("error" in result) return setInvalid(result.error);
    setInvalid(null);
    // Só o que mudou (um valor novo sem data vale para hoje na API; aqui a data vai junto).
    const body: Partial<BelongingInput> = {};
    const before = bem.form;
    if (result.body.name !== before.name) body.name = result.body.name;
    if (result.body.valueCents !== before.valueCents) body.valueCents = result.body.valueCents;
    if (result.body.valueDate !== before.valueDate || body.valueCents !== undefined)
      body.valueDate = result.body.valueDate;
    if (result.body.debtCents !== before.debtCents) body.debtCents = result.body.debtCents;
    if (Object.keys(body).length === 0) return onClose();
    update.mutate(body, { onSuccess: onClose });
  }

  const error = invalid ?? (update.error ? errorText(update.error) : null);
  return (
    <ConfirmDialog
      title={`Corrigir ${bem.nome}`}
      onClose={onClose}
      className="max-h-[90dvh] overflow-y-auto md:w-[32.5rem]"
    >
      <div className="flex flex-col gap-4">
        <BelongingFieldsView kind={bem.kind} fields={f} idPrefix="editar" />
      </div>
      {error && (
        <Note icon="alert-triangle" tone="warning">
          {error}
        </Note>
      )}
      <Button variant="primary" size="lg" block disabled={update.isPending} onClick={save}>
        <span>{update.isPending ? "Salvando…" : "Salvar correção"}</span>
      </Button>
    </ConfirmDialog>
  );
}

function RemoveDialog({ bem, onClose }: { bem: BelongingView; onClose: () => void }) {
  const router = useRouter();
  const remove = useRemoveBelonging(bem.id);
  return (
    <ConfirmDialog
      title={`Excluir ${bem.nome}`}
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
            onClick={() =>
              remove.mutate(undefined, { onSuccess: () => router.replace("/investimentos") })
            }
          >
            <span>{remove.isPending ? "Excluindo…" : "Excluir"}</span>
          </Button>
        </>
      }
    >
      <DialogText>O bem sai do seu patrimônio. Não dá para desfazer.</DialogText>
      {remove.error && (
        <Note icon="alert-triangle" tone="warning">
          {errorText(remove.error)}
        </Note>
      )}
    </ConfirmDialog>
  );
}

function Actions({ onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onEdit}>
        <Icon name="edit" size={18} />
        <span>Corrigir valor ou saldo</span>
      </Button>
      <Button variant="danger-outline" size="sm" onClick={onRemove}>
        <Icon name="trash" size={18} />
        <span>Excluir bem</span>
      </Button>
    </div>
  );
}

/** Imóvel ou veículo (`/investimentos/bens/<id>`), com os dados da API. */
export function BemScreen({ id }: { id: string }) {
  const { live } = useSession();
  const query = useBelonging(id, { enabled: live });
  const netWorth = useNetWorth({ enabled: live });
  const [dialog, setDialog] = useState<"editar" | "excluir" | null>(null);

  if (!isBelongingId(id)) notFound();
  if (query.error instanceof ApiError && query.error.code === "not_found") notFound();

  const loaded = query.data
    ? toBelongingView(query.data, netWorth.data?.totalNetWorthCents ?? null)
    : null;
  const header = <MobileHeader title={loaded?.nome ?? "Bem"} back="/investimentos" balanced />;

  if (!live || query.error) {
    return (
      <Page padding="detail" header={header}>
        <ErrorBlock />
      </Page>
    );
  }

  // Carregando: os cards no lugar, com o círculo girando.
  const loading = !loaded;
  const bem = loaded ?? EMPTY_BELONGING;

  const actions = (
    <Actions onEdit={() => setDialog("editar")} onRemove={() => setDialog("excluir")} />
  );
  return (
    <Page padding="detail" zoom={1.4} className="gap-4 @tab:gap-5 @desk:gap-6" header={header}>
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: loaded?.nome ?? "Bem" },
        ]}
      />
      {loading && <LoadingStatus />}
      <Skeleton active={loading}>
        <DetailHeader
          title={bem.nome}
          actions={<div className="hidden @desk:block">{actions}</div>}
        />
        <div className="flex flex-col gap-4 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @desk:items-stretch">
          <Hero bem={bem} />
          <div className="@desk:hidden">{actions}</div>
          <NetWorth bem={bem} />
        </div>
        <div className="@tab:max-w-[40rem]">
          <Financing bem={bem} />
        </div>
      </Skeleton>
      {loaded && (
        <Presence show={dialog !== null}>
          {dialog === "editar" && <EditDialog bem={loaded} onClose={() => setDialog(null)} />}
          {dialog === "excluir" && <RemoveDialog bem={loaded} onClose={() => setDialog(null)} />}
        </Presence>
      )}
    </Page>
  );
}
