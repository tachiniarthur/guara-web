"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { RadioCard } from "@/components/ui/form";
import { Note } from "@/components/ui/note";

import { bankConnections as banks, plan } from "../data";

/** "Desconectar o Nubank?" (`?desconectar=<banco>`): manter ou apagar o histórico importado. */
export function DisconnectDialog() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const bank = banks.find((b) => b.id === params.get("desconectar"));
  if (!bank) return null;

  return (
    <ConfirmDialog
      title={`Desconectar o ${bank.nome}?`}
      onClose={() => router.replace(pathname, { scroll: false })}
      actions={
        <>
          <ButtonLink href={pathname} replace scroll={false} variant="ghost" className="text-15">
            <span>Cancelar</span>
          </ButtonLink>
          <ButtonLink href={pathname} replace scroll={false} variant="danger" className="text-15">
            <span>Desconectar</span>
          </ButtonLink>
        </>
      }
    >
      <DialogText>
        O Guará para de receber saldo, gastos e investimentos do {bank.nome}, e a autorização no
        Open Finance é revogada também no banco.
      </DialogText>
      <fieldset aria-label="Histórico" className="m-0 flex min-w-0 flex-col gap-2 border-none p-0">
        <RadioCard
          name="historico"
          title="Manter o histórico já importado"
          description={`Lançamentos e relatórios antigos do ${bank.nome} continuam no Guará`}
          defaultChecked
        />
        <RadioCard
          name="historico"
          title={`Apagar o histórico do ${bank.nome}`}
          description="Some dos gastos, relatórios e metas. Não dá para desfazer"
        />
      </fieldset>
      <Note icon="info-lg" tone="info">
        {`Libera 1 conexão do plano ${plan.nome}: você fica com ${plan.usadas - 1} de ${plan.total}.`}
      </Note>
    </ConfirmDialog>
  );
}
