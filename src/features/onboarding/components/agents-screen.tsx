"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxRow, Legend, MobileActionBar } from "@/components/ui/form";
import { WarningBlock } from "@/features/acesso/components/auth-parts";

import { onboardingSteps } from "../data";
import { AgentsCarousel, useAgentChoice, useFinishOnboarding } from "./agents-step";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  stepFrame,
  OnboardingSteps,
} from "./onboarding-shell";
import { NotificationPermissionAlert } from "./permission-alert";

/** Onboarding 4 · Assistentes e avisos: escolher a equipe (carrossel) e como ser avisado. */
export function AgentsScreen({ blocked }: { blocked: boolean }) {
  const { chosen, setChosen } = useAgentChoice();
  const { finish, busy, error } = useFinishOnboarding(chosen);
  const label = busy ? "Salvando…" : "Ir para o painel";
  const disabled = busy || chosen.length === 0;

  return (
    <OnboardingShell
      {...stepFrame}
      className="lg:gap-5"
      mobileTop={<MobileHeader back="/onboarding/perfil/resultado" />}
      mobileActions={
        <MobileActionBar>
          <Button variant="primary" size="xl" block disabled={disabled} onClick={finish}>
            <span>{label}</span>
          </Button>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={4} steps={onboardingSteps} />
      <OnboardingIntro title="Monte sua equipe">
        Escolha os assistentes de IA que vão cuidar do seu dinheiro. No chat, o assistente certo
        responde; para falar com um específico, digite @.
      </OnboardingIntro>
      <AgentsCarousel chosen={chosen} setChosen={setChosen} />
      {/* Desktop: as duas opções lado a lado, para a tela caber sem rolar. */}
      <fieldset className="m-0 flex flex-col border-none p-0 lg:grid lg:grid-cols-2 lg:gap-x-6">
        <Legend className="mb-1.5 text-16 lg:col-span-2">Como quer ser avisado?</Legend>
        {blocked && (
          <div className="lg:col-span-2">
            <NotificationPermissionAlert />
          </div>
        )}
        <CheckboxRow
          id="aviso-celular"
          label="Notificação no celular"
          description="Tetos, alertas de preço e compras fora do padrão"
          defaultChecked={!blocked}
          disabled={blocked}
        />
        <CheckboxRow
          id="aviso-email"
          label="E-mail"
          description="Os mesmos avisos, na sua caixa de entrada"
          defaultChecked
        />
      </fieldset>
      {error && <WarningBlock icon="alert-triangle">{error.message}</WarningBlock>}
      <OnboardingActions>
        <ButtonLink href="/onboarding/perfil/resultado" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <Button variant="primary" size="xl" disabled={disabled} onClick={finish}>
          <span>{label}</span>
        </Button>
      </OnboardingActions>
    </OnboardingShell>
  );
}
