"use client";

import { useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { ApiError, apiStream } from "@/lib/api";

import {
  ChatMessageSchema,
  chatKeys,
  createConversation,
  type ChatMessage,
  type MessagePage,
} from "./api";
import { readSse } from "./sse";

/** A conversa nova, antes de a API devolver o id dela. */
export const NEW_CONVERSATION = "nova";

/** A pergunta enviada e a resposta que ainda está chegando (ou o erro que impediu o envio). */
export type PendingTurn = {
  text: string;
  /** "sending": esperando a API aceitar; "streaming": a resposta está chegando. */
  phase: "sending" | "streaming" | "failed";
  reply: string;
  /** Consultas que o Guará está fazendo (ex.: `list_goals`). */
  tools: string[];
  error: ApiError | null;
  /** Id da pergunta já gravada (a lista não a mostra duas vezes se buscar no meio da resposta). */
  savedIds: string[];
};

type StreamState = {
  /** Por conversa (`NEW_CONVERSATION` enquanto a conversa nova é criada). */
  pending: Record<string, PendingTurn>;
};

export const useChatStream = create<StreamState>(() => ({ pending: {} }));

/** Conexões abertas, para o "Parar a resposta" e para sair da conta no meio de uma. */
const controllers = new Map<string, AbortController>();

const patch = (id: string, change: Partial<PendingTurn>) =>
  useChatStream.setState((state) => {
    const current = state.pending[id];
    return current ? { pending: { ...state.pending, [id]: { ...current, ...change } } } : state;
  });

const drop = (id: string) =>
  useChatStream.setState((state) => {
    const { [id]: _, ...rest } = state.pending;
    return { pending: rest };
  });

/** Corta a resposta em andamento (a API grava o que já tinha sido escrito, como interrompida). */
export function stopReply(conversationId: string) {
  controllers.get(conversationId)?.abort();
}

/** Apaga a pergunta que não saiu. */
export const discardFailed = (conversationId: string) => drop(conversationId);

/** Ao sair da conta: corta tudo e esquece as perguntas desta conta. */
export function resetChatStream() {
  for (const controller of controllers.values()) controller.abort();
  controllers.clear();
  useChatStream.setState({ pending: {} });
}

/** Põe a pergunta e a resposta gravadas no começo da lista (a página 0 é a mais nova). */
function prependMessages(client: QueryClient, id: string, messages: ChatMessage[]) {
  client.setQueryData<InfiniteData<MessagePage>>(chatKeys.messages(id), (data) => {
    if (!data) return data;
    const known = new Set(data.pages.flatMap((p) => p.data.map((m) => m.id)));
    const fresh = messages.filter((m) => !known.has(m.id)).reverse();
    const [first, ...rest] = data.pages;
    if (!first) return data;
    return { ...data, pages: [{ ...first, data: [...fresh, ...first.data] }, ...rest] };
  });
}

async function run(client: QueryClient, id: string, text: string) {
  const controller = new AbortController();
  controllers.set(id, controller);
  const saved: ChatMessage[] = [];
  let failure: ApiError | null = null;
  try {
    const body = await apiStream(
      `/v1/chat/conversations/${id}/messages`,
      { content: text },
      controller.signal,
    );
    patch(id, { phase: "streaming" });
    for await (const { event, data } of readSse(body)) {
      const payload = (data ?? {}) as Record<string, unknown>;
      if (event === "delta" && typeof payload.text === "string") {
        const current = useChatStream.getState().pending[id];
        patch(id, { reply: (current?.reply ?? "") + payload.text });
      } else if (event === "tool" && typeof payload.name === "string") {
        const current = useChatStream.getState().pending[id];
        patch(id, { tools: [...(current?.tools ?? []), payload.name] });
      } else if (event === "message" || event === "reply") {
        const message = ChatMessageSchema.safeParse(payload.message);
        if (message.success) {
          saved.push(message.data);
          patch(id, { savedIds: saved.map((m) => m.id) });
        }
      } else if (event === "error") {
        failure = new ApiError(
          "internal",
          typeof payload.message === "string" ? payload.message : undefined,
        );
      }
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    // Parado pela pessoa (ou ao sair da conta): a API grava o que tinha e a lista busca de novo.
    if (!aborted) failure = error instanceof ApiError ? error : new ApiError("network");
  } finally {
    controllers.delete(id);
  }

  prependMessages(client, id, saved);
  // A pergunta não chegou a ser gravada (limite, conflito, sem internet): fica como não enviada.
  if (failure && saved.length === 0) {
    patch(id, { phase: "failed", error: failure });
    return;
  }
  await Promise.all([
    client.invalidateQueries({ queryKey: chatKeys.messages(id) }),
    // A ordem do histórico e o título (a primeira mensagem dá nome à conversa).
    client.invalidateQueries({ queryKey: chatKeys.conversations }),
    client.invalidateQueries({ queryKey: chatKeys.conversation(id) }),
  ]);
  drop(id);
}

/**
 * Manda a pergunta e acompanha a resposta. Sem conversa (`null`), cria uma antes e avisa o id em
 * `onCreated` (o painel ou a página passam a mostrar ela). Uma pergunta por vez por conversa: com
 * outra em andamento, não faz nada.
 */
export function useChatSend() {
  const client = useQueryClient();
  return async (
    conversationId: string | null,
    raw: string,
    { onCreated }: { onCreated?: (id: string) => void } = {},
  ) => {
    const text = raw.trim();
    if (!text) return;
    const key = conversationId ?? NEW_CONVERSATION;
    const current = useChatStream.getState().pending[key];
    if (current && current.phase !== "failed") return;
    const turn: PendingTurn = {
      text,
      phase: "sending",
      reply: "",
      tools: [],
      error: null,
      savedIds: [],
    };
    useChatStream.setState((state) => ({ pending: { ...state.pending, [key]: turn } }));

    let id = conversationId;
    if (id === null) {
      try {
        const created = await createConversation();
        id = created.id;
      } catch (error) {
        patch(key, {
          phase: "failed",
          error: error instanceof ApiError ? error : new ApiError("network"),
        });
        return;
      }
      // A pergunta passa para a conversa criada.
      useChatStream.setState((state) => {
        const { [NEW_CONVERSATION]: moving, ...rest } = state.pending;
        return { pending: moving ? { ...rest, [id!]: moving } : rest };
      });
      void client.invalidateQueries({ queryKey: chatKeys.conversations });
      onCreated?.(id);
    }
    await run(client, id, text);
  };
}
