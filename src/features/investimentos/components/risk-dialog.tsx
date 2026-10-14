"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

import { allHoldings, riskOptions, riskReasons, type Holding } from "../posicoes";

const fallbackReasons = (h: Holding) => [
  { label: "Classe", value: h.descricao.split(" · ")[0] },
  { label: "Risco calculado", value: h.risco },
  { label: "Origem", value: h.origem },
];

/**
 * "Ajustar risco" de uma posição (`?risco=<id>`): painel que sobe de baixo no celular e janela
 * centralizada a partir do tablet. O risco calculado vem marcado e explicado.
 */
export function RiskDialog() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const holding = allHoldings.find((h) => h.id === params.get("risco"));
  if (!holding) return null;

  const close = () => router.replace(pathname, { scroll: false });
  const reasons = riskReasons[holding.id] ?? fallbackReasons(holding);

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
        {riskOptions.map((option) => {
          const calculado = option.risco === holding.risco;
          return (
            <RadioCard
              key={option.risco}
              name="risco"
              title={option.risco}
              description={calculado ? `${option.texto} · calculado para este ativo` : option.texto}
              defaultChecked={calculado}
            />
          );
        })}
      </fieldset>
      <details className="border-t border-line pt-1.5">
        <summary className="flex min-h-10 cursor-pointer items-center gap-2 text-14 font-bold">
          <Icon name="info-lg" size={16} />
          Por que “{holding.risco}”?
        </summary>
        <DetailList items={reasons} />
      </details>
      <div className="flex items-center gap-2.5">
        <Link
          href={pathname}
          scroll={false}
          replace
          className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
        >
          Voltar para o automático
        </Link>
      </div>
      <Button variant="primary" size="lg" block onClick={close}>
        <span>Salvar risco</span>
      </Button>
    </ConfirmDialog>
  );
}
