"use client";

import { useState } from "react";

import { AgentTip } from "@/components/ui/agent-tip";
import { ActionList } from "@/components/ui/action-list";
import { Button } from "@/components/ui/button";
import { filterChipClass } from "@/components/ui/chip";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { OFFLINE_NOTE, type ScreenState } from "@/components/states/screen-state";
import { ErrorBlock, NoDataBlock, StateSwap } from "@/components/states/state-block";

import type { Transaction, TransactionDetails } from "../lancamentos";
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

/** Pergunta do Quero-quero quando a compra está fora do padrão. */
export function OffPatternCheck() {
  const [answer, setAnswer] = useState<"sim" | "nao" | null>(null);
  return (
    <AgentTip
      agent="quero-quero"
      named
      action={
        answer ? undefined : (
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setAnswer("sim")}>
              <Icon name="check" size={18} />
              <span>Fui eu</span>
            </Button>
            <Button variant="danger-outline" size="sm" onClick={() => setAnswer("nao")}>
              <span>Não reconheço</span>
            </Button>
          </div>
        )
      }
    >
      {answer === "sim"
        ? "Anotado. Não vou perguntar de novo sobre compras parecidas nesta loja."
        : answer === "nao"
          ? "Vou te ajudar a contestar no Nubank. Bloqueie o cartão pelo app do banco agora."
          : "Compra às 02:14, bem acima do seu costume em eletrônicos. Foi você?"}
    </AgentTip>
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

/** Categoria do lançamento (troca a categoria e lembra para a mesma loja). */
export function CategoryPicker({
  details,
  current,
  desktop,
  id,
  state,
}: {
  details: TransactionDetails;
  current: string;
  desktop?: boolean;
  id: string;
  state?: ScreenState | null;
}) {
  const [category, setCategory] = useState(current);
  return (
    <Panel className={cn("gap-3", desktop ? "p-5.5" : "p-4.5")}>
      <PanelHeader
        title="Categoria"
        subtitle={
          state === "sem-internet" ? (
            <span className="text-tucano">{OFFLINE_NOTE}</span>
          ) : (
            `${desktop ? "Clique" : "Toque"} para mudar · vale para compras parecidas`
          )
        }
        titleClassName={cn("tracking-normal", desktop ? "text-19" : "text-17")}
      />
      <StateSwap
        replacement={state === "erro" ? <ErrorBlock /> : state === "vazio" && <NoDataBlock />}
        className="grow gap-3"
      >
        <div className="flex flex-wrap gap-2">
          {[...details.categorias, "Outra…"].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === category}
              onClick={() => setCategory(option)}
              className={filterChipClass(option === category)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex min-h-13 items-center gap-3">
          <input
            id={id}
            type="checkbox"
            defaultChecked
            className="m-0 size-5.5 shrink-0 accent-sand"
          />
          <label htmlFor={id} className="flex grow flex-col leading-[1.35]">
            <span className="font-bold">Usar “{category}” para esta loja nas próximas vezes</span>
          </label>
        </div>
        {desktop && details.semTeto && <NoCeilingNote text={details.semTeto} />}
      </StateSwap>
    </Panel>
  );
}

export function MoreActions({ desktop, failed }: { desktop?: boolean; failed?: boolean }) {
  return (
    <Panel className={cn("grow gap-1.5", desktop ? "p-5.5" : "p-4.5")}>
      <PanelHeader
        title="Mais ações"
        titleClassName={cn("tracking-normal", desktop ? "text-19" : "text-17")}
      />
      <StateSwap replacement={failed && <ErrorBlock />} className="grow">
        <ActionList
          items={[
            {
              icon: "copy",
              label: "Marcar como duplicado",
              description: "Some do total se o mesmo gasto apareceu duas vezes",
            },
            {
              icon: "repeat-alt",
              label: "Não é assinatura",
              description: "Para de tratar esta loja como cobrança recorrente",
            },
            { icon: "edit", label: "Adicionar observação" },
            { icon: "eye-alt", label: "Esconder dos relatórios" },
          ]}
        />
      </StateSwap>
    </Panel>
  );
}
