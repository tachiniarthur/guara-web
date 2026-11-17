"use client";

import { useId, useState, type ReactNode } from "react";

import {
  AmountInput,
  CheckboxRow,
  Field,
  FieldHint,
  FieldLabel,
  TextInput,
  inputClass,
} from "@/components/ui/form";
import { Note } from "@/components/ui/note";
import { formatDate } from "@/lib/format";
import { shiftMonth } from "@/lib/live-format";
import { centsToDecimal, parseMoneyInput } from "@/lib/money-input";
import { cn } from "@/lib/utils";

import type { PlannedExpenseInput } from "../api";

export interface PlannedExpenseDraft {
  name: string;
  amountCents: number | null;
  startMonth: string;
  endMonth: string | null;
}

/** "1520.00" → "1.520,00" (o valor salvo de volta no campo, ao editar). */
const centsToField = (cents: number) =>
  Number(centsToDecimal(cents)).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/** Mês atual em São Paulo. */
export const currentMonthKey = () => formatDate(new Date(), "yyyy-MM");

/**
 * Nome, valor por mês, mês de início e (opcional) o último mês de um gasto futuro. Valida antes
 * de enviar: o fim precisa ser depois do início e depois do mês atual (um gasto que já acabou
 * nunca entraria na previsão). Os botões ficam com quem usa (`actions`).
 */
export function PlannedExpenseForm({
  initial,
  problem,
  onSubmit,
  actions,
  formId,
}: {
  initial?: Partial<PlannedExpenseDraft>;
  /** Erro vindo da API. */
  problem?: string | null;
  onSubmit: (input: PlannedExpenseInput) => void;
  /** Botões do formulário (dentro do `<form>`; o principal é `type="submit"`). */
  actions?: ReactNode;
  formId?: string;
}) {
  const id = useId();
  const current = currentMonthKey();
  const [name, setName] = useState(initial?.name ?? "");
  const [amountText, setAmountText] = useState(
    initial?.amountCents ? centsToField(initial.amountCents) : "",
  );
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? shiftMonth(current, 1));
  // Novo: sem data para acabar; ao editar, como está salvo.
  const [hasEnd, setHasEnd] = useState(Boolean(initial?.endMonth));
  const [endMonth, setEndMonth] = useState(initial?.endMonth ?? "");
  const [localProblem, setLocalProblem] = useState<string | null>(null);

  const submit = () => {
    setLocalProblem(null);
    const amountCents = parseMoneyInput(amountText);
    if (!name.trim()) return setLocalProblem("Dê um nome ao gasto.");
    if (!amountCents) return setLocalProblem("Informe o valor por mês.");
    if (!/^\d{4}-\d{2}$/.test(startMonth)) return setLocalProblem("Escolha o mês de início.");
    if (hasEnd) {
      if (!/^\d{4}-\d{2}$/.test(endMonth)) return setLocalProblem("Escolha o último mês.");
      if (endMonth < startMonth) return setLocalProblem("O fim não pode ser antes do início.");
      if (endMonth <= current) {
        return setLocalProblem("O último mês precisa ser depois do mês atual.");
      }
    }
    onSubmit({
      name: name.trim(),
      amountCents,
      startMonth,
      endMonth: hasEnd ? endMonth : null,
    });
  };

  const shown = localProblem ?? problem;
  return (
    <form
      id={formId}
      noValidate
      className="m-0 flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {/* Os campos se arrumam pela largura deles (lado a lado na tela cheia, empilhados no celular
          e no diálogo de edição). O container fica só nos campos: os botões (`actions`) seguem
          o `@tab` da página. */}
      <div className="@container/plano flex flex-col gap-5">
        <div className="grid grid-cols-1 items-start gap-5 @min-[44rem]/plano:grid-cols-2 @min-[44rem]/plano:gap-x-4">
          <Field>
            <FieldLabel htmlFor={`${id}-nome`}>Nome</FieldLabel>
            <TextInput
              id={`${id}-nome`}
              value={name}
              maxLength={80}
              placeholder="Ex.: Parcela do carro"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-valor`}>Valor por mês</FieldLabel>
            <AmountInput
              id={`${id}-valor`}
              value={amountText}
              placeholder="R$ 0,00"
              className="h-16 text-28 @min-[44rem]/plano:h-13 @min-[44rem]/plano:text-22"
              onChange={(event) => setAmountText(event.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 items-start gap-5 @min-[30rem]/plano:grid-cols-2 @min-[30rem]/plano:gap-x-4">
          <Field>
            <FieldLabel htmlFor={`${id}-inicio`}>Começa em</FieldLabel>
            <input
              id={`${id}-inicio`}
              type="month"
              value={startMonth}
              onChange={(event) => setStartMonth(event.target.value)}
              className={cn(inputClass, "[color-scheme:dark]")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-fim`} className={cn(!hasEnd && "text-caption")}>
              Último mês
            </FieldLabel>
            <input
              id={`${id}-fim`}
              type="month"
              value={hasEnd ? endMonth : ""}
              disabled={!hasEnd}
              min={shiftMonth(current, 1)}
              onChange={(event) => setEndMonth(event.target.value)}
              className={cn(inputClass, "[color-scheme:dark] disabled:opacity-50")}
            />
          </Field>
        </div>
        <CheckboxRow
          id={`${id}-sem-fim`}
          label="Sem data para acabar"
          description="Ex.: aluguel ou mensalidade sem prazo"
          checked={!hasEnd}
          onCheckedChange={(checked) => setHasEnd(!checked)}
        />
        <FieldHint>
          Entra só na previsão dos meses que ainda vão chegar. O mês atual mostra sempre o que já
          foi gasto de verdade.
        </FieldHint>
        {shown && (
          <Note icon="alert-triangle" tone="warning" className="text-14">
            <span role="alert">{shown}</span>
          </Note>
        )}
      </div>
      {actions}
    </form>
  );
}
