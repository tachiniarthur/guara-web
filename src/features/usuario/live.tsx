"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useSession } from "@/features/acesso/session";
import { useMe, useMyPlan } from "@/features/perfil/api";
import { apiQuery } from "@/lib/api-query";
import { EMPTY_VALUE } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";

import { user as prototypeUser } from "./data";

export type CurrentUser = typeof prototypeUser & { bancosResumo: string };

const AccountsSchema = z.object({
  data: z.array(z.object({ institutionName: z.string() }).loose()),
});
const UnreadSchema = z.object({ count: z.number().int() });

/** "Gabriel Rodrigues" → "GR"; uma palavra só → as duas primeiras letras. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words.at(-1)![0]}`.toUpperCase();
}

function summary(connected: number, limit: number | null) {
  const banks = limit === null ? `${connected}` : `${connected} de ${limit}`;
  return `${banks} ${connected === 1 && limit === null ? "banco conectado" : "bancos conectados"}`;
}

/**
 * Quem está logado: nome (do perfil), e-mail (da sessão), bancos conectados contra o limite do
 * plano e notificações não lidas. No protótipo, o usuário de exemplo.
 */
export function useUser(): CurrentUser {
  const { live } = useSession();
  const me = useMe({ enabled: live });
  const plan = useMyPlan({ enabled: live });
  const email = useQuery({
    queryKey: ["sessao", "email"],
    queryFn: async () => (await getSupabase().auth.getSession()).data.session?.user.email ?? null,
    enabled: live,
    staleTime: Infinity,
  });
  const accounts = useQuery(apiQuery("/v1/accounts", AccountsSchema, { enabled: live }));
  const unread = useQuery(
    apiQuery("/v1/notifications/unread-count", UnreadSchema, { enabled: live, staleTime: 60_000 }),
  );
  if (!live) {
    return {
      ...prototypeUser,
      bancosResumo: summary(prototypeUser.bancosConectados, prototypeUser.bancosDoPlano),
    };
  }
  const full = me.data?.displayName?.trim() ?? "";
  const connected = new Set(accounts.data?.data.map((a) => a.institutionName) ?? []).size;
  const limit = plan.data?.plan?.limits.bankConnections ?? null;
  return {
    nome: full.split(/\s+/)[0] || EMPTY_VALUE,
    nomeCompleto: full || EMPTY_VALUE,
    iniciais: initialsOf(full || email.data || ""),
    email: email.data ?? EMPTY_VALUE,
    telefone: me.data?.phone ?? "",
    bancosConectados: connected,
    bancosDoPlano: limit ?? connected,
    notificacoesNovas: unread.data?.count ?? 0,
    bancosResumo: accounts.data ? summary(connected, limit) : EMPTY_VALUE,
  };
}

/** "Oi, Marina": a saudação com o primeiro nome; sem nome no perfil, só "Oi". */
export function withFirstName(text: string, firstName: string): string {
  return firstName && firstName !== EMPTY_VALUE ? `${text}, ${firstName}` : text;
}

/** Saudação com o primeiro nome de quem está logado (ver `withFirstName`). */
export function UserGreeting({ text }: { text: string }) {
  return <>{withFirstName(text, useUser().nome)}</>;
}

/** Primeiro nome de quem está logado (para páginas renderizadas no servidor). */
export function UserFirstName() {
  return <>{useUser().nome}</>;
}

/** E-mail de quem está logado. */
export function UserEmail() {
  return <>{useUser().email}</>;
}

/** Iniciais de quem está logado. */
export function UserInitialsText() {
  return <>{useUser().iniciais}</>;
}
