"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailList } from "@/components/ui/detail-list";
import { FormSection, SaveActions } from "@/components/ui/form-sections";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSession } from "@/features/acesso/session";
import {
  GoalBasics,
  GoalProgressFields,
  goalErrorText,
  goalPositionOptions,
  useGoalFields,
} from "@/features/metas/components/goal-form";
import { isPlanLimit, useCreateGoal, useGoalPositions } from "@/features/metas/live";
import { formatCurrency, todayInSaoPaulo } from "@/lib/format";
import { parseMoneyInput } from "@/lib/money-input";

/** Meses inteiros de hoje até a data (mínimo 1). */
function monthsUntil(isoDay: string, today: string) {
  const [y1, m1] = today.split("-").map(Number) as [number, number];
  const [y2, m2] = isoDay.split("-").map(Number) as [number, number];
  return Math.max(1, (y2 - y1) * 12 + (m2 - m1));
}

/** Conta simples, sem rendimento: o que falta dividido pelos meses (a API refina depois). */
function Preview({
  target,
  currentCents,
  date,
}: {
  target: string;
  currentCents: number;
  date: string;
}) {
  const targetCents = parseMoneyInput(target);
  const ready = targetCents !== null && date >= todayInSaoPaulo();
  const remaining = ready ? Math.max(0, targetCents - currentCents) : null;
  const months = ready ? monthsUntil(date, todayInSaoPaulo()) : null;
  return (
    <Panel className="p-4 @tab:p-5.5 @desk:p-6">
      <PanelHeader
        title="Prévia"
        subtitle="Conta simples, sem rendimento"
        titleClassName="text-17 tracking-normal"
      />
      <DetailList
        items={[
          { label: "Falta juntar", value: remaining === null ? "—" : formatCurrency(remaining) },
          {
            label: "Prazo",
            value: months === null ? "—" : months === 1 ? "1 mês" : `${months} meses`,
          },
          {
            label: "Por mês, sem rendimento",
            value:
              remaining === null || months === null
                ? "—"
                : formatCurrency(Math.ceil(remaining / months)),
          },
        ]}
      />
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Depois de criar, a meta mostra o aporte estimado com rendimento e inflação.
      </p>
    </Panel>
  );
}

/** Nova meta (`POST /v1/goals`). */
export default function NovaMetaPage() {
  const router = useRouter();
  const { live } = useSession();
  const positions = useGoalPositions({ enabled: live });
  const create = useCreateGoal();
  const f = useGoalFields();
  const [invalid, setInvalid] = useState<string | null>(null);
  const currentCents =
    f.values.source === "manual"
      ? (parseMoneyInput(f.values.current) ?? 0)
      : (positions.data?.data ?? [])
          .filter((p) => f.values.positionIds.includes(p.id))
          .reduce((sum, p) => sum + (p.valueCents ?? 0), 0);

  function save() {
    const result = f.read();
    if ("error" in result) return setInvalid(result.error);
    setInvalid(null);
    create.mutate(result.body, { onSuccess: (goal) => router.replace(`/metas/${goal.id}`) });
  }

  const error =
    invalid ??
    (create.error
      ? isPlanLimit(create.error)
        ? "Metas fazem parte de outro plano. Veja os planos em Configurações."
        : goalErrorText(create.error)
      : null);

  return (
    <Page
      padding="form"
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Nova meta" close="/metas" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Metas", href: "/metas" }, { label: "Nova meta" }]}
      />
      <DetailHeader title="Nova meta" />
      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] @desk:items-start">
        <div className="contents @desk:flex @desk:min-w-0 @desk:flex-col @desk:gap-4">
          <FormSection title="A meta" className="@desk:gap-3.5">
            <GoalBasics fields={f} idPrefix="meta" />
          </FormSection>
          <FormSection title="Acompanhamento" className="@desk:gap-3.5">
            <GoalProgressFields
              fields={f}
              idPrefix="meta"
              positions={positions.data ? goalPositionOptions(positions.data.data) : undefined}
            />
          </FormSection>
        </div>
        <Preview target={f.values.target} currentCents={currentCents} date={f.values.date} />
      </div>
      {error && (
        <Note icon="alert-triangle" tone="warning">
          {error}
        </Note>
      )}
      <SaveActions
        label="Criar meta"
        onSave={save}
        pending={create.isPending}
        cancelHref="/metas"
      />
    </Page>
  );
}
