"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { useAuthFlow, type SignInHint } from "@/stores/auth-flow";

import { cpfProblem, formatCpf } from "@/lib/cpf";
import { PASSWORD_HINT, PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/password";

import {
  checkEmail,
  passwordAuthCode,
  passwordAuthMessage,
  signUpWithPassword,
  type EmailStatus,
} from "../auth";
import { useSession } from "../session";
import { AuthBackButton, AuthBackLink, AuthIntro, WarningBlock } from "./auth-parts";
import { CpfField, FieldError, PasswordField } from "./fields";
import { SocialButtons } from "./social-buttons";

/** E-mail plausível antes de pedir à API (o servidor tem a palavra final). */
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/** Boas-vindas: criar a conta ou entrar (os dados vêm na tela seguinte), ou Google e Apple. */
export function WelcomeOptions() {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <ButtonLink href="/boas-vindas/criar" variant="primary" size="xl" block>
          <span>Criar conta</span>
        </ButtonLink>
        <ButtonLink href="/entrar" variant="outline" size="xl" block>
          <span>Entrar</span>
        </ButtonLink>
      </div>
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-2.5">
        <SocialButtons prototypeHref="/onboarding/plano" />
      </div>
    </>
  );
}

type SignUpField = "nome" | "email" | "cpf" | "senha" | "confirmacao";

/**
 * Criar conta com e-mail, em duas etapas. Primeiro o e-mail e o CPF: se um deles já tem conta, vai
 * para o "Entrar" com ele preenchido. Depois, com os dois mantidos, o nome e a senha; com login de
 * verdade, o Supabase cria a conta e manda o código de 6 dígitos (tela seguinte). No protótipo,
 * só avança.
 */
