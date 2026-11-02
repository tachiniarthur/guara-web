import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

import { z } from "zod";

import { ApiError, apiRequest } from "@/lib/api";
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

const EmailStatusSchema = z.object({
  exists: z.boolean(),
  providers: z.array(z.enum(["email", "google", "apple"])),
  /** O CPF enviado já tem conta (`false` se nenhum foi enviado). */
  cpfRegistered: z.boolean().default(false),
});
export type EmailStatus = z.infer<typeof EmailStatusSchema>;

/**
 * Se o e-mail (e o CPF, se vier) já tem conta e por quais meios (`POST /v1/auth/email-status`), para "Criar conta"
 * avisar em vez de mandar um código de entrada. `null` se a API não responder a tempo: aí o
 * cadastro segue como antes (não trava quem está criando conta).
 */
export async function checkEmail(email: string, cpf?: string): Promise<EmailStatus | null> {
  try {
    return await apiRequest("/v1/auth/email-status", EmailStatusSchema, {
      method: "POST",
      body: { email, ...(cpf ? { cpf } : {}) },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return null;
  }
}

/** Entrar com Google ou Apple: o navegador vai para o provedor e volta para o início do site. */
export async function signInWithProvider(provider: "google" | "apple"): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
      // Google: mostra sempre a escolha de conta. Sem isso, ele entra direto com a conta já
      // logada no navegador e não deixa trocar (a tela de permissão só aparece na 1ª vez).
      ...(provider === "google" ? { queryParams: { prompt: "select_account" } } : {}),
    },
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

// --- Senha ----------------------------------------------------------------------------------

/**
 * `credenciais`: e-mail, CPF ou senha errados. `codigo-invalido`: código errado ou vencido.
 * `ja-existe`: o e-mail já tem conta. `senha-fraca`: o servidor recusou a senha.
 */
export type PasswordAuthErrorCode =
  | "credenciais"
  | "codigo-invalido"
  | "ja-existe"
  | "senha-fraca"
  | "muitos"
  | "sem-internet"
  | "indisponivel";

export class PasswordAuthError extends Error {
  constructor(readonly code: PasswordAuthErrorCode) {
    super(`Falha no login com senha: ${code}`);
    this.name = "PasswordAuthError";
  }
}

export function toPasswordAuthError(error: unknown): PasswordAuthError {
  if (error instanceof PasswordAuthError) return error;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return new PasswordAuthError("sem-internet");
  }
  if (error instanceof ApiError) {
    if (error.code === "invalid_credentials") return new PasswordAuthError("credenciais");
    if (error.code === "rate_limited") return new PasswordAuthError("muitos");
    if (error.code === "network") return new PasswordAuthError("sem-internet");
    return new PasswordAuthError("indisponivel");
  }
  if (isAuthRetryableFetchError(error)) return new PasswordAuthError("indisponivel");
  if (isAuthApiError(error)) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return new PasswordAuthError("ja-existe");
    }
    if (error.code === "weak_password") return new PasswordAuthError("senha-fraca");
    if (error.code === "otp_expired") return new PasswordAuthError("codigo-invalido");
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return new PasswordAuthError("muitos");
    }
  }
  return new PasswordAuthError("indisponivel");
}

const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int(),
});

/**
 * Entra com e-mail ou CPF (com ou sem máscara) e senha. Vai pela nossa API (`/v1/auth/login`): o
 * Supabase só conhece e-mails, então ela acha o e-mail do CPF, entra e devolve a sessão, que é
 * guardada aqui. O e-mail de um CPF nunca chega ao navegador.
 */
export async function signInWithPassword(identifier: string, password: string): Promise<void> {
  try {
    const session = await apiRequest("/v1/auth/login", LoginResponseSchema, {
      method: "POST",
      body: { identifier: identifier.trim(), password },
      signal: AbortSignal.timeout(20_000),
    });
    const { error } = await getSupabase().auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    if (error) throw error;
  } catch (error) {
    throw toPasswordAuthError(error);
  }
}

/**
 * Cria a conta com e-mail e senha; o Supabase manda o código de 6 dígitos e a conta só abre
 * quando `verifySignUpCode` o confirma. O `nome` vai para os metadados do usuário.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  nome: string,
): Promise<void> {
  try {
    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { name: nome } },
    });
    if (error) throw error;
  } catch (error) {
    throw toPasswordAuthError(error);
  }
}

/** Confere os 6 dígitos do cadastro e abre a sessão. */
export async function verifySignUpCode(email: string, token: string): Promise<void> {
  try {
    const { error } = await getSupabase().auth.verifyOtp({ email, token, type: "signup" });
    if (error) throw error;
  } catch (error) {
    throw toPasswordAuthError(error);
  }
}

/** Manda o código do cadastro de novo. */
export async function resendSignUpCode(email: string): Promise<void> {
  try {
    const { error } = await getSupabase().auth.resend({ type: "signup", email });
    if (error) throw error;
  } catch (error) {
    throw toPasswordAuthError(error);
  }
}

/** Cria ou troca a senha da conta que está logada (também depois do "Esqueci minha senha"). */
export async function updatePassword(password: string): Promise<void> {
  try {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    throw toPasswordAuthError(error);
  }
}

export const passwordAuthCode = (error: unknown): PasswordAuthErrorCode =>
  toPasswordAuthError(error).code;

/** Mensagem para os erros de senha que não têm campo próprio. */
export function passwordAuthMessage(code: PasswordAuthErrorCode): string {
  if (code === "credenciais") return "E-mail, CPF ou senha incorretos. Confira e tente de novo.";
  if (code === "muitos") return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  if (code === "sem-internet") return "Sem conexão. Confira sua internet e tente de novo.";
  return "Não conseguimos concluir agora. Tente de novo em instantes.";
}
