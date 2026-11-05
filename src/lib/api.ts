import { z } from "zod";

import { env } from "./env";
import { getSupabase } from "./supabase";

export type ApiErrorCode =
  | "bad_request"
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "plan_limit_reached"
  | "subscription_required"
  | "rate_limited"
  | "invalid_credentials"
  | "cpf_already_registered"
  | "cpf_mismatch"
  | "cpf_required"
  | "internal"
  | "unavailable"
  | "network";

/** Códigos da API (`{ error: { code } }`) para os do site. */
const SERVER_CODES: Record<string, ApiErrorCode> = {
  BAD_REQUEST: "bad_request",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation_failed",
  PLAN_LIMIT_REACHED: "plan_limit_reached",
  SUBSCRIPTION_REQUIRED: "subscription_required",
  CONFLICT: "conflict",
  INTERNAL_ERROR: "internal",
  UPSTREAM_UNAVAILABLE: "unavailable",
  AI_USAGE_LIMIT_REACHED: "rate_limited",
  RATE_LIMITED: "rate_limited",
  INVALID_CREDENTIALS: "invalid_credentials",
  CPF_ALREADY_REGISTERED: "cpf_already_registered",
  CPF_MISMATCH: "cpf_mismatch",
  CPF_REQUIRED: "cpf_required",
};

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 402) return "subscription_required";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation_failed";
  if (status === 429) return "rate_limited";
  if (status === 503) return "unavailable";
  return status >= 500 ? "internal" : "bad_request";
}

const DEFAULT_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  network: "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
  unavailable: "O serviço está indisponível no momento. Tente de novo em instantes.",
  internal: "Algo deu errado do nosso lado. Tente de novo em instantes.",
};

/** Toda falha de chamada à API vira `ApiError`; `message` é pt-BR e pode ir para a tela. */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message = DEFAULT_MESSAGES[code] ?? "Não foi possível concluir o pedido.",
    readonly status: number | null = null,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string().min(1),
    details: z.unknown().optional(),
  }),
});

async function errorFrom(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const parsed = ErrorEnvelopeSchema.safeParse(body);
  if (!parsed.success)
    return new ApiError(codeFromStatus(response.status), undefined, response.status);
  const { code, message, details } = parsed.data.error;
  return new ApiError(
    SERVER_CODES[code] ?? codeFromStatus(response.status),
    message,
    response.status,
    details,
  );
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Chama a API do Guará com o token da sessão e valida a resposta com o schema. `path` começa em
 * `/v1/`.
 */
export async function apiRequest<T>(
  path: `/v1/${string}`,
  schema: z.ZodType<T>,
  { method = "GET", body, signal }: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  if (!env.apiUrl) throw new ApiError("unavailable", "A API não está configurada.");
  let response: Response;
  try {
    response = await fetch(`${env.apiUrl.replace(/\/+$/, "")}${path}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(await authHeader()),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    // Tempo esgotado (`AbortSignal.timeout`): a internet está lá, quem não respondeu foi a API.
    if (error instanceof Error && error.name === "TimeoutError") throw new ApiError("unavailable");
    throw new ApiError("network");
  }
  if (!response.ok) throw await errorFrom(response);
  return schema.parse(await response.json());
}
