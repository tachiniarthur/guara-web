"use client";

import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Presence } from "@/components/ui/presence";
import { useSession } from "@/features/acesso/session";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { labelsOfMonth } from "@/lib/live-format";

import {
  type PlannedExpense,
  type Suggestion,
  usePlannedExpenses,
  usePlannedMutations,
  useSuggestions,
} from "../api";
import { monthsSentence, prototypePlanned, prototypeSuggestions, untilLabel } from "../data";
import { PlannedExpenseForm } from "./planned-expense-form";

const errorText = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : error ? fallback : null;

/** "dez 2026 → jun 2031" / "a partir de dez 2026". */
function periodLabel(item: PlannedExpense) {
  const start = labelsOfMonth(item.startMonth).short.toLowerCase();
  return item.endMonth
    ? `${start} → ${labelsOfMonth(item.endMonth).short.toLowerCase()}`
    : `a partir de ${start}, ${untilLabel(null)}`;
}

/**
 * Gastos futuros: os que a pessoa cadastrou ou aceitou (editar e apagar) e as sugestões de gasto
 * recorrente vindas do extrato (adicionar ou "não é fixo"). Todos contam só na previsão dos meses
 * depois do atual.
 */
export function PlannedListScreen() {
  const { live } = useSession();
  const planned = usePlannedExpenses({ enabled: live });
  const suggestions = useSuggestions({ enabled: live });
  const { create, update, remove, dismiss } = usePlannedMutations();
  const [editing, setEditing] = useState<PlannedExpense | null>(null);
  const [removing, setRemoving] = useState<PlannedExpense | null>(null);

  const items = live ? planned.data?.data : prototypePlanned;
  const suggested = live ? suggestions.data?.data : prototypeSuggestions;
  const totalCents = (items ?? []).reduce((total, item) => total + item.amountCents, 0);

  const accept = (suggestion: Suggestion) =>
    live &&
    create.mutate({
      name: suggestion.name,
      amountCents: suggestion.amountCents,
      endMonth: null,
      merchantKey: suggestion.key,
    });

  return (
    <Page
      padding="list"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Gastos futuros" close="/gastos" />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Gastos", href: "/gastos" }, { label: "Gastos futuros" }]}
      />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="hidden flex-col gap-1.5 @tab:flex">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Gastos futuros
          </h1>
          <p className="m-0 text-15 text-mist">
            Gastos fixos que entram na previsão dos próximos meses
          </p>
        </div>
        <ButtonLink href="/gastos/futuros/novo" variant="primary" size="md" className="text-15">
          <Icon name="plus" size={18} />
          <span>Adicionar gasto futuro</span>
        </ButtonLink>
      </header>

      {suggested && suggested.length > 0 && (
        <Panel className="gap-3 border-tucano/40 p-4 @tab:p-5">
          <PanelHeader
            title="Encontramos gastos que se repetem"
            subtitle="Vieram do seu extrato, com valor parecido em meses seguidos"
          />
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {suggested.map((suggestion) => (
              <li
                key={suggestion.key}
                className="flex flex-wrap items-center gap-3 rounded-tile bg-field px-4 py-3"
              >
                <span className="flex min-w-0 grow flex-col">
                  <strong className="truncate text-15">{suggestion.name}</strong>
                  <span className="text-13 text-caption">
                    {formatCurrency(suggestion.amountCents)} em {monthsSentence(suggestion.months)}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!live || dismiss.isPending}
                  onClick={() => dismiss.mutate(suggestion.key)}
                >
                  Não é fixo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!live || create.isPending}
                  onClick={() => accept(suggestion)}
                >
                  <Icon name="plus" size={16} />
                  <span>Adicionar</span>
                </Button>
              </li>
            ))}
          </ul>
          {(create.error || dismiss.error) && (
            <p role="alert" className="m-0 text-13 text-urucum">
              {errorText(create.error ?? dismiss.error, "Não deu para salvar. Tente de novo.")}
            </p>
          )}
        </Panel>
      )}

      <Panel className="gap-3 p-4 @tab:p-5">
        <PanelHeader
          title="Cadastrados"
          subtitle={
            items && items.length > 0
              ? `${items.length} ${items.length === 1 ? "gasto" : "gastos"} · ${formatCurrency(totalCents)} por mês enquanto todos valem`
              : undefined
          }
        />
        {live && planned.error ? (
          <ErrorBlock />
        ) : !items ? (
          <p role="status" className="m-0 text-14 text-mist">
            Carregando…
          </p>
        ) : items.length === 0 ? (
          <p className="m-0 rounded-tile border border-dashed border-line-strong p-4 text-14 text-mist">
            Nenhum gasto futuro ainda. Cadastre a parcela do carro, o aluguel ou outra conta que
            você já sabe que vai pagar.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex min-h-15 items-center gap-3 border-b border-line py-2 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-field text-mist"
                >
                  <Icon name={item.source === "detected" ? "repeat" : "calendar"} size={18} />
                </span>
                <span className="flex min-w-0 grow flex-col">
                  <span className="truncate text-15 font-medium">{item.name}</span>
                  <span className="text-13 text-caption">{periodLabel(item)}</span>
                </span>
                <span className="text-15 font-bold whitespace-nowrap tabular-nums">
                  {formatCurrency(item.amountCents)}
                  <span className="text-13 font-normal text-mist">/mês</span>
                </span>
                <IconButton
                  icon="pencil"
                  label={`Editar ${item.name}`}
                  variant="ghost"
                  disabled={!live}
                  onClick={() => {
                    update.reset();
                    setEditing(item);
                  }}
                />
                <IconButton
                  icon="trash"
                  label={`Apagar ${item.name}`}
                  variant="ghost"
                  disabled={!live}
                  onClick={() => {
                    remove.reset();
                    setRemoving(item);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Presence show={editing !== null}>
        {editing && (
          <ConfirmDialog title={`Editar ${editing.name}`} onClose={() => setEditing(null)}>
            <PlannedExpenseForm
              initial={editing}
              problem={errorText(update.error, "Não deu para salvar as mudanças.")}
              onSubmit={(input) =>
                update.mutate(
                  {
                    id: editing.id,
                    name: input.name,
                    amountCents: input.amountCents,
                    startMonth: input.startMonth,
                    endMonth: input.endMonth,
                  },
                  { onSuccess: () => setEditing(null) },
                )
              }
              actions={
                <div className="flex flex-wrap justify-end gap-2.5">
                  <Button variant="ghost" size="md" onClick={() => setEditing(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={update.isPending}>
                    <Icon name="check" size={18} />
                    <span>{update.isPending ? "Salvando…" : "Salvar"}</span>
                  </Button>
                </div>
              }
            />
          </ConfirmDialog>
        )}
      </Presence>

      <Presence show={removing !== null}>
        {removing && (
          <ConfirmDialog
            title={`Apagar ${removing.name}?`}
            centered
            onClose={() => setRemoving(null)}
            actions={
              <>
                <Button variant="ghost" size="md" onClick={() => setRemoving(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(removing.id, { onSuccess: () => setRemoving(null) })}
                >
                  <Icon name="trash" size={18} />
                  <span>Apagar</span>
                </Button>
              </>
            }
          >
            <p className="m-0 text-15 leading-normal text-mist">
              Ele sai da previsão dos próximos meses.
              {removing.source === "detected" && " A sugestão desse gasto não volta a aparecer."}
            </p>
            {remove.error && (
              <p role="alert" className="m-0 text-13 text-urucum">
                {errorText(remove.error, "Não deu para apagar. Tente de novo.")}
              </p>
            )}
          </ConfirmDialog>
        )}
      </Presence>
    </Page>
  );
}
