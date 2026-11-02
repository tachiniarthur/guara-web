import { AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { NewPasswordForm } from "@/features/acesso/components/password-forms";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function NovaSenhaPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthIntro title="Crie uma senha nova">
        Pronto, o e-mail foi confirmado. Escolha a senha que vai usar para entrar.
      </AuthIntro>
      <NewPasswordForm />
    </OnboardingShell>
  );
}
