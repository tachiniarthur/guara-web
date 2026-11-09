"use client";

import { useSession } from "@/features/acesso/session";

import { NewInvestmentLiveForm } from "./new-investment-live-form";
import { NewInvestmentPrototype } from "./new-investment-prototype";

/** Adicionar investimento: com conta de verdade, salva pela API; senão, o protótipo. */
export function NewInvestmentScreen() {
  const { live } = useSession();
  return live ? <NewInvestmentLiveForm /> : <NewInvestmentPrototype />;
}
