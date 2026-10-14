import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { LoginForm, type LoginState } from "@/features/acesso/components/login-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

const states: LoginState[] = ["pronto", "sem-conta", "sem-internet"];

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const initialState = states.find((s) => s === estado) ?? "pronto";
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/boas-vindas" />
      <AuthIntro title="Entrar no Guará">
        Use a mesma forma de entrada de quando criou a conta.
      </AuthIntro>
      <LoginForm key={initialState} initialState={initialState} />
    </OnboardingShell>
  );
}
