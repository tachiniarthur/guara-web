"use client";

import { useState } from "react";

import { AmountInput, CheckboxRow, TextInput } from "@/components/ui/form";
import { LabeledField } from "@/components/ui/form-sections";
import { PillToggle } from "@/components/ui/pill-toggle";
import { ApiError } from "@/lib/api";
import { formatCurrency, todayInSaoPaulo } from "@/lib/format";
import { centsToDecimal, parseMoneyInput } from "@/lib/money-input";

import type { GoalInput } from "../live";

const grid = "contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:gap-4";

const moneyText = (cents: number | null | undefined) =>
  cents ? centsToDecimal(cents).replace(".", ",") : "";

export type GoalPositionOption = { id: string; nome: string; valor: string };

/** Estado e validação dos campos de uma meta (nova meta e correção usam os mesmos). */
export function useGoalFields(initial?: Partial<GoalInput>) {
  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(moneyText(initial?.targetCents));
  const [date, setDate] = useState(initial?.targetDate ?? "");
  const [source, setSource] = useState<"manual" | "positions">(initial?.progressSource ?? "manual");
  const [current, setCurrent] = useState(moneyText(initial?.currentAmountCents));
  const [positionIds, setPositionIds] = useState<string[]>(initial?.positionIds ?? []);

  const toggle = (id: string) =>
    setPositionIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  function read(): { body: GoalInput } | { error: string } {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Dê um nome para a meta." };
    const targetCents = parseMoneyInput(target);
    if (targetCents === null) return { error: "Informe quanto você quer juntar." };
    if (!date) return { error: "Escolha a data da meta." };
    if (date < todayInSaoPaulo()) return { error: "A data da meta não pode estar no passado." };
    if (source === "positions") {
      if (positionIds.length === 0) return { error: "Escolha ao menos uma posição." };
      return {
        body: { name: trimmed, targetCents, targetDate: date, progressSource: source, positionIds },
      };
    }
    // Vazio vale "ainda não guardei nada" (0), não um valor inventado.
    const currentCents = current.trim() === "" ? 0 : parseMoneyInput(current);
    if (currentCents === null && current.trim() !== "0")
      return { error: "Confira o valor já guardado." };
    return {
      body: {
        name: trimmed,
        targetCents,
        targetDate: date,
        progressSource: source,
        currentAmountCents: currentCents ?? 0,
      },
    };
  }

  return {
    values: { name, target, date, source, current, positionIds },
    set: { setName, setTarget, setDate, setSource, setCurrent, toggle },
    read,
  };
}

export type GoalFields = ReturnType<typeof useGoalFields>;

/** Nome, valor e data da meta. */
export function GoalBasics({ fields: f, idPrefix }: { fields: GoalFields; idPrefix: string }) {
  return (
    <div className={grid}>
      <LabeledField id={`${idPrefix}-nome`} label="Nome da meta">
        <TextInput
          id={`${idPrefix}-nome`}
          maxLength={80}
          placeholder="Ex.: Reserva de emergência"
          value={f.values.name}
          onChange={(e) => f.set.setName(e.target.value)}
        />
      </LabeledField>
      <LabeledField
        id={`${idPrefix}-valor`}
        label="Quanto quer juntar"
        hint="O valor que você quer ter na data da meta."
      >
        <AmountInput
          id={`${idPrefix}-valor`}
          placeholder="0,00"
          value={f.values.target}
          onChange={(e) => f.set.setTarget(e.target.value)}
          className="h-16 rounded-tile text-28"
        />
      </LabeledField>
      <LabeledField id={`${idPrefix}-data`} label="Até quando">
        <TextInput
          id={`${idPrefix}-data`}
          type="date"
          min={todayInSaoPaulo()}
          value={f.values.date}
          onChange={(e) => f.set.setDate(e.target.value)}
        />
      </LabeledField>
    </div>
  );
}

/** De onde vem o progresso: valor informado ou a soma de posições da carteira. */
export function GoalProgressFields({
  fields: f,
  positions,
  idPrefix,
}: {
  fields: GoalFields;
  positions: GoalPositionOption[] | undefined;
  idPrefix: string;
}) {
  return (
    <>
      <LabeledField label="Como acompanhar">
        <PillToggle
          label="Como acompanhar"
          value={f.values.source}
          onChange={f.set.setSource}
          options={[
            { value: "manual", label: "Valor que eu informo" },
            { value: "positions", label: "Posições da carteira" },
          ]}
          className="flex self-stretch"
          itemClassName="flex-1"
        />
      </LabeledField>
      {f.values.source === "manual" ? (
        <LabeledField
          id={`${idPrefix}-guardado`}
          label="Já guardado"
          optional="opcional"
          hint="Quanto você já tem para esta meta. Atualize quando quiser."
        >
          <TextInput
            id={`${idPrefix}-guardado`}
            inputMode="decimal"
            placeholder="0,00"
            value={f.values.current}
            onChange={(e) => f.set.setCurrent(e.target.value)}
          />
        </LabeledField>
      ) : (
        <LabeledField
          label="Posições da meta"
          hint="O guardado é a soma do valor delas. Cada posição entra em uma meta só."
        >
          {positions === undefined ? (
            <span className="text-14 text-mist">Carregando as posições…</span>
          ) : positions.length === 0 ? (
            <span className="text-14 text-mist">
              Você ainda não tem posições na carteira. Use &quot;Valor que eu informo&quot;.
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              {positions.map((p) => (
                <CheckboxRow
                  key={p.id}
                  id={`${idPrefix}-pos-${p.id}`}
                  label={p.nome}
                  description={p.valor}
                  checked={f.values.positionIds.includes(p.id)}
                  onCheckedChange={() => f.set.toggle(p.id)}
                  className="rounded-tile border border-line px-3.5"
                />
              ))}
            </div>
          )}
        </LabeledField>
      )}
    </>
  );
}

export const goalPositionOptions = (
  data: { id: string; name: string; symbol: string | null; valueCents?: number | null }[],
): GoalPositionOption[] =>
  data.map((p) => ({
    id: p.id,
    nome: p.symbol ? `${p.symbol} · ${p.name}` : p.name,
    valor: formatCurrency(p.valueCents ?? null),
  }));

export function goalErrorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Não deu para salvar. Tente de novo.";
}
