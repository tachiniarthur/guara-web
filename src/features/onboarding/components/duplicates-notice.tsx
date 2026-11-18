"use client";

import Link from "next/link";

import { useSession } from "@/features/acesso/session";
import { useDuplicates } from "@/features/investimentos/duplicates";

import { StatusNote } from "./malvo-screens";

/** Depois de conectar o banco: aviso de investimento repetido, só se a API achar algum. */
export function DuplicatesNotice() {
  const { live } = useSession();
  const pairs = useDuplicates({ enabled: live }).data?.data ?? [];
  const first = pairs[0];
  if (!first) return null;
  return (
    <StatusNote tone="tucano" icon="copy">
      {pairs.length === 1
        ? `${first.openFinance.name} chegou pelo Open Finance e também está no seu cadastro manual. `
        : `${pairs.length} investimentos do Open Finance também estão no seu cadastro manual. `}
      Você escolhe se exclui o manual ou mantém separado.{" "}
      <Link href="/investimentos/duplicidade" className="font-bold text-sand">
        Resolver agora
      </Link>
    </StatusNote>
  );
}
