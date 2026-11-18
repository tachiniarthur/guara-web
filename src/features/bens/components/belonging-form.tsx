"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AmountInput, TextInput } from "@/components/ui/form";
import { FormSection, LabeledField, SaveActions } from "@/components/ui/form-sections";
import { Note } from "@/components/ui/note";
import { PillToggle } from "@/components/ui/pill-toggle";
import { useSession } from "@/features/acesso/session";
import { ApiError } from "@/lib/api";
import { formatCurrency, todayInSaoPaulo } from "@/lib/format";
import { centsToDecimal, parseMoneyInput } from "@/lib/money-input";

import {
  KIND_LABEL,
  useCreateBelonging,
  useNetWorth,
  type BelongingInput,
  type BelongingKind,
} from "../live";
import { NetWorthPreview } from "./asset-form-parts";

const fields =
  "contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:flex @desk:flex-col @desk:items-stretch @desk:gap-4";

const moneyText = (cents: number | null | undefined) =>
  cents ? centsToDecimal(cents).replace(".", ",") : "";

/** Estado e validação dos campos de um bem (cadastro e correção usam os mesmos). */
export function useBelongingFields(initial?: Partial<BelongingInput>) {
  const [name, setName] = useState(initial?.name ?? "");
  const [value, setValue] = useState(moneyText(initial?.valueCents));
  const [date, setDate] = useState(initial?.valueDate ?? todayInSaoPaulo());
  const [financed, setFinanced] = useState<"quitado" | "financiado">(
    (initial?.debtCents ?? 0) > 0 ? "financiado" : "quitado",
  );
  const [debt, setDebt] = useState(moneyText(initial?.debtCents));
  const valueCents = parseMoneyInput(value);
  const debtCents = financed === "financiado" ? parseMoneyInput(debt) : null;

  function read(): { body: BelongingInput } | { error: string } {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Informe um nome." };
    if (valueCents === null) return { error: "Informe o valor estimado." };
    if (!date || date > todayInSaoPaulo()) return { error: "A data não pode ser futura." };
    if (financed === "financiado" && debtCents === null)
      return { error: "Informe o saldo devedor ou marque como quitado." };
    return { body: { name: trimmed, valueCents, valueDate: date, debtCents } };
  }

  return {
    values: { name, value, date, financed, debt },
    set: { setName, setValue, setDate, setFinanced, setDebt },
    valueCents,
    debtCents,
    read,
  };
}

export type BelongingFields = ReturnType<typeof useBelongingFields>;

/** Os campos (nome, valor, data e financiamento), em seções do formulário. */
export function BelongingFieldsView({
  kind,
  fields: f,
  idPrefix,
}: {
  kind: BelongingKind;
  fields: BelongingFields;
  idPrefix: string;
}) {
  const noun = kind === "real_estate" ? "o imóvel" : "o veículo";
  return (
    <>
      <FormSection title={kind === "real_estate" ? "O imóvel" : "O veículo"}>
        <LabeledField
          id={`${idPrefix}-nome`}
          label="Nome"
          hint="Como ele vai aparecer na sua lista de bens"
        >
          <TextInput
            id={`${idPrefix}-nome`}
            maxLength={120}
            placeholder={kind === "real_estate" ? "Ex.: Apartamento" : "Ex.: Carro"}
            value={f.values.name}
            onChange={(e) => f.set.setName(e.target.value)}
          />
        </LabeledField>
      </FormSection>
      <FormSection title="Valor">
        <div className={fields}>
          <LabeledField
            id={`${idPrefix}-valor`}
            label="Valor estimado"
            hint={`Quanto você acha que ${noun} vale hoje. Pode ser uma estimativa.`}
          >
            <AmountInput
              id={`${idPrefix}-valor`}
              placeholder="0,00"
              value={f.values.value}
              onChange={(e) => f.set.setValue(e.target.value)}
              className="h-16 rounded-tile text-28"
            />
          </LabeledField>
          <LabeledField id={`${idPrefix}-data`} label="Data da estimativa">
            <TextInput
              id={`${idPrefix}-data`}
              type="date"
              max={todayInSaoPaulo()}
              value={f.values.date}
              onChange={(e) => f.set.setDate(e.target.value)}
            />
          </LabeledField>
        </div>
      </FormSection>
      <FormSection title="Financiamento">
        <LabeledField label="Situação">
          <PillToggle
            label="Situação"
            value={f.values.financed}
            onChange={f.set.setFinanced}
            options={[
              { value: "quitado", label: "Quitado" },
              { value: "financiado", label: "Financiado" },
            ]}
            className="flex self-stretch"
            itemClassName="flex-1"
          />
        </LabeledField>
        {f.values.financed === "financiado" && (
          <LabeledField
            id={`${idPrefix}-saldo`}
            label="Saldo devedor"
            hint="O que falta pagar, como está no extrato do financiamento"
          >
            <AmountInput
              id={`${idPrefix}-saldo`}
              placeholder="0,00"
              value={f.values.debt}
              onChange={(e) => f.set.setDebt(e.target.value)}
            />
          </LabeledField>
        )}
      </FormSection>
    </>
  );
}

