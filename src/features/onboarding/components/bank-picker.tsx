"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useOnboardingBanks } from "@/stores/onboarding-banks";

import { banks } from "../data";
import { usePlanBanks } from "../hooks";

/**
 * Bancos para conectar pelo Open Finance. Os já conectados aparecem marcados; os outros levam à
 * autorização (Malvo). No limite do plano, os que faltam ficam travados.
 */
export function BankPicker() {
  const connected = useOnboardingBanks((s) => s.connected);
  const justConnected = useOnboardingBanks((s) => s.justConnected);
  const dismissNotice = useOnboardingBanks((s) => s.dismissNotice);
  // O aviso "X conectado" vale só para esta visita à lista.
  useEffect(() => dismissNotice, [dismissNotice]);
  const plan = usePlanBanks();
  const full = connected.length >= plan.limite;
  const lastName = banks.find((b) => b.id === justConnected)?.nome;
  return (
    <>
      {lastName && (
        <p
          role="status"
          className="m-0 flex animate-fade-up items-center gap-2 rounded-tile bg-folha-bg px-3.5 py-3 text-14 text-sand"
        >
          <span className="text-folha">
            <Icon name="check" size={18} strokeWidth={2.4} />
          </span>
          {lastName} conectado. Quer conectar outro?
        </p>
      )}
      <div className="grid grid-cols-2 items-start gap-2.5">
        {banks.map((bank) => {
          const on = connected.includes(bank.id);
          const locked = !on && full;
          const className = cn(
            "flex min-h-15 items-center gap-3 rounded-full px-3.5 text-left text-sand no-underline transition-[background-color,border-color,transform] duration-200",
            on
              ? "border-2 border-folha bg-folha-bg"
              : locked
                ? "border border-line bg-field opacity-50"
                : "border border-line-strong bg-field hover:-translate-y-0.5 hover:bg-shade",
            // No mobile o Santander aparece depois do C6, como no protótipo.
            bank.id === "santander" && "order-1 md:order-none",
          );
          const content = (
            <>
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
                  <span className="text-12 text-caption">
                    {locked ? "Limite do plano" : "Conectar"}
                  </span>
                )}
              </span>
            </>
          );
          return on || locked ? (
            <div key={bank.id} className={className}>
              {content}
            </div>
          ) : (
            <Link key={bank.id} href={`/onboarding/bancos/${bank.id}`} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
      <p className="m-0 text-14 text-mist">
        <strong className="text-sand">
          {connected.length} de {plan.limite}
        </strong>{" "}
        bancos do plano {plan.nome}. Dá para conectar mais depois.
      </p>
    </>
  );
}
