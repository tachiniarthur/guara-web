"use client";

import { NewBelongingScreen } from "@/features/bens/components/belonging-form";

/** Cadastro de veículo (`POST /v1/belongings`). */
export default function NovoVeiculoPage() {
  return <NewBelongingScreen kind="vehicle" />;
}
