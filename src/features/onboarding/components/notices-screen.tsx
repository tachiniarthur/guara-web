"use client";

import { useRouter } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxRow, Legend, MobileActionBar } from "@/components/ui/form";
import { GuaraTip } from "@/components/ui/guara-tip";

import { onboardingSteps } from "../data";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  stepFrame,
  OnboardingSteps,
} from "./onboarding-shell";
import { NotificationPermissionAlert } from "./permission-alert";

/** Onboarding 4 · Avisos: como o Guará avisa (celular e e-mail) e, depois, o painel. */
export function NoticesScreen({ blocked }: { blocked: boolean }) {
  const router = useRouter();
  const finish = () => router.push("/");

  return (
    <OnboardingShell
      {...stepFrame}
      className="lg:gap-5"
      mobileTop={<MobileHeader back="/onboarding/perfil/resultado" />}
      mobileActions={
        <MobileActionBar>
          <Button variant="primary" size="xl" block onClick={finish}>
            <span>Ir para o painel</span>
          </Button>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={4} steps={onboardingSteps} />
      <OnboardingIntro title="Como quer ser avisado?">
        O Guará acompanha seus tetos, alertas de preço e compras fora do padrão, e avisa você assim
        que algo precisar da sua atenção.
      </OnboardingIntro>
      <GuaraTip named>
        Pode me perguntar qualquer coisa sobre o seu dinheiro no chat: gastos, investimentos, metas
        ou simulações.
      </GuaraTip>
      <fieldset className="m-0 flex flex-col border-none p-0">
        <Legend className="mb-1.5 text-16">Canais de aviso</Legend>
        {blocked && <NotificationPermissionAlert />}
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
      <OnboardingActions>
        <ButtonLink href="/onboarding/perfil/resultado" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <Button variant="primary" size="xl" onClick={finish}>
          <span>Ir para o painel</span>
        </Button>
      </OnboardingActions>
    </OnboardingShell>
  );
}
