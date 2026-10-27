import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

import { getSupabase } from "@/lib/supabase";

/**
 * `sem-conta`: nenhuma conta com o e-mail (só ao entrar). `invalido`: código errado ou vencido.
 * `muitos`: códigos demais em pouco tempo.
 */
export type EmailAuthErrorCode =
  "sem-conta" | "invalido" | "muitos" | "sem-internet" | "indisponivel";

export class EmailAuthError extends Error {
  constructor(readonly code: EmailAuthErrorCode) {
    super(`Falha no login por e-mail: ${code}`);
    this.name = "EmailAuthError";
  }
}

function toEmailAuthError(error: unknown): EmailAuthError {
  // "Sem internet" só quando o navegador está mesmo offline; falha do Supabase (ou do envio do
  // e-mail) é indisponibilidade.
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return new EmailAuthError("sem-internet");
  }
  if (isAuthRetryableFetchError(error)) return new EmailAuthError("indisponivel");
  if (isAuthApiError(error)) {
    if (error.code === "otp_disabled" || error.code === "signup_disabled") {
      return new EmailAuthError("sem-conta");
    }
    if (error.code === "otp_expired") return new EmailAuthError("invalido");
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return new EmailAuthError("muitos");
    }
  }
  return new EmailAuthError("indisponivel");
}

/**
 * Manda o código de 6 dígitos. `criarConta: false` (Entrar) falha com `sem-conta` para e-mail
 * desconhecido; `true` (Criar conta) cria a conta quando o código for confirmado, com o `nome`
 * nos metadados do usuário.
 */
export async function requestEmailCode(
  email: string,
  criarConta: boolean,
  nome?: string,
): Promise<void> {
  try {
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: criarConta, ...(nome ? { data: { name: nome } } : {}) },
    });
    if (error) throw error;
  } catch (error) {
    throw toEmailAuthError(error);
  }
}

/** Confere os 6 dígitos e abre a sessão. */
export async function verifyEmailCode(email: string, token: string): Promise<void> {
  try {
    const { error } = await getSupabase().auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
  } catch (error) {
    throw toEmailAuthError(error);
  }
}

/** Entrar com Google ou Apple: o navegador vai para o provedor e volta para o início do site. */
export async function signInWithProvider(provider: "google" | "apple"): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

/** Mensagem para os erros que não têm tela própria. */
export function emailAuthMessage(code: EmailAuthErrorCode): string {
  if (code === "muitos") return "Muitos códigos em pouco tempo. Espere um minuto e peça outro.";
  if (code === "sem-internet") return "Sem conexão. Confira sua internet e tente de novo.";
  return "Não conseguimos mandar o e-mail com o código agora. Tente de novo em instantes.";
}

export const authErrorCode = (error: unknown): EmailAuthErrorCode =>
  error instanceof EmailAuthError ? error.code : "indisponivel";
