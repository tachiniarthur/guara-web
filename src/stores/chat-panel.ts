import { create } from "zustand";

type ChatPanelState = {
  /**
   * Painel de conversa aberto. `null` = padrão da tela: começa fechado em todas, inclusive no
   * Início (o painel da direita mostra só o histórico até a pessoa abrir uma conversa).
   */
  open: boolean | null;
  /** O que o painel mostra quando aparece por cima da tela (tablet, mobile e desktop sem painel fixo). */
  view: "chat" | "history";
  /** Conversa aberta (id da API); `null` = conversa nova, ainda sem mensagens. */
  conversationId: string | null;
  /**
   * Histórico fechado pelo X (desktop com painel à direita): a tela ocupa a largura toda e fica
   * só um atalho na borda direita. Qualquer abertura do chat traz o painel de volta.
   */
  historyHidden: boolean;
  /** Texto inicial do campo (ex.: uma pergunta sugerida). */
  draft: string;

  openConversation: (id: string) => void;
  /** Abre a conversa atual (ou a última aberta). */
  openCurrent: () => void;
  newConversation: (draft?: string) => void;
  /** A conversa nova ganhou id (a primeira pergunta saiu): o painel continua nela. */
  conversationCreated: (id: string) => void;
  showHistory: () => void;
  close: () => void;
  /** Fecha o histórico (o X dele): some o painel da direita. */
  hideHistory: () => void;
  /** Traz o histórico de volta à direita (o atalho na borda da tela). */
  restoreHistory: () => void;
  /** Ao sair da conta: nada da conversa anterior fica aberto. */
  reset: () => void;
};

const initial = {
  open: null,
  view: "chat",
  conversationId: null,
  draft: "",
  historyHidden: false,
} as const;

export const useChatPanel = create<ChatPanelState>((set) => ({
  ...initial,

  openConversation: (id) =>
    set({ open: true, view: "chat", conversationId: id, draft: "", historyHidden: false }),
  openCurrent: () => set({ open: true, view: "chat", draft: "", historyHidden: false }),
  newConversation: (draft = "") =>
    set({ open: true, view: "chat", conversationId: null, draft, historyHidden: false }),
  conversationCreated: (id) =>
    set((state) => (state.conversationId === null ? { conversationId: id, draft: "" } : {})),
  showHistory: () => set({ open: true, view: "history", historyHidden: false }),
  close: () => set({ open: false, view: "chat" }),
  hideHistory: () => set({ open: false, view: "chat", historyHidden: true }),
  restoreHistory: () => set({ historyHidden: false }),
  reset: () => set(initial),
}));
