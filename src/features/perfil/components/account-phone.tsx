"use client";

import { useState } from "react";

import { PhoneField } from "@/features/acesso/components/fields";
import { useSession } from "@/features/acesso/session";
import { user } from "@/features/usuario/data";
import { formatPhone, phoneProblem } from "@/lib/phone";

import { useMe } from "../api";

/** "+5511987654321" → "(11) 98765-4321". */
const display = (e164: string) => formatPhone(e164.replace(/^\+55/, ""));

/**
 * Celular da conta. Com login de verdade vem da API (`me.phone`; sem celular, "—"); no protótipo,
 * o do usuário de exemplo.
 */
export function AccountPhone() {
  const { live } = useSession();
  const { data, isPending } = useMe({ enabled: live });
  if (!live) return <>{display(user.telefone)}</>;
  if (isPending) return <>…</>;
  return <>{data?.phone ? display(data.phone) : "—"}</>;
}

/**
 * Campo "Celular" de Editar perfil, já com o número da conta. Com login de verdade espera o `me`
 * chegar para preencher.
 */
export function PhoneEditField() {
  const { live } = useSession();
  const { data, isPending } = useMe({ enabled: live });
  if (live && isPending) return null;
  const initial = (live ? data?.phone : user.telefone)?.replace(/^\+55/, "") ?? "";
  return <PhoneInput initial={initial} />;
}

function PhoneInput({ initial }: { initial: string }) {
  const [digits, setDigits] = useState(initial);
  // Só reclama com o número completo (enquanto digita, ainda faltam números).
  const problem = digits.length === 11 ? phoneProblem(digits) : null;
  return (
    <PhoneField
      id="perfil-celular"
      label="Celular"
      value={digits}
      onValueChange={setDigits}
      error={problem}
      hint="Com DDD. Usado para avisos importantes da sua conta."
    />
  );
}
