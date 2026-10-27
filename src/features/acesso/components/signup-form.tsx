"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { useAuthFlow } from "@/stores/auth-flow";

import { authErrorCode, emailAuthMessage, requestEmailCode } from "../auth";
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!live) return router.push("/boas-vindas/codigo");
    const nome = name.trim();
    const address = email.trim().toLowerCase();
    setSending(true);
    setFailure(null);
    try {
      await requestEmailCode(address, true, nome);
      startFlow(address, nome);
      router.push("/boas-vindas/codigo");
    } catch (error) {
      setFailure(emailAuthMessage(authErrorCode(error)));
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit}>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
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
