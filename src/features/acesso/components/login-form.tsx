"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { account } from "@/features/perfil/data";
import { useAuthFlow } from "@/stores/auth-flow";

import { passwordAuthCode, passwordAuthMessage, signInWithPassword } from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";
import { PasswordField } from "./fields";
import { SocialButtons } from "./social-buttons";

export type LoginState = "pronto" | "credenciais" | "sem-internet";

/**
 * Entrada com e-mail ou CPF e senha (ou Google e Apple). Com login de verdade, entra pela API; no
 * protótipo, só aceita o e-mail de exemplo. O erro de credencial é sempre o mesmo (não diz se a
 * conta existe).
 */
export function LoginForm({ initialState = "pronto" }: { initialState?: LoginState }) {
  const router = useRouter();
  const { live, refresh } = useSession();
  const savedEmail = useAuthFlow((s) => s.email);
  const startFlow = useAuthFlow((s) => s.start);
  const [state, setState] = useState<LoginState>(initialState);
  const [identifier, setIdentifier] = useState(
    live
      ? (savedEmail ?? "")
      : initialState === "credenciais"
        ? "artur@exemplo.com"
        : account.email,
  );
  const [password, setPassword] = useState("");
  const [missing, setMissing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

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
      <SocialButtons />
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px grow bg-line" />
        ou com e-mail ou CPF
        <span className="h-px grow bg-line" />
      </div>
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
            className={error ? "border-urucum" : undefined}
          />
        </Field>
        <PasswordField
          id="ent-senha"
          label="Senha"
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
        <Link href="/boas-vindas" className="font-bold text-sand underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}
