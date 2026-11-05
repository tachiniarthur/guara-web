"use client";

import { useState } from "react";

import { StatusToast } from "@/components/states/status-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Presence } from "@/components/ui/presence";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/features/acesso/session";

import { useDemoDataAction, useDemoDataStatus } from "../demo-data";
import { SectionRow } from "./section-row";

type Action = "fill" | "clear";

const DONE: Record<Action, { title: string; text: string }> = {
  fill: { title: "Dados de exemplo prontos", text: "Abra o Início para ver a conta preenchida." },
  clear: { title: "Dados de exemplo apagados", text: "A conta voltou a ficar vazia." },
};

/**
 * Dados de exemplo (só no ambiente de teste): preenche a conta com banco, gastos, investimentos,
 * bens, metas, tetos, alertas e simulações fictícios, enquanto o Open Finance não está ligado.
 * Em produção a API diz que não há (`available: false`) e o bloco não aparece.
 */
export function DemoDataSection() {
  const { live } = useSession();
  const status = useDemoDataStatus({ enabled: live });
  const action = useDemoDataAction();
  const [confirm, setConfirm] = useState<Action | null>(null);
  const [done, setDone] = useState<{ action: Action; at: number } | null>(null);

  if (!live || !status.data?.available) return null;
  const seeded = status.data.seeded;

  function run(chosen: Action) {
    setConfirm(null);
    action.mutate(chosen, { onSuccess: () => setDone({ action: chosen, at: Date.now() }) });
  }

  return (
    <SectionRow
      title="Dados de exemplo"
      description="Só no ambiente de teste: uma conta fictícia completa para ver as telas com dados."
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 text-14 text-mist">
          {seeded
            ? "Sua conta está com os dados de exemplo: banco, gastos, investimentos, bens, metas, tetos, alertas e simulações."
            : "Preenche sua conta com banco, gastos de 6 meses, investimentos com um ano de histórico, bens, metas, tetos, alertas e simulações. Tudo fictício."}
        </p>
        {action.isPending ? (
          <div className="flex items-center gap-3 text-14 text-mist" role="status">
            <Spinner size={20} label="Gravando" />
            <span>
              {action.variables === "clear"
                ? "Apagando…"
                : "Preenchendo a conta, leva alguns segundos…"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <Button variant="primary" className="text-15" onClick={() => setConfirm("fill")}>
              <Icon name="check" size={18} />
              <span>{seeded ? "Recriar dados de exemplo" : "Preencher com dados de exemplo"}</span>
            </Button>
            {seeded && (
              <Button
                variant="danger-outline"
                className="text-15"
                onClick={() => setConfirm("clear")}
              >
                <span>Apagar dados de exemplo</span>
              </Button>
            )}
          </div>
        )}
        {action.isError && (
          <Note icon="info-lg" tone="warning">
            {action.error.message}
          </Note>
        )}
      </div>

      <Presence show={confirm !== null}>
        {confirm && (
          <ConfirmDialog
            title={
              confirm === "fill" ? "Preencher com dados de exemplo?" : "Apagar os dados de exemplo?"
            }
            onClose={() => setConfirm(null)}
            actions={
              <>
                <Button variant="ghost" className="text-15" onClick={() => setConfirm(null)}>
                  <span>Cancelar</span>
                </Button>
                <Button
                  variant={confirm === "fill" ? "primary" : "danger"}
                  className="text-15"
                  onClick={() => run(confirm)}
                >
                  <span>{confirm === "fill" ? "Preencher" : "Apagar"}</span>
                </Button>
              </>
            }
          >
            <DialogText>
              {confirm === "fill"
                ? "Os investimentos, bens, metas, tetos, alertas e simulações que você cadastrou à mão são trocados pelos de exemplo. Nada do Open Finance é apagado."
                : "Saem o banco fictício, os gastos, os investimentos, bens, metas, tetos, alertas e simulações. Nada do Open Finance é apagado."}
            </DialogText>
          </ConfirmDialog>
        )}
      </Presence>

      {done && (
        <StatusToast
          key={done.at}
          tone="neutral"
          icon="check"
          title={DONE[done.action].title}
          position="bottom"
        >
          {DONE[done.action].text}
        </StatusToast>
      )}
    </SectionRow>
  );
}
