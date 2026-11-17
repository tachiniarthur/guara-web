import { useOnboardingBanks } from "./onboarding-banks";
import { useProfileAnswers } from "./profile-answers";
import { useSavedSimulations } from "./saved-simulations";

/**
 * Stores com dados da conta (simulações salvas, respostas do perfil, bancos do onboarding): ao
 * sair ou trocar de conta, zera a memória (senão a store grava tudo de volta) e apaga a cópia no
 * navegador. `guara-settings` fica: são preferências do aparelho (tamanho do texto, movimento).
 */
export function resetAccountStores() {
  useSavedSimulations.setState({ items: [] });
  useProfileAnswers.setState({ answers: { onboarding: {}, refazer: {} } });
  useOnboardingBanks.setState({ connected: [], justConnected: null });
  useSavedSimulations.persist.clearStorage();
  useProfileAnswers.persist.clearStorage();
  useOnboardingBanks.persist.clearStorage();
}
