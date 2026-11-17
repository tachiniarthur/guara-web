"use client";

import { useState } from "react";

import { GuaraTip } from "@/components/ui/guara-tip";
import { Button } from "@/components/ui/button";
import { filterChipClass } from "@/components/ui/chip";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionDetails } from "../lancamentos";
import { useAnswerAnomaly, useUpdateTransactionCategory } from "../live-ledger";
import { OffPatternTag } from "./transaction-days";

type Props = { item: Transaction; details: TransactionDetails };

/** Ícone, valor e etiqueta do lançamento (celular e tablet no topo; desktop em card). */
export function TransactionHero({ item, details, desktop }: Props & { desktop?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        desktop ? "gap-2.5 py-3" : "gap-2 pt-1.5 pb-1",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          desktop ? "size-14" : "size-13",
          item.foraDoPadrao ? "bg-urucum-bg text-urucum" : "bg-shade text-mist",
        )}
      >
        <Icon name={item.tipo === "entrada" ? "arrow-down-left" : "tag"} />
      </span>
      {!desktop && <span className="text-15 text-mist @tab:hidden">{item.descricao}</span>}
      <span
        className={cn(
          "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
          desktop ? "text-38" : "text-34",
          item.tipo === "entrada" ? "text-folha" : "text-sand",
        )}
      >
        {item.valor}
      </span>
      {item.foraDoPadrao && <OffPatternTag />}
      {desktop && <span className="text-14 text-mist">{details.resumo}</span>}
    </div>
  );
}

/** Pergunta do Guará quando a compra está fora do padrão; a resposta vai para a API. */
export function OffPatternCheck({ anomalyId }: { anomalyId: string }) {
  const answer = useAnswerAnomaly();
  const recognized = answer.isSuccess ? answer.variables.recognized : null;
  return (
    <GuaraTip
      named
      action={
        recognized === null && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={answer.isPending}
              onClick={() => answer.mutate({ id: anomalyId, recognized: true })}
            >
              <Icon name="check" size={18} />
              <span>Fui eu</span>
            </Button>
            <Button
              variant="danger-outline"
              size="sm"
              disabled={answer.isPending}
              onClick={() => answer.mutate({ id: anomalyId, recognized: false })}
            >
              <span>Não reconheço</span>
            </Button>
          </div>
        )
      }
    >
      {recognized === true
        ? "Anotado. Obrigado por confirmar."
        : recognized === false
          ? "Fale com o seu banco para contestar a compra e, se precisar, bloqueie o cartão pelo app dele."
          : answer.isError
            ? answer.error.message
            : "Esta compra está fora do seu padrão. Foi você?"}
    </GuaraTip>
  );
}

export function TransactionDetailList({ details }: { details: TransactionDetails }) {
  return (
    <DetailList
      items={[
        { label: "Data", value: details.data },
        { label: "Conta ou cartão", value: details.contaCompleta },
        ...(details.fatura ? [{ label: "Fatura", value: details.fatura }] : []),
        ...(details.forma ? [{ label: "Forma", value: details.forma }] : []),
        { label: "Descrição no banco", value: details.descricaoBanco },
        { label: "Origem", value: details.origem },
      ]}
    />
  );
}

export function NoCeilingNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-shade px-3.5 py-3 text-13 leading-normal text-sand">
      <span className="mt-px text-mist">
        <Icon name="info-lg" size={16} />
      </span>
      <span>{text}</span>
    </div>
  );
}

/** Categoria do lançamento: troca na API e, marcado, vale também para a mesma loja daqui em diante. */
export function CategoryPicker({
  transactionId,
  details,
  desktop,
  id,
}: {
  transactionId: string;
  details: TransactionDetails;
  desktop?: boolean;
  id: string;
}) {
  const update = useUpdateTransactionCategory(transactionId);
  const [category, setCategory] = useState(details.categoriaId);
  const [future, setFuture] = useState(true);
  const choose = (next: string) => {
    if (next === category || update.isPending) return;
    const previous = category;
    setCategory(next);
    update.mutate(
      { categoryId: next, applyToFuture: future },
      { onError: () => setCategory(previous) },
    );
  };
  return (
    <Panel className={cn("gap-3", desktop ? "p-5.5" : "p-4.5")}>
      <PanelHeader
        title="Categoria"
        subtitle={`${desktop ? "Clique" : "Toque"} para mudar`}
        titleClassName={cn("tracking-normal", desktop ? "text-19" : "text-17")}
      />
      <div className="flex grow flex-col gap-3">
        <div role="group" aria-label="Categorias" className="flex flex-wrap gap-2">
          {details.opcoes.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === category}
              disabled={update.isPending}
              onClick={() => choose(option.id)}
              className={filterChipClass(option.id === category)}
            >
              {option.nome}
            </button>
          ))}
        </div>
        <div className="flex min-h-13 items-center gap-3">
          <input
            id={id}
            type="checkbox"
            checked={future}
            onChange={(event) => setFuture(event.target.checked)}
            className="m-0 size-5.5 shrink-0 accent-sand"
          />
          <label htmlFor={id} className="flex grow flex-col leading-[1.35]">
            <span className="font-bold">
              Usar a mesma categoria para esta loja nas próximas vezes
            </span>
          </label>
        </div>
        {update.isError && (
          <p role="alert" className="m-0 text-13 text-urucum">
            {update.error.message}
          </p>
        )}
        {update.isSuccess && (
          <p role="status" className="m-0 text-13 text-mist">
            Categoria trocada.
          </p>
        )}
        {desktop && details.semTeto && <NoCeilingNote text={details.semTeto} />}
      </div>
    </Panel>
  );
}
