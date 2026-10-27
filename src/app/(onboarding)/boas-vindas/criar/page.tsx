import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { SignUpForm } from "@/features/acesso/components/signup-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function CriarContaPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/boas-vindas" />
      <AuthIntro title="Criar sua conta">
        Seu nome e o e-mail onde você vai receber o código de acesso.
      </AuthIntro>
      <SignUpForm />
    </OnboardingShell>
  );
}
