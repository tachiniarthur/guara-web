import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { OnboardingShell, stepFrame } from "@/features/onboarding/components/onboarding-shell";
import { RequireEarlierAnswers } from "@/features/onboarding/components/profile-question";
import { ProfileResult } from "@/features/onboarding/components/profile-result";
import { profileQuestions } from "@/features/onboarding/data";

export default function ResultadoPerfilPage() {
  return (
    <OnboardingShell
      {...stepFrame}
      className="gap-5"
      mobileTop={<MobileHeader title="Perfil de investidor" back="/onboarding/perfil/6" balanced />}
      mobileActions={
        <MobileActionBar>
          <ButtonLink href="/onboarding/perfil/1" variant="secondary" size="xl">
            <span>Refazer</span>
          </ButtonLink>
          <ButtonLink href="/onboarding/assistentes" variant="light" size="xl" className="grow">
            <span>Continuar</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <RequireEarlierAnswers before={profileQuestions.length + 1} />
      <ProfileResult />
    </OnboardingShell>
  );
}
