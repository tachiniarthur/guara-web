import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TextSize = "padrao" | "grande" | "maior";
export type NotificationChannel = "celular" | "email";

/** O que se ajusta em Configurações. Só muda ao tocar em "Salvar alterações". */
export type Settings = {
  /** Canais por tipo de aviso ("Tetos de gasto" → celular e e-mail). */
  notifications: Record<string, Record<NotificationChannel, boolean>>;
  textSize: TextSize;
  reduceMotion: boolean;
  /** Abre o app com os valores escondidos ("R$ •••"). */
  hideValuesOnOpen: boolean;
  biometrics: boolean;
};

export const defaultSettings: Settings = {
  notifications: {
    "Tetos de gasto": { celular: true, email: true },
    "Alertas de preço": { celular: true, email: true },
    "Compras fora do padrão": { celular: true, email: true },
  },
  textSize: "padrao",
  reduceMotion: false,
  hideValuesOnOpen: false,
  biometrics: true,
};

/** Escala do texto (e do layout em rem) por tamanho escolhido. */
export const textScale: Record<TextSize, number> = { padrao: 1, grande: 1.1, maior: 1.2 };

type SettingsState = Settings & { save: (settings: Settings) => void };

/**
 * Preferências salvas da conta. Ainda não há API para elas: ficam neste navegador. Quando a API
 * existir, `save` passa a gravar lá (e a leitura vem do `GET`).
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      save: (settings) => set(settings),
    }),
    { name: "guara-settings", storage: createJSONStorage(() => localStorage) },
  ),
);

/** Só os valores (sem as ações), para comparar e editar como rascunho. */
export function pickSettings(state: Settings): Settings {
  const { notifications, textSize, reduceMotion, hideValuesOnOpen, biometrics } = state;
  return { notifications, textSize, reduceMotion, hideValuesOnOpen, biometrics };
}
