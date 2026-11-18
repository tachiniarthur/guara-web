"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { MobileActionBar, RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { useSession } from "@/features/acesso/session";
import {
  duplicateRows,
  useDuplicates,
  useKeepSeparate,
  useRemoveManual,
  type DuplicatePair,
} from "@/features/investimentos/duplicates";

type Choice = "remove" | "separate";

const OPTIONS: { value: Choice; title: string; description: string }[] = [
  {
    value: "remove",
    title: "Excluir o cadastro manual",
    description: "É o mesmo dinheiro. Fica só o que chega do Open Finance, atualizado sozinho.",
  },
  {
    value: "separate",
    title: "Manter separados",
    description:
      "São investimentos diferentes. Os dois continuam na carteira e não perguntamos de novo.",
  },
];

function SourceCard({ pair, side }: { pair: DuplicatePair; side: keyof DuplicatePair }) {
  const position = pair[side];
  const openFinance = side === "openFinance";
  return (
    <Panel className="gap-2.5">
      <div className="flex items-center gap-2.5">
        <Tag tone={openFinance ? "arara" : "neutral"} status>
          <Icon name={openFinance ? "bank" : "edit"} size={14} strokeWidth={2} />
          {openFinance ? "Open Finance" : "Cadastro manual"}
        </Tag>
      </div>
      <strong className="font-display text-20">{position.name}</strong>
      <DetailList items={duplicateRows(position)} />
    </Panel>
  );
}

const intro =
  "O mesmo investimento chegou pelo Open Finance e também está no seu cadastro manual. Se for o mesmo dinheiro, a carteira conta duas vezes. Escolha o que fazer; nada muda até você confirmar.";

/**
 * Um par por vez (o primeiro que a API devolve). Confirmar exclui o manual ou o marca como
 * separado; a lista recarrega e mostra o próximo par, ou volta para Investimentos no último.
 */
export function DuplicidadeScreen() {
  const router = useRouter();
  const { live } = useSession();
  const duplicates = useDuplicates({ enabled: live });
  const keep = useKeepSeparate();
  const remove = useRemoveManual();
  const [choice, setChoice] = useState<Choice>("remove");
  const pairs = duplicates.data?.data;
  const pair = pairs?.[0];
  const saving = keep.isPending || remove.isPending;
  const failed = keep.error || remove.error;

  const confirm = () => {
    if (!pair || saving) return;
    const last = pairs.length === 1;
    const action = choice === "remove" ? remove : keep;
    action.mutate(pair.manual.id, {
      onSuccess: () => {
        setChoice("remove");
        if (last) router.push("/investimentos");
      },
    });
  };
  const label = saving ? "Salvando…" : "Confirmar";

  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Investimento duplicado" close="/investimentos" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Duplicidade" }]}
      />
      <DetailHeader
        title="Investimento duplicado"
        subtitle={
          pair
            ? pairs.length > 1
              ? `${pair.manual.name} · 1 de ${pairs.length}`
              : pair.manual.name
            : undefined
        }
      />
      {!live || duplicates.error ? (
        <ErrorBlock />
      ) : !pairs ? (
        <LoadingStatus />
      ) : !pair ? (
        <StateBlock
          icon="check"
          title="Nada duplicado"
          action={
            <ButtonLink href="/investimentos" variant="secondary" size="md" className="text-15">
              <span>Voltar para Investimentos</span>
            </ButtonLink>
          }
        >
          Nenhum cadastro manual repete um investimento que chega pelo Open Finance.
        </StateBlock>
      ) : (
        <>
          <p className="m-0 text-15 leading-[1.55] text-mist @desk:text-16">{intro}</p>
          <div className="grid grid-cols-1 items-stretch gap-4 @tab:grid-cols-2 @tab:gap-y-5 @desk:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] @desk:gap-5">
            <SourceCard pair={pair} side="openFinance" />
            <SourceCard pair={pair} side="manual" />
            {/* Celular: a escolha fica solta; tablet e desktop: num card. */}
            <div className="flex flex-col gap-4 @tab:col-span-2 @tab:gap-3.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:col-span-1">
              <PanelHeader
                title="O que fazer?"
                titleClassName="text-18 tracking-normal @tab:text-20"
              />
              <fieldset
                aria-label="O que fazer?"
                className="m-0 flex min-w-0 flex-col gap-2.5 border-none p-0"
              >
                {OPTIONS.map((o) => (
                  <RadioCard
                    key={o.value}
                    name="duplicidade"
                    value={o.value}
                    title={o.title}
                    description={o.description}
                    checked={choice === o.value}
                    onChange={() => setChoice(o.value)}
                  />
                ))}
              </fieldset>
            </div>
          </div>
          <Note icon="info-lg" tone="info" className="bg-arara-bg" iconClassName="text-arara">
            Enquanto você não decide, os dois contam no total da carteira.
          </Note>
          {failed && (
            <Note icon="alert-triangle" tone="warning">
              Não deu para salvar a escolha. Tente de novo em instantes.
            </Note>
          )}
          <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
            <ButtonLink href="/investimentos" variant="ghost" className="text-15">
              <span>Decidir depois</span>
            </ButtonLink>
            <Button variant="primary" className="text-15" disabled={saving} onClick={confirm}>
              <Icon name="check" size={18} />
              <span>{label}</span>
            </Button>
          </div>
          <MobileActionBar className="items-center">
            <ButtonLink href="/investimentos" variant="ghost" size="xl">
              <span>Depois</span>
            </ButtonLink>
            <Button
              variant="primary"
              size="xl"
              className="grow"
              disabled={saving}
              onClick={confirm}
            >
              <Icon name="check" size={18} />
              <span>{label}</span>
            </Button>
          </MobileActionBar>
        </>
      )}
    </Page>
  );
}
