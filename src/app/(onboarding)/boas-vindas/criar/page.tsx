import { authShell } from "@/features/acesso/components/auth-parts";
import { SignUpForm } from "@/features/acesso/components/signup-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function CriarContaPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <SignUpForm />
    </OnboardingShell>
  );
}
