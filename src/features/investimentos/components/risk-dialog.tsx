"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { RadioCard } from "@/components/ui/form";
import { Note } from "@/components/ui/note";
import { Presence } from "@/components/ui/presence";
import { ApiError } from "@/lib/api";

import { useUpdateRisk, type Holding, type HoldingsData } from "../posicoes";
import type { Risk } from "../types";

const riskOptions: { risco: Risk; texto: string }[] = [
  { risco: "Baixo", texto: "Oscila pouco e tem garantia ou baixo risco de crédito" },
  { risco: "Médio", texto: "Oscila de vez em quando" },
  { risco: "Alto", texto: "Oscila bastante" },
];

/**
 * "Ajustar risco" de uma posição (`?risco=<id>`): painel que sobe de baixo no celular e janela
 * centralizada a partir do tablet. Salvar grava o risco na API (vale só para a carteira da pessoa).
 */
export function RiskDialog({ holdings }: { holdings: HoldingsData }) {
  const params = useSearchParams();
  const id = params.get("risco");
  const holding = holdings.classes.flatMap((c) => c.itens).find((h) => h.id === id);
  return (
    <Presence show={Boolean(holding)}>
      {holding && <RiskPanel key={holding.id} holding={holding} />}
    </Presence>
  );
}

function RiskPanel({ holding }: { holding: Holding }) {
  const router = useRouter();
  const pathname = usePathname();
  const [risk, setRisk] = useState<Risk>(holding.risco);
  const update = useUpdateRisk(holding.id);
  const close = () => router.replace(pathname, { scroll: false });

  return (
    <ConfirmDialog
      title={`Ajustar risco de ${holding.nome}`}
      heading={
        <>
          Ajustar risco<span className="hidden md:inline"> de {holding.nome}</span>
        </>
      }
      onClose={close}
      className="md:w-[30rem] lg:w-[32.5rem]"
    >
      <p className="m-0 text-14 leading-[1.55] text-mist">
        {holding.nome} · o risco ajuda a montar a alocação e os alertas. Mudar aqui vale só para a
        sua carteira.
      </p>
      <fieldset aria-label="Risco" className="m-0 flex flex-col gap-3.5 border-none p-0 md:gap-4">
        {riskOptions.map((option) => (
          <RadioCard
            key={option.risco}
            name="risco"
            title={option.risco}
            description={
              option.risco === holding.risco ? `${option.texto} · o de hoje` : option.texto
            }
            checked={risk === option.risco}
            onChange={() => setRisk(option.risco)}
          />
        ))}
      </fieldset>
      <DetailList
        items={[
          { label: "Tipo", value: holding.instrumento },
          { label: "Risco de hoje", value: holding.risco },
          { label: "Origem", value: holding.origem },
        ]}
      />
      {update.error && (
        <Note icon="alert-triangle" tone="warning">
          {update.error instanceof ApiError
            ? update.error.message
            : "Não deu para salvar o risco. Tente de novo."}
        </Note>
      )}
      <Button
        variant="primary"
        size="lg"
        block
        disabled={update.isPending}
        onClick={() => {
          if (risk === holding.risco) return close();
          update.mutate(risk, { onSuccess: close });
        }}
      >
        <span>{update.isPending ? "Salvando…" : "Salvar risco"}</span>
      </Button>
    </ConfirmDialog>
  );
}
