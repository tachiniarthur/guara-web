"use client";

import { NewBelongingScreen } from "@/features/bens/components/belonging-form";

/** Cadastro de imóvel (`POST /v1/belongings`). */
export default function NovoImovelPage() {
  return <NewBelongingScreen kind="real_estate" />;
}
