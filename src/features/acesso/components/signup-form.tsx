"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { useAuthFlow } from "@/stores/auth-flow";

import { isValidCpf } from "@/lib/cpf";
import { PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/password";

import {
  checkEmail,
  passwordAuthCode,
  passwordAuthMessage,
  signInWithProvider,
  signUpWithPassword,
  type EmailStatus,
} from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";
import { CpfField, FieldError, PasswordField } from "./fields";
import { SocialButtons } from "./social-buttons";

/** E-mail plausível antes de pedir à API (o servidor tem a palavra final). */
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/** Boas-vindas: Google, Apple ou criar a conta com e-mail (na tela seguinte, nome e e-mail). */
export function WelcomeOptions() {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <SocialButtons prototypeHref="/onboarding/plano" />
      </div>
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>
      <ButtonLink href="/boas-vindas/criar" variant="primary" size="xl" block>
        <span>Criar conta com e-mail</span>
      </ButtonLink>
    </>
  );
}

type SignUpField = "nome" | "email" | "cpf" | "senha" | "confirmacao";

/**
 * Criar conta com e-mail: nome, e-mail, CPF e senha. Com login de verdade, cria a conta no Supabase
 * com a senha e ele manda o código de 6 dígitos para confirmar o e-mail (tela seguinte); no
 * protótipo, só avança.
 */
export function SignUpForm() {
  const router = useRouter();
  const { live } = useSession();
  const startFlow = useAuthFlow((s) => s.start);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Partial<Record<SignUpField, string>>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /** O e-mail já tem conta: em vez de criar outra, oferece entrar. */
  const [existing, setExisting] = useState<EmailStatus | null>(null);

  const clear = (field: SignUpField) =>
    setErrors((all) => (all[field] ? { ...all, [field]: undefined } : all));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!live) return router.push("/boas-vindas/codigo");
    const nome = name.trim();
    const address = email.trim().toLowerCase();
    const found: Partial<Record<SignUpField, string>> = {
      nome: nome ? undefined : "Conte como quer ser chamado.",
      email: isValidEmail(address) ? undefined : "Confira o e-mail: falta algo no endereço.",
      cpf: isValidCpf(cpf) ? undefined : "Confira o CPF: são 11 números.",
      senha: passwordProblem(password) ?? undefined,
      confirmacao: password === confirmation ? undefined : "As senhas não são iguais.",
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setSending(true);
    setFailure(null);
    setExisting(null);
    try {
      const status = await checkEmail(address, cpf);
      if (status?.exists) {
        setExisting(status);
        return;
      }
      if (status?.cpfRegistered) {
        setErrors({ cpf: "Esse CPF já tem uma conta no Guará. Entre com o CPF e a senha." });
        return;
      }
      await signUpWithPassword(address, password, nome);
      startFlow(address, nome, cpf);
      router.push("/boas-vindas/codigo");
    } catch (error) {
      const code = passwordAuthCode(error);
      if (code === "senha-fraca") setErrors({ senha: "Essa senha é fraca. Escolha outra." });
      else if (code === "ja-existe")
        setExisting({ exists: true, providers: ["email"], cpfRegistered: false });
      else setFailure(passwordAuthMessage(code));
    } finally {
      setSending(false);
    }
  }

  function goToSignIn() {
    startFlow(email.trim().toLowerCase(), null);
    router.push("/entrar");
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit} noValidate>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      {existing && (
        <ExistingAccount
          status={existing}
          onSignIn={goToSignIn}
          onOtherEmail={() => {
            setExisting(null);
            setEmail("");
          }}
        />
      )}
      <Field>
        <FieldLabel htmlFor="nome">Nome</FieldLabel>
        <TextInput
          id="nome"
          autoComplete="name"
          placeholder="Como quer ser chamado"
          value={name}
          maxLength={80}
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
        hint="Misture letras e números."
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
    </form>
  );
}

const PROVIDER_NAMES = { google: "o Google", apple: "a Apple", email: "o e-mail" } as const;

/**
 * "Criar conta" com um e-mail que já tem conta: avisa e oferece entrar pelos meios dela (Google,
 * Apple ou e-mail e senha), ou trocar o e-mail.
 */
function ExistingAccount({
  status,
  onSignIn,
  onOtherEmail,
}: {
  status: EmailStatus;
  onSignIn: () => void;
  onOtherEmail: () => void;
}) {
  const social = status.providers.filter((p) => p !== "email");
  const hasPassword = status.providers.includes("email");
  const via = social.length > 0 ? ` com ${social.map((p) => PROVIDER_NAMES[p]).join(" e ")}` : "";
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-tile border border-tucano/40 bg-tucano-bg px-4 py-3.5 text-14 leading-normal text-sand"
    >
      <p className="m-0">
        <strong>Esse e-mail já tem uma conta no Guará</strong>
        {via ? `, criada${via}` : ""}. Entre nela em vez de criar outra.
      </p>
      <div className="flex flex-wrap gap-2">
        {social.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="primary"
            size="md"
            onClick={() => void signInWithProvider(provider)}
          >
            <span>Continuar com {provider === "google" ? "Google" : "Apple"}</span>
          </Button>
        ))}
        <Button
          type="button"
          variant={social.length > 0 && !hasPassword ? "secondary" : "primary"}
          size="md"
          onClick={onSignIn}
        >
          <span>Entrar com e-mail e senha</span>
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onOtherEmail}>
          <span>Usar outro e-mail</span>
        </Button>
      </div>
    </div>
  );
}
