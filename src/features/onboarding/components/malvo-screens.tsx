import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileActionBar } from "@/components/ui/form";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { banks, onboardingSteps } from "../data";
import { OnboardingShell, OnboardingSteps } from "./onboarding-shell";

/** Banco da rota (/onboarding/bancos/itau) ou 404. */
export function bankFromSlug(slug: string) {
  const bank = banks.find((b) => b.id === slug);
  if (!bank) notFound();
  return bank;
}

/**
 * Molde das telas de conexão com o banco pelo Malvo: barra "Conectar banco" no celular,
 * etapas no tablet e no desktop e ações no rodapé (fixas no celular).
 */
export function MalvoShell({
  desktopWidth,
  className,
  mobileActions,
  children,
}: {
  desktopWidth: string;
  className?: string;
  mobileActions: ReactNode;
  children: ReactNode;
}) {
  return (
    <OnboardingShell
      zoom={1.6}
      desktopWidth={desktopWidth}
      tabletWidth="md:w-[38.75rem]"
      className={cn("pb-30", className)}
      mobileTop={<MobileHeader title="Conectar banco" close="/onboarding/bancos" balanced />}
      mobileActions={<MobileActionBar>{mobileActions}</MobileActionBar>}
    >
      <div className="hidden md:block">
        <OnboardingSteps current={1} steps={onboardingSteps} />
      </div>
      {children}
    </OnboardingShell>
  );
}

/** Ícone grande redondo do resultado (sucesso ou erro). */
export function ResultIcon({ tone, icon }: { tone: "folha" | "urucum"; icon: IconName }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-18 items-center justify-center rounded-full",
        tone === "folha" ? "bg-folha-bg text-folha" : "bg-urucum-bg text-urucum",
      )}
    >
      <Icon
        name={icon}
        size={tone === "folha" ? 36 : 34}
        strokeWidth={tone === "folha" ? 2.4 : 2}
      />
    </span>
  );
}

/** Aviso em bloco com ícone, nos tons dos fundos de status. */
export function StatusNote({
  tone,
  icon,
  children,
}: {
  tone: "arara" | "tucano" | "neutral";
  icon: IconName;
  children: ReactNode;
}) {
  const tones = {
    arara: ["bg-arara-bg", "text-arara"],
    tucano: ["bg-tucano-bg", "text-tucano"],
    neutral: ["bg-shade", "text-mist"],
  } as const;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[0.875rem] px-3.5 py-3 text-13 leading-normal text-sand",
        tones[tone][0],
      )}
    >
      <span className={cn("mt-px", tones[tone][1])}>
        <Icon name={icon} size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}

export const supportLinkClass =
  "inline-flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline hover:text-tucano";

export function SupportLink() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Link href="/conversas" className={supportLinkClass}>
        Falar com o suporte
        <Icon name="chevron-right" size={16} />
      </Link>
    </div>
  );
}
