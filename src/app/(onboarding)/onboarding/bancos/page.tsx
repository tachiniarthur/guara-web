import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import {
  BankPicker,
  BankStepContinue,
  BankStepSkip,
} from "@/features/onboarding/components/bank-picker";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  stepFrame,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { AccessPanel } from "@/features/onboarding/components/access-panel";
import { onboardingSteps } from "@/features/onboarding/data";

export default function ConectarBancosPage() {
  return (
    <OnboardingShell
      {...stepFrame}
      mobileTop={<MobileHeader back="/onboarding/plano" />}
      mobileActions={
        <MobileActionBar>
          <BankStepSkip label="Pular" />
          <div className="grow">
            <BankStepContinue className="w-full" />
          </div>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={2} steps={onboardingSteps} />
      <OnboardingIntro title="Conecte seus bancos">
        Pelo Open Finance Brasil. Você autoriza no app do banco e revoga quando quiser.
      </OnboardingIntro>
      <div className="relative">
        <label htmlFor="buscar-banco" className="sr-only">
          Buscar banco
        </label>
        <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
          <Icon name="search" />
        </span>
        <TextInput
          id="buscar-banco"
          type="search"
          placeholder="Buscar banco ou corretora"
          className="pl-11"
        />
      </div>
      <BankPicker />
      <AccessPanel />
      <OnboardingActions>
        <ButtonLink href="/onboarding/plano" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <BankStepSkip label="Pular por agora" />
        <div className="grow" />
        <BankStepContinue />
      </OnboardingActions>
    </OnboardingShell>
  );
}
