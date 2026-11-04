"use client";

import { useEffect } from "react";

import { usePrivacy } from "@/stores/privacy";
import { textScale, useSettings } from "@/stores/settings";

/**
 * Aplica as Configurações salvas no app todo: tamanho do texto (escala do `rem`), "Reduzir
 * animações" e "Ocultar valores ao abrir o app" (só na abertura; depois o olho do topo manda).
 */
export function SettingsEffects() {
  const textSize = useSettings((state) => state.textSize);
  const reduceMotion = useSettings((state) => state.reduceMotion);

  useEffect(() => {
    document.documentElement.style.setProperty("--text-scale", String(textScale[textSize]));
  }, [textSize]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduce-motion", reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    const apply = () => {
      if (useSettings.getState().hideValuesOnOpen) usePrivacy.getState().setHidden(true);
    };
    if (useSettings.persist.hasHydrated()) apply();
    else return useSettings.persist.onFinishHydration(apply);
  }, []);

  return null;
}
