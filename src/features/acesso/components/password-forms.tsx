"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { PASSWORD_HINT, PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/password";
import { useAuthFlow } from "@/stores/auth-flow";

import {
  authErrorCode,
  emailAuthMessage,
  passwordAuthCode,
  passwordAuthMessage,
  requestEmailCode,
  updatePassword,
} from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";
import { FieldError, PasswordField } from "./fields";

/**
 * "Esqueci minha senha": pede o e-mail e manda o código de 6 dígitos. Confirmá-lo abre a conta e
 * a tela seguinte pede a senha nova. No protótipo, só avança.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const { live } = useSession();
  const savedEmail = useAuthFlow((s) => s.email);
  const startFlow = useAuthFlow((s) => s.start);
  const [email, setEmail] = useState(savedEmail?.includes("@") ? savedEmail : "");
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!live) return router.push("/entrar/codigo");
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) {
      return setError("Confira o e-mail: falta algo no endereço.");
    }
    setError(null);
    setFailure(null);
    setSending(true);
    try {
      await requestEmailCode(address, false);
      startFlow(address, null);
      router.push("/entrar/codigo");
    } catch (failed) {
      const code = authErrorCode(failed);
      if (code === "sem-conta") setError(`Não achamos uma conta com ${address}.`);
      else setFailure(emailAuthMessage(code));
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit} noValidate>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      <Field>
        <FieldLabel htmlFor="esq-email">E-mail</FieldLabel>
        <TextInput
          id="esq-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "esq-email-erro" : undefined}
          className={error ? "border-urucum" : undefined}
        />
        {error && <FieldError id="esq-email-erro">{error}</FieldError>}
      </Field>
      <Button type="submit" variant="primary" size="xl" block disabled={sending}>
        <span>{sending ? "Enviando…" : "Receber código"}</span>
      </Button>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Entrou com Google ou Apple? Use o botão de lá na tela de entrada: essas contas não precisam
        de senha.
      </p>
    </form>
  );
}

/**
 * Senha nova (depois do código do "Esqueci minha senha"): salva e abre o app. Sem o código
 * confirmado, volta para o início.
 */
export function NewPasswordForm() {
  const router = useRouter();
  const { live, refresh } = useSession();
  const pending = useAuthFlow((s) => s.passwordPending);
  const clearFlow = useAuthFlow((s) => s.clear);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<{ senha?: string; confirmacao?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sem o código confirmado (link antigo, outra aba): volta para pedir um.
  useEffect(() => {
    if (live && !pending) router.replace("/entrar");
  }, [live, pending, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = {
      senha: passwordProblem(password) ?? undefined,
      confirmacao: password === confirmation ? undefined : "As senhas não são iguais.",
    };
    setErrors(found);
    if (found.senha || found.confirmacao) return;
    if (!live) return router.push("/");
    setSaving(true);
    setFailure(null);
    try {
      await updatePassword(password);
      clearFlow();
      await refresh();
      router.replace("/");
    } catch (failed) {
      const code = passwordAuthCode(failed);
      if (code === "senha-fraca") setErrors({ senha: "Essa senha é fraca. Escolha outra." });
      else setFailure(passwordAuthMessage(code));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit} noValidate>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      <PasswordField
        id="nova-senha"
        label="Senha nova"
        mode="new"
        value={password}
        maxLength={PASSWORD_MAX_LENGTH}
        placeholder="Pelo menos 8 caracteres"
        onChange={(event) => {
          setPassword(event.target.value);
          setErrors({});
        }}
        error={errors.senha}
        hint={PASSWORD_HINT}
      />
      <PasswordField
        id="nova-confirmacao"
        label="Confirmar senha"
        mode="new"
        value={confirmation}
        maxLength={PASSWORD_MAX_LENGTH}
        onChange={(event) => {
          setConfirmation(event.target.value);
          setErrors({});
        }}
        error={errors.confirmacao}
      />
      <Button type="submit" variant="primary" size="xl" block disabled={saving}>
        <span>{saving ? "Salvando…" : "Salvar e entrar"}</span>
      </Button>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Você continua podendo entrar com Google ou Apple, se usava.
      </p>
    </form>
  );
}
