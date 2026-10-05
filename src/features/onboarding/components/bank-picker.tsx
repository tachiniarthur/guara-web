"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { plan } from "@/features/perfil/data";
import { cn } from "@/lib/utils";

import { banks } from "../data";

/** Bancos para conectar pelo Open Finance (toque para conectar ou desconectar). */
export function BankPicker({ defaultConnected = ["nubank"] }: { defaultConnected?: string[] }) {
  const [connected, setConnected] = useState<string[]>(defaultConnected);

  function toggle(id: string) {
    setConnected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < plan.total
          ? [...current, id]
          : current,
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 items-start gap-2.5">
        {banks.map((bank) => {
          const on = connected.includes(bank.id);
          return (
            <button
              key={bank.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(bank.id)}
              className={cn(
                "flex min-h-15 items-center gap-3 rounded-full px-3.5 text-left text-sand",
                on
                  ? "border-2 border-folha bg-folha-bg"
                  : "border border-line-strong bg-field hover:bg-shade",
                // No mobile o Santander aparece depois do C6, como no protótipo.
                bank.id === "santander" && "order-1 md:order-none",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-[2.25rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas font-display text-14 font-bold"
              >
                {bank.sigla}
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className="text-15 font-bold">{bank.nome}</span>
                {on ? (
                  <span className="flex items-center gap-1 text-12 font-bold text-folha">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    Conectado
                  </span>
                ) : (
                  <span className="text-12 text-caption">Conectar</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="m-0 text-14 text-mist">
        <strong className="text-sand">
          {connected.length} de {plan.total}
        </strong>{" "}
        bancos do plano {plan.nome}. Dá para conectar mais depois.
      </p>
    </>
  );
}
