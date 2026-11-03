import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { SignInOptions } from "@/features/acesso/components/login-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function EntrarPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/boas-vindas" />
      <AuthIntro title="Entrar no Guará">
        Use a mesma forma de entrada de quando criou a conta.
      </AuthIntro>
      <SignInOptions />
    </OnboardingShell>
  );
}
