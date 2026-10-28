"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { useAuthFlow } from "@/stores/auth-flow";

import {
  authErrorCode,
  checkEmail,
  emailAuthMessage,
  requestEmailCode,
  signInWithProvider,
  type EmailStatus,
} from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";
import { SocialButtons } from "./social-buttons";

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

/**
 * Criar conta com e-mail: nome e e-mail. Com login de verdade, pede o código ao Supabase (a conta
 * nasce quando o código é confirmado); no protótipo, só avança.
 */
export function SignUpForm() {
  const router = useRouter();
  const { live } = useSession();
  const startFlow = useAuthFlow((s) => s.start);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /** O e-mail já tem conta: em vez de mandar código, oferece entrar. */
  const [existing, setExisting] = useState<EmailStatus | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!live) return router.push("/boas-vindas/codigo");
    const nome = name.trim();
    const address = email.trim().toLowerCase();
    setSending(true);
    setFailure(null);
    setExisting(null);
    try {
      const status = await checkEmail(address);
      if (status?.exists) {
        setExisting(status);
        return;
      }
      await requestEmailCode(address, true, nome);
      startFlow(address, nome);
      router.push("/boas-vindas/codigo");
    } catch (error) {
      setFailure(emailAuthMessage(authErrorCode(error)));
    } finally {
      setSending(false);
    }
  }

  async function signInWithCode() {
    const address = email.trim().toLowerCase();
    setSending(true);
    setFailure(null);
    try {
      await requestEmailCode(address, false);
      startFlow(address, null);
      router.push("/entrar/codigo");
    } catch (error) {
      setFailure(emailAuthMessage(authErrorCode(error)));
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit}>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      {existing && (
        <ExistingAccount
          status={existing}
          busy={sending}
          onCode={signInWithCode}
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
          onChange={(event) => setName(event.target.value)}
          required={live}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required={live}
        />
      </Field>
      <Button type="submit" variant="primary" size="xl" block disabled={sending}>
        <span>{sending ? "Enviando…" : "Receber código"}</span>
      </Button>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Enviamos um código de 6 dígitos para o seu e-mail. Não tem senha para lembrar.
      </p>
    </form>
  );
}

const PROVIDER_NAMES = { google: "o Google", apple: "a Apple", email: "o e-mail" } as const;

/**
 * "Criar conta" com um e-mail que já tem conta: avisa e oferece entrar pelos meios dela (Google,
 * Apple ou código no e-mail), ou trocar o e-mail.
 */
function ExistingAccount({
  status,
  busy,
  onCode,
  onOtherEmail,
}: {
  status: EmailStatus;
  busy: boolean;
  onCode: () => void;
  onOtherEmail: () => void;
}) {
  const social = status.providers.filter((p) => p !== "email");
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
          variant={social.length > 0 ? "secondary" : "primary"}
          size="md"
          disabled={busy}
          onClick={onCode}
        >
          <span>{busy ? "Enviando…" : "Entrar com código no e-mail"}</span>
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onOtherEmail}>
          <span>Usar outro e-mail</span>
        </Button>
      </div>
    </div>
  );
}
