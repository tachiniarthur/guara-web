"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useOnboardingBanks } from "@/stores/onboarding-banks";

import { usePlanBanks } from "../hooks";

/** Tempo de cada passo da busca simulada (a conexão de verdade vem com o Open Finance). */
const STEP_MS = 1100;

function Spinner({ done }: { done: boolean }) {
  if (done) {
    return (
      <span className="flex size-18 animate-pop items-center justify-center rounded-full bg-folha-bg text-folha">
        <Icon name="check" size={34} strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      role="img"
      aria-label="Carregando"
      className="block size-18 animate-spin"
    >
      <circle cx="36" cy="36" r="30" fill="none" stroke="#1A241F" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r="30"
        fill="none"
        stroke="#F2C230"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="70 119"
        transform="rotate(-60 36 36)"
      />
    </svg>
  );
}

/**
 * "Conectando o banco": os passos andam sozinhos e, no fim, o banco entra na lista. Se já chegou
 * ao limite do plano, segue para o perfil de investidor; senão volta para os bancos.
 */
export function ConnectingSteps({ bank }: { bank: { id: string; nome: string } }) {
  const router = useRouter();
  const connect = useOnboardingBanks((s) => s.connect);
  const connected = useOnboardingBanks((s) => s.connected);
  const plan = usePlanBanks();
  const [current, setCurrent] = useState(1);

  const steps = [
    { titulo: `Autorização no ${bank.nome}`, feito: "Confirmada" },
    { titulo: "Buscando contas e cartões", feito: "Contas e cartões encontrados" },
    { titulo: "Buscando investimentos", feito: "Investimentos encontrados" },
    { titulo: "Organizando lançamentos em categorias", feito: "Lançamentos organizados" },
  ];
  const done = current >= steps.length;

  useEffect(() => {
    if (!done) {
      const timer = setTimeout(() => setCurrent((step) => step + 1), STEP_MS);
      return () => clearTimeout(timer);
    }
    const total = connected.includes(bank.id) ? connected.length : connected.length + 1;
    connect(bank.id);
    const timer = setTimeout(
      () => router.replace(total >= plan.limite ? "/onboarding/perfil/1" : "/onboarding/bancos"),
      900,
    );
    return () => clearTimeout(timer);
    // Reage a cada passo; a lista e o limite são lidos quando a busca termina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <>
      <div className="flex flex-col items-center gap-3.5 pt-3 pb-1 text-center">
        <Spinner done={done} />
        <h1 className="m-0 font-display text-24 font-extrabold">
          {done ? `${bank.nome} conectado` : `Conectando o ${bank.nome}…`}
        </h1>
        <p className="m-0 text-15 leading-[1.55] text-mist">
          {done
            ? "Tudo certo. Já vamos seguir."
            : `Você autorizou no app do ${bank.nome}. Agora estamos buscando seus dados.`}
        </p>
      </div>
      <ol aria-live="polite" className="m-0 list-none p-0">
        {steps.map((step, index) => {
          const state = index < current ? "feito" : index === current ? "agora" : "depois";
          return (
            <li key={step.titulo} className="flex items-center gap-3 border-b border-line py-2.5">
              {state === "feito" ? (
                <span className="flex size-7 shrink-0 animate-pop items-center justify-center rounded-full bg-folha-bg text-folha">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                </span>
              ) : (
                <span
                  className={cn(
                    "size-7 shrink-0 rounded-full transition-colors duration-300",
                    state === "agora"
                      ? "border-3 border-tucano motion-safe:animate-pulse"
                      : "border-2 border-line-strong",
                  )}
                />
              )}
              <span className="flex grow flex-col leading-[1.4]">
                <span
                  className={cn(
                    "transition-colors duration-300",
                    state === "agora" ? "font-bold" : "font-medium",
                    state === "depois" ? "text-caption" : "text-sand",
                  )}
                >
                  {step.titulo}
                </span>
                <span className="text-13 text-caption">
                  {state === "feito" ? step.feito : state === "agora" ? "Buscando…" : "Aguardando"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Saída da tela de conexão: voltar para a lista de bancos (a busca continua). */
export function BackToBanks({ block }: { block?: boolean }) {
  return (
    <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl" block={block}>
      <span>Voltar para os bancos</span>
    </ButtonLink>
  );
}
