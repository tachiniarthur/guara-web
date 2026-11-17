import { create } from "zustand";

/**
 * Mês escolhido em Gastos (`yyyy-MM`), lembrado enquanto o site está aberto: abrir uma categoria e
 * voltar mantém o mês. `null` = o mês atual (acompanha a virada do mês).
 */
interface GastosMonthState {
  month: string | null;
  setMonth: (month: string | null) => void;
}

export const useGastosMonth = create<GastosMonthState>((set) => ({
  month: null,
  setMonth: (month) => set({ month }),
}));
