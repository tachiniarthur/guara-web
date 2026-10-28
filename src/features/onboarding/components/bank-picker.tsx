"use client";

import Link from "next/link";
import { useEffect } from "react";

import { BankMark } from "@/components/ui/bank-mark";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useOnboardingBanks } from "@/stores/onboarding-banks";

import { banks } from "../data";
import { usePlanBanks } from "../hooks";

/** Conectados além do limite do plano (ex.: trocou para um plano menor): precisa desconectar. */
export function useBanksOverLimit() {
  const connected = useOnboardingBanks((s) => s.connected);
  const plan = usePlanBanks();
  return Math.max(0, connected.length - plan.limite);
}

const bankWord = (count: number) => (count === 1 ? "banco" : "bancos");

/** Quantos bancos o plano deixa e o que fazer quando chega ou passa do limite. */
function PlanUsage({ count, limit, plan }: { count: number; limit: number; plan: string }) {
  if (count > limit) {
    const extra = count - limit;
    return (
      <p
        role="alert"
        className="m-0 flex items-start gap-2.5 rounded-tile bg-urucum-bg px-3.5 py-3 text-14 leading-normal text-sand"
      >
        <span className="mt-px text-urucum">
          <Icon name="alert-triangle" size={18} />
        </span>
        <span>
          O plano {plan} inclui{" "}
          <strong>
            {limit} {bankWord(limit)}
          </strong>{" "}
          e há {count} conectados. Desconecte {extra} {bankWord(extra)} para continuar, ou volte e
          escolha um plano maior.
        </span>
      </p>
    );
  }
  if (count === limit) {
    return (
      <p className="m-0 text-14 text-mist">
        <strong className="text-sand">
          {count} de {limit}
        </strong>{" "}
        {bankWord(limit)}: você chegou ao limite do plano {plan}. Para conectar outro, desconecte um
        ou troque de plano depois, em Meu perfil.
      </p>
    );
  }
  return (
    <p className="m-0 text-14 text-mist">
      <strong className="text-sand">
        {count} de {limit}
      </strong>{" "}
      {bankWord(limit)} do plano {plan}. Dá para conectar {limit - count === 1 ? "mais 1" : "mais"}{" "}
      agora ou depois.
    </p>
  );
}

/**
 * Bancos para conectar pelo Open Finance. Os já conectados aparecem marcados e podem ser
 * desconectados; os outros levam à autorização (Malvo). No limite do plano, os que faltam ficam
 * travados.
 */
export function BankPicker() {
  const connected = useOnboardingBanks((s) => s.connected);
  const justConnected = useOnboardingBanks((s) => s.justConnected);
  const disconnect = useOnboardingBanks((s) => s.disconnect);
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
          {full ? `${lastName} conectado.` : `${lastName} conectado. Quer conectar outro?`}
        </p>
      )}
      <div className="grid grid-cols-2 items-start gap-2.5 lg:grid-cols-4 lg:gap-2">
        {banks.map((bank) => {
          const on = connected.includes(bank.id);
          const locked = !on && full;
          const className = cn(
            "flex min-h-15 items-center gap-3 rounded-full px-3.5 text-left text-sand no-underline transition-[background-color,border-color,transform] duration-200 lg:min-h-13 lg:gap-2.5 lg:px-2.5",
            on
              ? "border-2 border-folha bg-folha-bg pr-2"
              : locked
                ? "border border-line bg-field opacity-50"
                : "border border-line-strong bg-field hover:-translate-y-0.5 hover:bg-shade",
            // No mobile o Santander aparece depois do C6, como no protótipo.
            bank.id === "santander" && "order-1 md:order-none",
          );
          const content = (
            <>
              <BankMark bank={bank.id} size={36} />
              <span className="flex min-w-0 grow flex-col leading-[1.3]">
                <span className="truncate text-15 font-bold">{bank.nome}</span>
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
          if (on) {
            return (
              <div key={bank.id} className={className}>
                {content}
                <button
                  type="button"
                  onClick={() => disconnect(bank.id)}
                  aria-label={`Desconectar ${bank.nome}`}
                  title={`Desconectar ${bank.nome}`}
                  className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-12 font-bold text-sand hover:border-urucum-line hover:text-urucum lg:size-8 lg:justify-center lg:px-0"
                >
                  <Icon name="x" size={14} />
                  <span className="sm:inline hidden lg:hidden">Desconectar</span>
                </button>
              </div>
            );
          }
          return locked ? (
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
      <PlanUsage count={connected.length} limit={plan.limite} plan={plan.nome} />
    </>
  );
}

/**
 * "Continuar" da etapa de bancos: travado enquanto houver mais bancos conectados do que o plano
 * deixa.
 */
export function BankStepContinue({ className }: { className?: string }) {
  const over = useBanksOverLimit();
  if (over > 0) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "flex h-13 cursor-not-allowed items-center justify-center rounded-full bg-shade px-4.5 text-15 font-bold text-caption",
          className,
        )}
      >
        Continuar
      </span>
    );
  }
  return (
    <ButtonLink href="/onboarding/perfil/1" variant="primary" size="xl" className={className}>
      <span>Continuar</span>
    </ButtonLink>
  );
}

/** "Pular": some enquanto houver bancos além do plano (é preciso desconectar antes). */
export function BankStepSkip({ label, className }: { label: string; className?: string }) {
  const over = useBanksOverLimit();
  if (over > 0) return null;
  return (
    <ButtonLink
      href="/onboarding/perfil/1"
      variant="ghost"
      size="xl"
      className={cn("hover:bg-transparent", className)}
    >
      <span>{label}</span>
    </ButtonLink>
  );
}
