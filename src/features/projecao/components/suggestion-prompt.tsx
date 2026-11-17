"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CheckboxRow, FieldLabel, inputClass } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Presence } from "@/components/ui/presence";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { shiftMonth } from "@/lib/live-format";
import { cn } from "@/lib/utils";

import { type Suggestion, usePlannedMutations } from "../api";
import { monthsSentence } from "../data";
import { currentMonthKey } from "./planned-expense-form";

/** Da conta: some ao sair (`clearPersistedQueries`, em `lib/query-persist.ts`). */
const SEEN_KEY = "guara:sugestoes-vistas";

/** Sugestões adiadas nesta sessão do navegador ("Agora não" não volta até reabrir). */
function readSeen(): string[] {
  try {
    return JSON.parse(window.sessionStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
function markSeen(keys: readonly string[]) {
  try {
    window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...readSeen(), ...keys]));
  } catch {
    // Sem armazenamento: a sugestão pode aparecer de novo ao recarregar.
  }
}

/**
 * Pop-up de gasto recorrente: um gasto apareceu com valor parecido em meses seguidos no extrato.
 * A pessoa pode adicioná-lo como gasto futuro (com ou sem data para acabar), dizer que não é fixo
 * (não volta) ou deixar para depois (volta na próxima sessão). No máximo um pop-up por visita, a
 * sugestão de maior valor; "Agora não" adia todas, e as outras ficam em Gastos futuros.
 */
export function SuggestionPrompt({ suggestions }: { suggestions: readonly Suggestion[] }) {
  const [seen, setSeen] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readSeen(),
  );
  // Depois de responder um pop-up, não abre outro na mesma visita.
  const [answered, setAnswered] = useState(false);
  const suggestion = answered ? undefined : suggestions.find((item) => !seen.includes(item.key));
  const { create, dismiss } = usePlannedMutations();
  const current = currentMonthKey();
  const [hasEnd, setHasEnd] = useState(false);
  const [endMonth, setEndMonth] = useState(shiftMonth(current, 12));
  const [problem, setProblem] = useState<string | null>(null);

  const close = () => {
    setAnswered(true);
    setProblem(null);
    setHasEnd(false);
  };
  /** "Agora não" (ou fechar): adia todas as sugestões até a próxima sessão. */
  const later = () => {
    const keys = suggestions.map((item) => item.key);
    markSeen(keys);
    setSeen((list) => [...list, ...keys]);
    close();
  };
  const failed = (error: unknown) =>
    setProblem(error instanceof ApiError ? error.message : "Não deu para salvar. Tente de novo.");

  const add = () => {
    if (!suggestion) return;
    if (hasEnd && !(endMonth > current)) {
      return setProblem("O último mês precisa ser depois do mês atual.");
    }
    create.mutate(
      {
        name: suggestion.name,
        amountCents: suggestion.amountCents,
        endMonth: hasEnd ? endMonth : null,
        merchantKey: suggestion.key,
      },
      { onSuccess: close, onError: failed },
    );
  };

  const pending = create.isPending || dismiss.isPending;
  return (
    <Presence show={Boolean(suggestion)}>
      {suggestion && (
        <ConfirmDialog
          title="Encontramos um gasto que se repete"
          onClose={later}
          actions={
            <>
              <Button
                variant="ghost"
                size="md"
                disabled={pending}
                onClick={() =>
                  dismiss.mutate(suggestion.key, { onSuccess: close, onError: failed })
                }
              >
                Não é fixo
              </Button>
              <Button variant="outline" size="md" disabled={pending} onClick={later}>
                Agora não
              </Button>
              <Button variant="primary" size="md" disabled={pending} onClick={add}>
                <Icon name="plus" size={18} />
                <span>Adicionar</span>
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-tile bg-field px-4 py-3.5">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-tucano"
            >
              <Icon name="repeat" size={20} />
            </span>
            <span className="flex min-w-0 grow flex-col">
              <strong className="truncate text-16">{suggestion.name}</strong>
              <span className="text-13 text-caption">
                {suggestion.months.length} meses seguidos
              </span>
            </span>
            <strong className="font-display text-20 tabular-nums">
              {formatCurrency(suggestion.amountCents)}
            </strong>
          </div>
          <p className="m-0 text-15 leading-normal text-mist">
            Você gastou cerca de {formatCurrency(suggestion.amountCents)} com{" "}
            <strong className="text-sand">{suggestion.name}</strong> em{" "}
            {monthsSentence(suggestion.months)}. Quer contar com ele nos próximos meses, como um
            gasto futuro?
          </p>
          <div className="flex flex-col gap-2">
            <CheckboxRow
              id="sugestao-fim"
              label="Tem data para acabar"
              checked={hasEnd}
              onCheckedChange={setHasEnd}
            />
            {hasEnd && (
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="sugestao-ultimo-mes">Último mês</FieldLabel>
                <input
                  id="sugestao-ultimo-mes"
                  type="month"
                  value={endMonth}
                  min={shiftMonth(current, 1)}
                  onChange={(event) => setEndMonth(event.target.value)}
                  className={cn(inputClass, "[color-scheme:dark]")}
                />
              </div>
            )}
          </div>
          {problem && (
            <p role="alert" className="m-0 text-13 text-urucum">
              {problem}
            </p>
          )}
        </ConfirmDialog>
      )}
    </Presence>
  );
}
