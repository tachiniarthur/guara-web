import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { OnboardingShell, stepFrame } from "@/features/onboarding/components/onboarding-shell";
import { ProfileResult } from "@/features/onboarding/components/profile-result";

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
      <ProfileResult />
    </OnboardingShell>
  );
}
