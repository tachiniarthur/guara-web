"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";

/**
 * Chat com o Lobo Guará (`/v1/chat`): conversas, mensagens, busca e o envio em streaming
 * (`stream.ts`). As chaves ficam em `["chat", ...]`, fora da cópia do cache que vai para o
 * navegador (`lib/query-persist`): o conteúdo das conversas nunca é gravado no aparelho.
 */

export const ChatBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }).loose(),
  z.object({ type: z.literal("tool_call"), name: z.string() }).loose(),
  z.object({ type: z.literal("notice"), text: z.string() }).loose(),
]);
export type ChatBlock = z.infer<typeof ChatBlockSchema>;

export const ChatMessageSchema = z
  .object({
    id: z.string(),
    conversationId: z.string(),
    role: z.enum(["user", "assistant"]),
    // Bloco de um tipo que o site ainda não conhece é deixado de lado (a API só acrescenta tipos).
    blocks: z.array(z.unknown()).transform((items) =>
      items.flatMap((item) => {
        const parsed = ChatBlockSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      }),
    ),
    text: z.string(),
    status: z.string(),
    createdAt: z.string(),
  })
  .loose();
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ConversationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    lastMessageAt: z.string(),
    createdAt: z.string(),
  })
  .loose();
export type Conversation = z.infer<typeof ConversationSchema>;

const page = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), nextCursor: z.string().nullable() }).loose();

const ConversationPageSchema = page(ConversationSchema);
export type ConversationPage = z.infer<typeof ConversationPageSchema>;
const MessagePageSchema = page(ChatMessageSchema);
export type MessagePage = z.infer<typeof MessagePageSchema>;

const SearchResultSchema = z
  .object({
    conversationId: z.string(),
    conversationTitle: z.string(),
    messageId: z.string(),
    snippet: z.string(),
    createdAt: z.string(),
  })
  .loose();
export type ChatSearchResult = z.infer<typeof SearchResultSchema>;
const SearchSchema = z.object({ data: z.array(SearchResultSchema) }).loose();

/** Ids de conversa são UUID: outra coisa no endereço nem chega à API. */
export const isConversationId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const chatKeys = {
  all: ["chat"] as const,
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
  search: (q: string) => ["chat", "search", q] as const,
};

const BASE = "/v1/chat" as const;
const withCursor = (path: string, cursor: string | null) =>
  cursor ? `${path}${path.includes("?") ? "&" : "?"}cursor=${encodeURIComponent(cursor)}` : path;

export const createConversation = () =>
  apiRequest(`${BASE}/conversations`, ConversationSchema, { method: "POST", body: {} });

/** Conversas, da mais recente para a mais antiga (20 por vez). */
export function useConversations({ enabled = true }: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: chatKeys.conversations,
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        withCursor(`${BASE}/conversations`, pageParam) as `/v1/${string}`,
        ConversationPageSchema,
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: chatKeys.conversation(id ?? ""),
    queryFn: ({ signal }) =>
      apiRequest(`${BASE}/conversations/${id}`, ConversationSchema, { signal }),
    enabled: id !== null,
  });
}

/** Mensagens da conversa: cada página vem da mais nova para a mais antiga (50 por vez). */
export function useMessages(id: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(id ?? ""),
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        withCursor(`${BASE}/conversations/${id}/messages?limit=50`, pageParam) as `/v1/${string}`,
        MessagePageSchema,
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: id !== null,
  });
}

/** Mensagens na ordem de leitura (a mais antiga primeiro). */
export const inReadingOrder = (data: InfiniteData<MessagePage> | undefined): ChatMessage[] =>
  (data?.pages.flatMap((p) => p.data) ?? []).slice().reverse();

/** Busca nas conversas (a partir de 2 letras). */
export function useChatSearch(q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: chatKeys.search(query),
    queryFn: ({ signal }) =>
      apiRequest(`${BASE}/search?q=${encodeURIComponent(query)}&limit=20`, SearchSchema, {
        signal,
      }),
    enabled: query.length >= 2,
    select: (result) => result.data,
    staleTime: 30_000,
  });
}

export function useRenameConversation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiRequest(`${BASE}/conversations/${id}`, ConversationSchema, {
        method: "PATCH",
        body: { title },
      }),
    onSuccess: (conversation) => {
      client.setQueryData(chatKeys.conversation(conversation.id), conversation);
      void client.invalidateQueries({ queryKey: chatKeys.conversations });
    },
  });
}

export function useDeleteConversation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`${BASE}/conversations/${id}`, z.undefined(), { method: "DELETE" }),
    onSuccess: (_, id) => {
      client.removeQueries({ queryKey: chatKeys.conversation(id) });
      client.removeQueries({ queryKey: chatKeys.messages(id) });
      void client.invalidateQueries({ queryKey: chatKeys.conversations });
      void client.invalidateQueries({ queryKey: ["chat", "search"] });
    },
  });
}
