import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { ForgotPasswordForm } from "@/features/acesso/components/password-forms";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

export default function EsqueciSenhaPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/entrar" />
      <AuthIntro title="Esqueci minha senha">
        Digite o e-mail da sua conta. Enviamos um código de 6 dígitos e, depois, você cria uma senha
        nova.
      </AuthIntro>
      <ForgotPasswordForm />
    </OnboardingShell>
  );
}
