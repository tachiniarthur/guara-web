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

/**
 * Criar conta: Google, Apple ou e-mail com código. Com login de verdade, pede o código ao
 * Supabase (a conta nasce quando o código é confirmado); no protótipo, só avança.
 */
export function SignUpForm() {
  const router = useRouter();
  const { live } = useSession();
  const setFlowEmail = useAuthFlow((s) => s.setEmail);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return;
    setSending(true);
    setFailure(null);
    try {
      await requestEmailCode(address, true);
      setFlowEmail(address);
      router.push("/boas-vindas/codigo");
    } catch (error) {
      setFailure(emailAuthMessage(authErrorCode(error)));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      <div className="flex flex-col gap-2.5">
        <SocialButtons prototypeHref="/onboarding/plano" />
      </div>
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px flex-1 bg-line" />
        ou com e-mail
        <span className="h-px flex-1 bg-line" />
      </div>
      <form className="m-0 flex flex-col gap-3.5" onSubmit={live ? submit : undefined}>
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
        {live ? (
          <Button type="submit" variant="primary" size="xl" block disabled={sending}>
            <span>{sending ? "Enviando…" : "Criar conta"}</span>
          </Button>
        ) : (
          <ButtonLink href="/boas-vindas/codigo" variant="primary" size="xl" block>
            <span>Criar conta</span>
          </ButtonLink>
        )}
      </form>
    </>
  );
}
