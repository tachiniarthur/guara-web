"use client";

import Link from "next/link";

import { Note } from "@/components/ui/note";
import { useSession } from "@/features/acesso/session";

import { useDuplicates } from "../duplicates";

/** Aviso que só aparece quando a API acha cadastro manual igual a uma posição do Open Finance. */
export function DuplicatesNote({ className }: { className?: string }) {
  const { live } = useSession();
  const count = useDuplicates({ enabled: live }).data?.data.length ?? 0;
  if (!count) return null;
  return (
    <Note icon="copy" tone="warning" className={className}>
      {count === 1
        ? "Um cadastro manual parece repetir um investimento do Open Finance; a carteira pode estar contando duas vezes. "
        : `${count} cadastros manuais parecem repetir investimentos do Open Finance; a carteira pode estar contando duas vezes. `}
      <Link href="/investimentos/duplicidade" className="font-bold text-sand">
        Resolver agora
      </Link>
    </Note>
  );
}
