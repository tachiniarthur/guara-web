import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

/**
 * Configuração pública (vai no bundle do navegador; nenhuma chave secreta aqui). Lida com
 * `process.env.NEXT_PUBLIC_X` estático para o Next embutir no build.
 */
export const env = z
  .object({
    apiUrl: optionalUrl,
    supabaseUrl: optionalUrl,
    supabaseKey: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .parse({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

/**
 * Com a API e o Supabase configurados, o site usa login e dados de verdade. Sem eles, continua
 * o protótipo navegável, com os dados de exemplo e sem login.
 */
export const isLive = Boolean(env.apiUrl && env.supabaseUrl && env.supabaseKey);
