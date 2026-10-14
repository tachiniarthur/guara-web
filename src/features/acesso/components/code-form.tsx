"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { account } from "@/features/perfil/data";
import { cn } from "@/lib/utils";

import { disabledButtonClass, WarningBlock } from "./auth-parts";

export type CodeState = "digitando" | "erro" | "vencido";

const RESEND_SECONDS = 45;
/** Código de exemplo aceito enquanto não há API. */
const DEMO_CODE = "482917";

/**
 * Código de 6 dígitos (entrar ou criar conta): 6 caixas com teclado numérico, reenvio depois de
 * 45 segundos, código incorreto (restam N tentativas) e código vencido.
 */
export function CodeForm({
  mode,
  initialState = "digitando",
}: {
  mode: "entrar" | "criar";
  initialState?: CodeState;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(
    initialState === "digitando" ? ["4", "8", "2", "", "", ""] : ["4", "8", "2", "9", "1", "7"],
  );
  const [state, setState] = useState<CodeState>(initialState);
  const [tries, setTries] = useState(4);
  const [seconds, setSeconds] = useState(initialState === "erro" ? 21 : RESEND_SECONDS);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (state === "vencido" || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, state]);

  const expired = state === "vencido";
  const error = state === "erro";
  const complete = digits.every(Boolean);
  const firstEmpty = digits.findIndex((d) => !d);

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((d, i) => (i === index ? digit : d)));
    if (error) setState("digitando");
    if (digit) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index]) refs.current[index - 1]?.focus();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function submit() {
    if (!complete) {
      refs.current[firstEmpty]?.focus();
      return;
    }
    if (digits.join("") === DEMO_CODE) {
      router.push(mode === "criar" ? "/onboarding/bancos" : "/");
      return;
    }
    setState("erro");
    setTries((t) => Math.max(0, t - 1));
  }

  function resend() {
    setDigits(["", "", "", "", "", ""]);
    setState("digitando");
    setSeconds(RESEND_SECONDS);
    refs.current[0]?.focus();
  }

  const changeEmail = mode === "criar" ? "/boas-vindas" : "/entrar";
  const minutes = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <>
      <div className="flex items-center gap-2.5 rounded-tile bg-shade px-3.5 py-3">
        <Icon name="mail" size={18} className="text-mist" />
        <span className="min-w-0 grow text-14 text-mist">
          Enviado para <strong className="text-sand">{account.email}</strong>
        </span>
        <Link
          href={changeEmail}
          className="text-14 font-bold whitespace-nowrap text-sand underline"
        >
          Trocar e-mail
        </Link>
      </div>
      <fieldset className="m-0 border-none p-0">
        <legend className="sr-only">Código de 6 dígitos</legend>
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Dígito ${i + 1} de 6`}
              value={digit}
              disabled={expired}
              aria-invalid={error || undefined}
              onChange={(event) => setDigit(i, event.target.value)}
              onKeyDown={(event) => onKeyDown(i, event)}
              onPaste={onPaste}
              className={cn(
                "h-[3.6875rem] w-[2.9375rem] rounded-[0.875rem] bg-field p-0 text-center font-display text-26 font-bold md:h-[4.1875rem] md:w-[3.6875rem]",
                expired
                  ? "border-[1.5px] border-line text-caption"
                  : error
                    ? "border-[1.5px] border-urucum text-sand"
                    : i === firstEmpty
                      ? "border-2 border-tucano text-sand"
                      : "border-[1.5px] border-line-strong text-sand",
              )}
            />
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="m-0 flex gap-2 text-14 leading-normal text-urucum">
          <Icon name="alert-triangle" size={18} />
          <span>
            Código incorreto. Confira os números e tente de novo. Restam {tries} tentativas.
          </span>
        </p>
      )}
      {expired ? (
        <>
          <WarningBlock icon="clock">
            <strong>Este código venceu.</strong> Os códigos valem por 10 minutos. Peça um novo; o
            anterior deixa de funcionar.
          </WarningBlock>
          <Button variant="primary" size="xl" block className="text-16" onClick={resend}>
            <Icon name="retry" size={18} />
            <span>Enviar novo código</span>
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-14 text-mist">
            <span>
              {seconds > 0 ? (
                <>
                  Reenviar código em <strong className="text-sand">{minutes}</strong>
                </>
              ) : (
                "Não chegou? Peça outro código."
              )}
            </span>
            <button
              type="button"
              disabled={seconds > 0}
              onClick={resend}
              className="h-10 rounded-full border border-line bg-transparent px-3.5 text-14 font-bold text-sand disabled:text-caption"
            >
              Reenviar
            </button>
          </div>
          {error ? (
            <button type="button" disabled className={disabledButtonClass}>
              {mode === "criar" ? "Criar conta" : "Entrar"}
            </button>
          ) : (
            <Button variant="primary" size="xl" block className="text-16" onClick={submit}>
              <span>{mode === "criar" ? "Criar conta" : "Entrar"}</span>
            </Button>
          )}
        </>
      )}
      <p className="m-0 text-13 leading-[1.55] text-caption">
        O Guará só lê seus dados e nunca pede a senha do seu banco.
      </p>
    </>
  );
}
