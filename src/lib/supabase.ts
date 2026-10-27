import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cliente do Supabase, usado SÓ para o login (e-mail com código, Google). Todo dado passa pela
 * API. A sessão fica no navegador; só existe no cliente.
 */
export function getSupabase(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e a chave.");
  }
  client ??= createClient(env.supabaseUrl, env.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
  return client;
}
