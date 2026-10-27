"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { account } from "@/features/perfil/data";
import { cn } from "@/lib/utils";
import { useAuthFlow } from "@/stores/auth-flow";

import { authErrorCode, emailAuthMessage, requestEmailCode } from "../auth";
import { useSession } from "../session";
import { disabledButtonClass, WarningBlock } from "./auth-parts";
import { SocialButtons } from "./social-buttons";

export type LoginState = "pronto" | "sem-conta" | "sem-internet";

/**
 * Entrada por e-mail: o código vai para o e-mail; trata e-mail sem conta e falta de internet. Com
 * login de verdade, pede o código ao Supabase; no protótipo, só aceita o e-mail de exemplo.
 */
export function LoginForm({ initialState = "pronto" }: { initialState?: LoginState }) {
  const router = useRouter();
  const { live } = useSession();
  const startFlow = useAuthFlow((s) => s.start);
  const [state, setState] = useState<LoginState>(initialState);
  const [email, setEmail] = useState(
    live ? "" : initialState === "sem-conta" ? "artur@exemplo.com" : account.email,
  );
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  /** Pede o código (Entrar, ou criar a conta com este e-mail) e vai para a tela do código. */
  async function sendCode(criarConta: boolean) {
    const address = email.trim().toLowerCase();
    setSending(true);
    setFailure(null);
    try {
      await requestEmailCode(address, criarConta);
      startFlow(address, null);
      router.push(criarConta ? "/boas-vindas/codigo" : "/entrar/codigo");
    } catch (error) {
      const code = authErrorCode(error);
      if (code === "sem-conta") setState("sem-conta");
      else if (code === "sem-internet") setState("sem-internet");
      else setFailure(emailAuthMessage(code));
    } finally {
      setSending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) return setState("sem-internet");
    if (live) return void sendCode(false);
    if (email.trim().toLowerCase() !== account.email) return setState("sem-conta");
    router.push("/entrar/codigo");
  }

  const noAccount = state === "sem-conta";
  return (
    <>
      {state === "sem-internet" && (
        <WarningBlock icon="wifi-off">
          <strong>Sem internet.</strong> Conecte-se ao Wi-Fi ou aos dados móveis para receber o
          código. Seu e-mail continua preenchido.
        </WarningBlock>
      )}
      {failure && <WarningBlock icon="alert-triangle">{failure}</WarningBlock>}
      <SocialButtons />
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px grow bg-line" />
        ou com e-mail
        <span className="h-px grow bg-line" />
      </div>
      <form id="entrar" onSubmit={submit} className="contents">
        <div className="flex flex-col gap-2">
          <label htmlFor="ent-email" className="text-14 font-bold">
            E-mail
          </label>
          <input
            id="ent-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (noAccount) setState("pronto");
            }}
            aria-invalid={noAccount || undefined}
            aria-describedby={noAccount ? "ent-email-err" : undefined}
            className={cn(
              "h-13 w-full rounded-full border-[1.5px] bg-field px-4 text-16 text-sand",
              noAccount ? "border-urucum" : "border-line-strong",
            )}
          />
          {noAccount && (
            <span
              id="ent-email-err"
              className="flex items-start gap-1.5 text-13 leading-[1.45] text-urucum"
            >
              <Icon name="alert-triangle" size={16} />
              <span>Não achamos uma conta com {email}. Confira se o e-mail está certo.</span>
            </span>
          )}
        </div>
        {noAccount ? (
          <section className="flex flex-col gap-2.5 rounded-card border border-line bg-card p-4">
            <strong className="text-15">Quer criar uma conta com este e-mail?</strong>
            <p className="m-0 text-14 leading-[1.55] text-mist">
              Leva menos de um minuto. Depois você conecta seus bancos pelo Open Finance, se quiser.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {live ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={sending}
                  onClick={() => void sendCode(true)}
                >
                  <span>Criar conta com este e-mail</span>
                </Button>
              ) : (
                <ButtonLink href="/boas-vindas/codigo" variant="primary" size="md">
                  <span>Criar conta com este e-mail</span>
                </ButtonLink>
              )}
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setEmail("");
                  setState("pronto");
                }}
              >
                <span>Usar outro e-mail</span>
              </Button>
            </div>
          </section>
        ) : (
          <>
            {state === "sem-internet" ? (
              <button type="button" disabled className={disabledButtonClass}>
                Receber código
              </button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="xl"
                block
                className="text-16"
                disabled={sending}
              >
                <span>{sending ? "Enviando…" : "Receber código"}</span>
              </Button>
            )}
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Enviamos um código de 6 dígitos para o seu e-mail. Não tem senha para lembrar.
            </p>
          </>
        )}
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