export function SignUpForm() {
  const router = useRouter();
  const { live } = useSession();
  const startFlow = useAuthFlow((s) => s.start);
  const setSignInHint = useAuthFlow((s) => s.setSignInHint);
  const [step, setStep] = useState<"identificar" | "dados">("identificar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Partial<Record<SignUpField, string>>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const clear = (field: SignUpField) =>
    setErrors((all) => (all[field] ? { ...all, [field]: undefined } : all));

  const identityErrors = (address: string): Partial<Record<SignUpField, string>> => ({
    email: isValidEmail(address) ? undefined : "Confira o e-mail: falta algo no endereço.",
    cpf: cpfProblem(cpf) ?? undefined,
  });

  /**
   * O e-mail ou o CPF já tem conta: vai para o "Entrar" com ele preenchido (a conta só com Google
   * ou Apple abre na escolha, onde estão os botões deles).
   */
  function goToSignIn(status: EmailStatus, address: string) {
    const hint = signInHintFor(status, address, cpf);
    setSignInHint(hint);
    router.push(hint.social ? "/entrar" : "/entrar/email");
  }

  /** Etapa 1: confere o e-mail e o CPF antes de pedir o resto. */
  async function next(event: FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    const found = identityErrors(address);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setFailure(null);
    if (live) {
      setSending(true);
      try {
        const status = await checkEmail(address, cpf);
        if (status?.exists || status?.cpfRegistered) return goToSignIn(status, address);
      } finally {
        setSending(false);
      }
    }
    setEmail(address);
    setStep("dados");
  }

  /** Etapa 2: cria a conta (confere de novo, caso o e-mail ou o CPF tenha mudado). */
  async function submit(event: FormEvent) {
    event.preventDefault();
    const nome = name.trim();
    const address = email.trim().toLowerCase();
    const found: Partial<Record<SignUpField, string>> = {
      ...identityErrors(address),
      nome: nome ? undefined : "Conte como quer ser chamado.",
      senha: passwordProblem(password) ?? undefined,
      confirmacao: password === confirmation ? undefined : "As senhas não são iguais.",
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    if (!live) return router.push("/boas-vindas/codigo");

    setSending(true);
    setFailure(null);
    try {
      const status = await checkEmail(address, cpf);
      if (status?.exists || status?.cpfRegistered) return goToSignIn(status, address);
      await signUpWithPassword(address, password, nome);
      startFlow(address, nome, cpf);
      router.push("/boas-vindas/codigo");
    } catch (error) {
      const code = passwordAuthCode(error);
      if (code === "senha-fraca") setErrors({ senha: "Essa senha é fraca. Escolha outra." });
      else if (code === "ja-existe")
        goToSignIn(
          { exists: true, providers: ["email"], hasPassword: true, cpfRegistered: false },
          address,
        );
      else setFailure(passwordAuthMessage(code));
    } finally {
      setSending(false);
    }
  }

  const identify = step === "identificar";
  return (
    <>
      {identify ? (
        <AuthBackLink href="/boas-vindas" />
      ) : (
        <AuthBackButton
          onClick={() => {
            setErrors({});
            setStep("identificar");
          }}
        />
      )}
      <AuthIntro title="Criar sua conta">
        {identify
          ? "Comece pelo e-mail e o CPF. Se você já tiver conta, levamos você para entrar nela."
          : "Agora seu nome e a senha de acesso. Vamos confirmar o e-mail com um código de 6 dígitos."}
      </AuthIntro>
      <form className="m-0 flex flex-col gap-3.5" onSubmit={identify ? next : submit} noValidate>
        {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clear("email");
            }}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-erro" : undefined}
            className={errors.email ? "border-urucum" : undefined}
          />
          {errors.email && <FieldError id="email-erro">{errors.email}</FieldError>}
        </Field>
        <CpfField
          id="cpf"
          label="CPF"
          value={cpf}
          onValueChange={(value) => {
            setCpf(value);
            clear("cpf");
          }}
          error={errors.cpf}
          hint="Usado para identificar você. Guardamos criptografado."
        />
        {identify ? (
          <Button type="submit" variant="primary" size="xl" block disabled={sending}>
            <span>{sending ? "Conferindo…" : "Continuar"}</span>
          </Button>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <TextInput
                id="nome"
                autoComplete="name"
                placeholder="Como quer ser chamado"
                value={name}
                maxLength={80}
                autoFocus
                onChange={(event) => {
                  setName(event.target.value);
                  clear("nome");
                }}
                aria-invalid={errors.nome ? true : undefined}
                aria-describedby={errors.nome ? "nome-erro" : undefined}
                className={errors.nome ? "border-urucum" : undefined}
              />
              {errors.nome && <FieldError id="nome-erro">{errors.nome}</FieldError>}
            </Field>
            <PasswordField
              id="senha"
              label="Senha"
              mode="new"
              value={password}
              maxLength={PASSWORD_MAX_LENGTH}
              placeholder="Pelo menos 8 caracteres"
              onChange={(event) => {
                setPassword(event.target.value);
                clear("senha");
              }}
              error={errors.senha}
              hint={PASSWORD_HINT}
            />
            <PasswordField
              id="confirmacao"
              label="Confirmar senha"
              mode="new"
              value={confirmation}
              maxLength={PASSWORD_MAX_LENGTH}
              onChange={(event) => {
                setConfirmation(event.target.value);
                clear("confirmacao");
              }}
              error={errors.confirmacao}
            />
            <Button type="submit" variant="primary" size="xl" block disabled={sending}>
              <span>{sending ? "Criando…" : "Criar conta"}</span>
            </Button>
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Depois de criar, enviamos um código de 6 dígitos para confirmar o seu e-mail.
            </p>
          </>
        )}
      </form>
    </>
  );
}

const PROVIDER_NAMES = { google: "o Google", apple: "a Apple" } as const;

/** O que o "Entrar" mostra para quem tentou criar uma conta que já existe. */
function signInHintFor(status: EmailStatus, email: string, cpf: string): SignInHint {
  if (!status.exists) {
    return {
      identifier: formatCpf(cpf),
      social: false,
      notice:
        "Esse CPF já tem uma conta no Guará. Entre com a senha ou do mesmo jeito que criou a conta.",
    };
  }
  if (status.hasPassword) {
    return {
      identifier: email,
      social: false,
      notice: "Esse e-mail já tem uma conta no Guará. Entre com a senha.",
    };
  }
  const social = status.providers.flatMap((p) => (p === "email" ? [] : [PROVIDER_NAMES[p]]));
  if (social.length > 0) {
    const via = social.join(" e ");
    return {
      identifier: email,
      social: true,
      notice: `Esse e-mail já tem uma conta no Guará, criada com ${via}. Continue com ${via} ou clique em "Esqueci minha senha" para criar uma senha.`,
    };
  }
  // Criada antes da senha existir (só com o código no e-mail).
  return {
    identifier: email,
    social: false,
    notice:
      'Esse e-mail já tem uma conta no Guará, ainda sem senha. Clique em "Esqueci minha senha": enviamos um código para o e-mail e você cria a senha.',
  };
}
