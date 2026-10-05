import { create } from "zustand";

import type { ConversationSummary } from "@/features/conversas/data";

export type ChatMessage = { id: string; role: "user" | "agent"; text: string };

type ChatPanelState = {
  /**
   * Painel de conversa aberto. `null` = padrão da tela: no Início o painel começa aberto
   * nas janelas extragrandes; nas demais telas começa fechado (mostra o histórico).
   */
  open: boolean | null;
  /** O que o painel mostra quando aparece por cima da tela (tablet, mobile e desktop sem painel fixo). */
  view: "chat" | "history";
  /** Conversa aberta; `null` = nova conversa, ainda sem mensagens. */
  conversationId: string | null;
  /** Texto inicial do campo (ex.: "@pacu " ao chamar um bicho específico). */
  draft: string;
  /** Mensagens enviadas nesta sessão, por conversa (ainda não há API). */
  messages: Record<string, ChatMessage[]>;
  /** Conversas criadas nesta sessão, da mais nova para a mais antiga. */
  started: ConversationSummary[];

  openConversation: (id: string) => void;
  /** Abre a conversa atual (ou a última aberta). */
  openCurrent: () => void;
  newConversation: (draft?: string) => void;
  showHistory: () => void;
  close: () => void;
  send: (text: string, conversationId?: string | null) => void;
  /** Começa uma conversa nova com esta pergunta e abre o painel nela. */
  ask: (text: string) => void;
};

const PENDING_REPLY =
  "Anotei sua pergunta. Assim que a conexão com a turma estiver ligada, eu chamo o bicho certo para responder por aqui.";

let sequence = 0;
const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(sequence++).toString(36)}`;

const summarize = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const useChatPanel = create<ChatPanelState>((set, get) => ({
  open: null,
  view: "chat",
  conversationId: "gastos-setembro",
  draft: "",
  messages: {},
  started: [],

  openConversation: (id) => set({ open: true, view: "chat", conversationId: id, draft: "" }),
  openCurrent: () => set({ open: true, view: "chat", draft: "" }),
  newConversation: (draft = "") => set({ open: true, view: "chat", conversationId: null, draft }),
  showHistory: () => set({ open: true, view: "history" }),
  close: () => set({ open: false, view: "chat" }),

  send: (raw, target) => {
    const text = raw.trim();
    if (!text) return;
    let id = target === undefined ? get().conversationId : target;
    const started = [...get().started];
    if (id === null) {
      id = nextId("conversa");
      started.unshift({
        id,
        titulo: summarize(text, 36),
        quando: "agora",
        resumo: summarize(text, 60),
      });
    }
    const thread = get().messages[id] ?? [];
    set({
      conversationId: target === undefined ? id : get().conversationId,
      draft: "",
      started,
      messages: {
        ...get().messages,
        [id]: [
          ...thread,
          { id: nextId("msg"), role: "user", text },
          { id: nextId("msg"), role: "agent", text: PENDING_REPLY },
        ],
      },
    });
  },

  ask: (text) => {
    set({ conversationId: null });
    get().send(text);
    set({ open: true, view: "chat" });
  },
}));
