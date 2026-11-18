import { OnboardingShell, stepFrame } from "@/features/onboarding/components/onboarding-shell";
import { ProfileResult } from "@/features/onboarding/components/profile-result";
import { ResultHeader } from "@/features/onboarding/components/question-step";

/** Resultado do perfil: o indicado pela API e, ao continuar, o perfil gravado na conta. */
export default function ResultadoPerfilPage() {
  return (
    <OnboardingShell {...stepFrame} className="gap-5" mobileTop={<ResultHeader />}>
      <ProfileResult />
    </OnboardingShell>
  );
}