/** Cadastro de imóvel ou veículo: tudo informado pela pessoa (sem consulta a tabelas de preço). */
export function NewBelongingScreen({ kind }: { kind: BelongingKind }) {
  const router = useRouter();
  const { live } = useSession();
  const netWorth = useNetWorth({ enabled: live });
  const create = useCreateBelonging(kind);
  const f = useBelongingFields();
  const [invalid, setInvalid] = useState<string | null>(null);
  const label = KIND_LABEL[kind];
  const title = `Cadastrar ${label.toLowerCase()}`;
  const total = netWorth.data?.totalNetWorthCents ?? null;
  const net = (f.valueCents ?? 0) - (f.debtCents ?? 0);

  function save() {
    const result = f.read();
    if ("error" in result) return setInvalid(result.error);
    setInvalid(null);
    create.mutate(result.body, {
      onSuccess: (b) => router.replace(`/investimentos/bens/${b.id}`),
    });
  }

  const note = (
    <Note icon="info-lg" tone="info">
      O Guará não busca o valor de {kind === "real_estate" ? "imóveis" : "veículos"}{" "}
      automaticamente. O valor é sempre o que você informar; atualize quando quiser.
    </Note>
  );
  const error = invalid ?? (create.error ? errorText(create.error) : null);

  return (
    <Page
      padding="form"
      zoom={1.2}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title={title} back="/investimentos/novo" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Adicionar investimento", href: "/investimentos/novo" },
          { label },
        ]}
      />
      <DetailHeader title={title} />
      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-3 @desk:items-stretch">
        <BelongingFieldsView kind={kind} fields={f} idPrefix={kind} />
      </div>
      <NetWorthPreview
        hoje={total === null ? "—" : formatCurrency(total)}
        depois={total === null ? "—" : formatCurrency(total + net)}
        items={[
          {
            label: "Este bem soma",
            value: f.valueCents ? `+${formatCurrency(f.valueCents)}` : "—",
          },
          {
            label: "Valor líquido, sem a dívida",
            value: f.valueCents ? formatCurrency(net) : "—",
          },
          { label: "Alocação do perfil", value: "não muda · só investimentos" },
        ]}
      >
        <div className="hidden @tab:contents">{note}</div>
      </NetWorthPreview>
      <div className="contents @tab:hidden">{note}</div>
      {error && (
        <Note icon="alert-triangle" tone="warning">
          {error}
        </Note>
      )}
      <SaveActions
        label={`Salvar ${label.toLowerCase()}`}
        onSave={save}
        pending={create.isPending}
        cancelHref="/investimentos"
        backHref="/investimentos/novo"
      />
    </Page>
  );
}

export function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Não deu para salvar. Tente de novo.";
}
