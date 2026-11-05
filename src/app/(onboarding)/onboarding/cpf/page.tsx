import { authShell } from "@/features/acesso/components/auth-parts";
import { CpfStep } from "@/features/onboarding/components/cpf-step";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function CpfPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <CpfStep />
    </OnboardingShell>
  );
}
