import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { SignUpForm } from "@/features/acesso/components/signup-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function CriarContaPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/boas-vindas" />
      <AuthIntro title="Criar sua conta">
        Seus dados e a senha de acesso. Vamos confirmar o e-mail com um código de 6 dígitos.
      </AuthIntro>
      <SignUpForm />
    </OnboardingShell>
  );
}
