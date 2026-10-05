import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { onboardingHighlights } from "../data";

/** Some de cima para baixo (degradê suave de 110px), como nos protótipos. */
const landscapeMask =
  "linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,.017) 9px, rgba(0,0,0,.067) 18px, rgba(0,0,0,.146) 28px, rgba(0,0,0,.25) 37px, rgba(0,0,0,.371) 46px, rgba(0,0,0,.5) 55px, rgba(0,0,0,.629) 64px, rgba(0,0,0,.75) 73px, rgba(0,0,0,.854) 82px, rgba(0,0,0,.933) 92px, rgba(0,0,0,.983) 101px, rgba(0,0,0,1) 110px)";

/** Paisagem da mata (ilustração) que preenche o contêiner posicionado. */
export function MataLandscape() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ilustração decorativa
    <img
      src="/images/marca/paisagem-mata.svg"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 block size-full"
      style={{ maskImage: landscapeMask, WebkitMaskImage: landscapeMask }}
    />
  );
}

function Wordmark({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={cn("font-display font-extrabold tracking-[-0.02em]", className)}
      style={{ fontSize: `${size / 16}rem` }}
    >
      guará
    </span>
  );
}

/** Painel lateral do desktop: marca, promessa e garantias, com a mata ao pé. */
function OnboardingAside() {
  return (
    <aside className="relative hidden h-dvh w-[35rem] shrink-0 flex-col justify-between overflow-hidden bg-shade p-14 text-sand lg:flex">
      <div className="flex items-center gap-3">
        <BrandLogo size={64} />
        <Wordmark size={34} />
      </div>
      <div className="relative flex flex-col gap-7">
        <p className="m-0 font-display text-40 leading-[1.2] font-extrabold tracking-[-0.01em]">
          Seu dinheiro organizado em um só lugar.
        </p>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {onboardingHighlights.map((item) => (
            <li key={item.icon} className="flex items-start gap-3 text-15 leading-normal text-mist">
              <span className="mt-0.5 text-sand">
                <Icon name={item.icon} />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[20.625rem]">
        <MataLandscape />
      </div>
      <span className="relative self-start rounded-full bg-[rgba(11,17,14,0.78)] px-3 py-1.5 text-13 text-sand">
        Conexão bancária via Pluggy · Cotações via Brapi
      </span>
    </aside>
  );
}

/** Faixa da mata no topo (tablet: logo centralizado; mobile da boas-vindas: logo à esquerda). */
export function MataBanner({ variant }: { variant: "tablet" | "mobile" }) {
  const tablet = variant === "tablet";
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-mata",
        tablet ? "hidden h-[13.125rem] md:block lg:hidden" : "mb-4 h-[11.25rem] md:hidden",
      )}
    >
      <MataLandscape />
      <div
        className={cn(
          "relative flex",
          tablet ? "justify-center pt-10" : "items-center gap-2.5 px-4 py-7",
        )}
      >
        <div className="flex items-center gap-2.5">
          <BrandLogo size={54} />
          <Wordmark size={30} className="text-white" />
        </div>
      </div>
    </div>
  );
}

type OnboardingShellProps = {
  /** Topo do mobile (cabeçalho com voltar ou a faixa da mata). */
  mobileTop: ReactNode;
  /** Barra fixa de ações no mobile. */
  mobileActions?: ReactNode;
  /** Centraliza o conteúdo na vertical no desktop (boas-vindas). */
  centered?: boolean;
  /** Espaço entre blocos no mobile (22px por padrão). */
  className?: string;
  children: ReactNode;
};

/**
 * Molde das telas de entrada, sem o app shell. Desktop: painel lateral e formulário à direita.
 * Tablet: faixa da mata e um card de 600px sobreposto. Mobile: tela cheia com ações fixas no rodapé.
 */
export function OnboardingShell({
  mobileTop,
  mobileActions,
  centered,
  className,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-dvh lg:flex lg:h-dvh">
      <OnboardingAside />
      <MataBanner variant="tablet" />
      {mobileTop}
      <div className="lg:flex lg:grow lg:justify-center lg:overflow-y-auto lg:px-20 lg:py-16">
        <main
          className={cn(
            "flex flex-col gap-5.5 px-4 pt-2 pb-35",
            "md:relative md:mx-auto md:-mt-[4.375rem] md:mb-10 md:w-[37.5rem] md:gap-6.5 md:rounded-card md:border md:border-line md:bg-card md:p-10",
            "lg:m-0 lg:w-full lg:max-w-[35rem] lg:gap-7 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0",
            centered && "lg:min-h-full lg:justify-center",
            className,
          )}
        >
          {children}
        </main>
      </div>
      {mobileActions}
    </div>
  );
}

/** Etapas do onboarding (1. Bancos, 2. Perfil, 3. Assistentes). */
export function OnboardingSteps({ current, steps }: { current: number; steps: readonly string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-13 text-mist">
        Etapa {current} de {steps.length}
      </span>
      <ol className="m-0 flex list-none gap-2 p-0">
        {steps.map((step, i) => {
          const n = i + 1;
          return (
            <li
              key={step}
              aria-current={n === current ? "step" : undefined}
              className="flex flex-1 flex-col gap-1.5"
            >
              <span
                aria-hidden="true"
                className={cn("h-1 rounded-[2px]", n <= current ? "bg-sand" : "bg-line")}
              />
              <span
                className={cn(
                  "text-12",
                  n === current
                    ? "font-bold text-sand"
                    : n < current
                      ? "font-medium text-sand"
                      : "font-medium text-caption",
                )}
              >
                {n}. {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Título e texto de apoio de cada etapa. */
export function OnboardingIntro({
  title,
  children,
  titleClassName,
}: {
  title: string;
  children: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h1
        className={cn(
          "m-0 font-display text-26 leading-[1.2] font-extrabold tracking-[-0.01em] md:text-30",
          titleClassName,
        )}
      >
        {title}
      </h1>
      <p className="m-0 text-16 leading-[1.6] text-mist">{children}</p>
    </div>
  );
}

/** Ações no fim do card (tablet e desktop). */
export function OnboardingActions({ children }: { children: ReactNode }) {
  return <div className="hidden gap-2.5 md:flex">{children}</div>;
}
