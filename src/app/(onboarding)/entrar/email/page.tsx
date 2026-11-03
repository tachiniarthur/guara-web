import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { LoginForm, type LoginState } from "@/features/acesso/components/login-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

const states: LoginState[] = ["pronto", "credenciais", "sem-internet"];

export default async function EntrarComEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const initialState = states.find((s) => s === estado) ?? "pronto";
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/entrar" />
      <AuthIntro title="Entrar com e-mail ou CPF">
        Use o e-mail ou o CPF e a senha da sua conta.
      </AuthIntro>
      <LoginForm key={initialState} initialState={initialState} />
    </OnboardingShell>
  );
}
