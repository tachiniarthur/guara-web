"use client";

import { useSession } from "@/features/acesso/session";

import { PriceAlertFormPage } from "./price-alert-form-page";
import { PriceAlertLiveForm } from "./price-alert-live-form";

/** Novo alerta de preço: com conta de verdade, o formulário que cria pela API; senão, o protótipo. */
export function NewPriceAlertScreen() {
  const { live } = useSession();
  return live ? <PriceAlertLiveForm /> : <PriceAlertFormPage mode="novo" />;
}
