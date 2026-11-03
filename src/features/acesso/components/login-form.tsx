"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { account } from "@/features/perfil/data";
import { cn } from "@/lib/utils";
import { useAuthFlow } from "@/stores/auth-flow";

import { passwordAuthCode, passwordAuthMessage, signInWithPassword } from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";
import { PasswordField } from "./fields";
import { SocialButtons } from "./social-buttons";

/** Campos do "Entrar" no design: borda de 1,5 px e 16 px de recuo (os do cadastro têm 1 px e 14 px). */
const ENTRAR_FIELD = "border-[1.5px]";

export type LoginState = "pronto" | "credenciais" | "sem-internet";

/**
 * "Entrar" (escolha): Google, Apple ou "Entrar com e-mail ou CPF", que abre os campos na tela
 * seguinte. Quem veio do "Criar conta" com uma conta só do Google ou da Apple vê o aviso aqui.
 */
export function SignInOptions() {
  const hint = useAuthFlow((s) => s.signInHint);
  return (
    <>
      {hint?.social && <WarningBlock icon="user">{hint.notice}</WarningBlock>}
      <div className="flex flex-col gap-2.5">
        <SocialButtons />
        <ButtonLink href="/entrar/email" variant="secondary" size="xl" block>
          <Icon name="mail" size={20} />
          <span>Entrar com e-mail ou CPF</span>
        </ButtonLink>
      </div>
      <p className="m-0 text-center text-14 text-mist">
        Ainda não tem conta?{" "}
        <Link href="/boas-vindas/criar" className="font-bold text-sand underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}

/**
 * Entrada com e-mail ou CPF e senha. Com login de verdade, entra pela API; no
 * protótipo, só aceita o e-mail de exemplo. O erro de credencial é sempre o mesmo (não diz se a
 * conta existe).
 */
export function LoginForm({ initialState = "pronto" }: { initialState?: LoginState }) {
  const router = useRouter();
  const { live, refresh } = useSession();
  const savedEmail = useAuthFlow((s) => s.email);
  const startFlow = useAuthFlow((s) => s.start);
  const signInHint = useAuthFlow((s) => s.signInHint);
  const setSignInHint = useAuthFlow((s) => s.setSignInHint);
  // Veio do "Criar conta" com um e-mail ou um CPF que já tem conta.
  const [hint] = useState(signInHint);
  const [state, setState] = useState<LoginState>(initialState);
  const [identifier, setIdentifier] = useState(
    hint
      ? hint.identifier
      : live
        ? (savedEmail ?? "")
        : initialState === "credenciais"
          ? "artur@exemplo.com"
          : account.email,
  );
  const [password, setPassword] = useState("");
  const [missing, setMissing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (signInHint) setSignInHint(null);
  }, [signInHint, setSignInHint]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) return setState("sem-internet");
    if (identifier.trim().length < 3 || password.length === 0) return setMissing(true);
    setMissing(false);
    setFailure(null);
    if (!live) {
      if (identifier.trim().toLowerCase() !== account.email) return setState("credenciais");
      return router.push("/");
    }
    setSigning(true);
    try {
      await signInWithPassword(identifier, password);
      await refresh();
    } catch (error) {
      const code = passwordAuthCode(error);
      if (code === "credenciais") setState("credenciais");
      else if (code === "sem-internet") setState("sem-internet");
      else setFailure(passwordAuthMessage(code));
    } finally {
      setSigning(false);
    }
  }

  function forgot() {
    // Um e-mail digitado aqui vai junto para a tela de recuperação.
    if (identifier.includes("@")) startFlow(identifier.trim().toLowerCase(), null);
    router.push("/entrar/esqueci");
  }

  const wrong = state === "credenciais";
  const error = missing
    ? "Informe seu e-mail ou CPF e a senha."
    : wrong
      ? "E-mail, CPF ou senha incorretos. Confira e tente de novo."
      : null;
  return (
    <>
      {state === "sem-internet" && (
        <WarningBlock icon="wifi-off">
          <strong>Sem internet.</strong> Conecte-se ao Wi-Fi ou aos dados móveis para entrar. O que
          você digitou continua preenchido.
        </WarningBlock>
      )}
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      {hint && <WarningBlock icon="user">{hint.notice}</WarningBlock>}
      <form id="entrar" onSubmit={submit} className="contents" noValidate>
        <Field>
          <FieldLabel htmlFor="ent-identificador">E-mail ou CPF</FieldLabel>
          <TextInput
            id="ent-identificador"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="voce@exemplo.com ou 000.000.000-00"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setMissing(false);
              if (wrong) setState("pronto");
            }}
            aria-invalid={error ? true : undefined}
            className={cn(ENTRAR_FIELD, "px-4", error && "border-urucum")}
          />
        </Field>
        <PasswordField
          id="ent-senha"
          label="Senha"
          className={cn(ENTRAR_FIELD, "pl-4")}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setMissing(false);
            if (wrong) setState("pronto");
          }}
          error={error}
        />
        <Button
          type="submit"
          variant="primary"
          size="xl"
          block
          className="text-16"
          disabled={signing}
        >
          <span>{signing ? "Entrando…" : "Entrar"}</span>
        </Button>
        <p className="m-0 text-center text-14">
          <button
            type="button"
            onClick={forgot}
            className="cursor-pointer border-none bg-transparent p-0 font-bold text-sand underline"
          >
            Esqueci minha senha
          </button>
        </p>
      </form>
      <p className="m-0 text-center text-14 text-mist">
        Ainda não tem conta?{" "}
        <Link href="/boas-vindas/criar" className="font-bold text-sand underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}
