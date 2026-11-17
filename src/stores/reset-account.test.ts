import { describe, expect, it } from "vitest";

import type { SavedSimulation } from "@/features/simulador/saved";

import { useOnboardingBanks } from "./onboarding-banks";
import { useProfileAnswers } from "./profile-answers";
import { resetAccountStores } from "./reset-account";
import { useSavedSimulations } from "./saved-simulations";

describe("dados da conta nas stores", () => {
  it("ao sair, somem da memória e do navegador", () => {
    useSavedSimulations.getState().add({ id: "s1", nome: "Aposentadoria" } as SavedSimulation);
    useProfileAnswers.getState().answer("onboarding", 1, 2);
    useOnboardingBanks.getState().connect("itau");
    expect(localStorage.getItem("guara-saved-simulations")).not.toBeNull();

    resetAccountStores();

    expect(useSavedSimulations.getState().items).toEqual([]);
    expect(useProfileAnswers.getState().answers).toEqual({ onboarding: {}, refazer: {} });
    expect(useOnboardingBanks.getState().connected).toEqual([]);
    expect(localStorage.getItem("guara-saved-simulations")).toBeNull();
    expect(sessionStorage.getItem("guara-profile-answers")).toBeNull();
    expect(sessionStorage.getItem("guara-onboarding-banks")).toBeNull();
  });
});
