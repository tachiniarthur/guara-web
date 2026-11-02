import { AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { CpfStep } from "@/features/onboarding/components/cpf-step";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function CpfPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthIntro title="Informe seu CPF">
        Ele identifica você no Guará e vale para entrar na conta depois, junto com a senha.
      </AuthIntro>
      <CpfStep />
    </OnboardingShell>
  );
}
