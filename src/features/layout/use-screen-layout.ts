"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import { z } from "zod";

import { useSession } from "@/features/acesso/session";
import { apiRequest } from "@/lib/api";

import {
  type BlockDef,
  LAYOUT_HEIGHTS,
  LAYOUT_SIZES,
  LAYOUT_VERSION,
  type LayoutBlock,
  type LayoutScreen,
  defaultLayout,
  isDefaultLayout,
  mergeLayout,
  toStored,
} from "./model";

const BlockSchema = z.object({
  id: z.string(),
  size: z.enum(LAYOUT_SIZES),
  hidden: z.boolean(),
  compact: z.boolean(),
  // Opcionais: layouts salvos antes da altura e da largura livre.
  height: z.enum(LAYOUT_HEIGHTS).optional(),
  columns: z.number().int().optional(),
  minHeight: z.number().int().optional(),
});

/** Bloco como é guardado (local e API). */
type StoredBlock = z.infer<typeof BlockSchema>;

const LayoutSchema = z.object({
  version: z.number().int().nullable(),
  blocks: z.array(BlockSchema).nullable(),
});

/** Cópia local: vale quando não há conta ou internet. `pending` = falta enviar para a API. */
const LocalSchema = z.object({
  version: z.number().int(),
  blocks: z.array(BlockSchema),
  pending: z.boolean().optional(),
});
type Local = z.infer<typeof LocalSchema>;

const storageKey = (screen: LayoutScreen) => `guara:layout:${screen}`;

/** Quem lê a cópia local é avisado quando ela muda (nesta aba ou em outra). */
const subscribers = new Set<() => void>();
function subscribe(callback: () => void) {
  subscribers.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    subscribers.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(screen: LayoutScreen): string | null {
  try {
    return window.localStorage.getItem(storageKey(screen));
  } catch {
    return null;
  }
}

function parseLocal(raw: string | null): Local | null {
  if (!raw) return null;
  try {
    const parsed = LocalSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeLocal(screen: LayoutScreen, value: Local) {
  try {
    window.localStorage.setItem(storageKey(screen), JSON.stringify(value));
  } catch {
    // Sem armazenamento (aba anônima, cota): o layout vale até recarregar.
  }
  for (const notify of subscribers) notify();
}

export const layoutKeys = { screen: (screen: LayoutScreen) => ["layout", screen] as const };

/**
 * Layout de uma tela: o salvo na conta (API) ou, sem conta ou sem internet, a cópia do navegador.
 * No modo de edição as mudanças ficam num rascunho; "Concluir" grava (local na hora, API em
 * seguida; se a API falhar, envia na próxima vez que a tela abrir). O conteúdo dos blocos não
 * passa por aqui: só a disposição.
 */
export function useScreenLayout(screen: LayoutScreen, defs: readonly BlockDef[]) {
  const { live } = useSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<LayoutBlock[] | null>(null);
  // `localStorage` só existe no navegador: no build (e na hidratação) vale o padrão.
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(screen),
    () => null,
  );
  const local = parseLocal(raw);

  const remote = useQuery({
    queryKey: layoutKeys.screen(screen),
    queryFn: ({ signal }) => apiRequest(`/v1/me/layouts/${screen}`, LayoutSchema, { signal }),
    enabled: live,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const save = useMutation({
    mutationFn: (blocks: StoredBlock[]) =>
      apiRequest(`/v1/me/layouts/${screen}`, LayoutSchema, {
        method: "PUT",
        body: { version: LAYOUT_VERSION, blocks },
      }),
    onSuccess: (saved, blocks) => {
      queryClient.setQueryData(layoutKeys.screen(screen), saved);
      writeLocal(screen, { version: LAYOUT_VERSION, blocks });
    },
  });

  // Ficou algo sem enviar (estava sem internet): envia agora, uma vez por cópia pendente.
  const { mutate, isPending: sending } = save;
  const pendingBlocks = local?.pending ? raw : null;
  useEffect(() => {
    if (!live || !pendingBlocks || sending) return;
    const pending = parseLocal(pendingBlocks);
    if (pending) mutate(pending.blocks);
    // `sending` fora das dependências: reenviar só quando a cópia pendente mudar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, pendingBlocks, mutate]);

  const saved = local?.pending
    ? local.blocks
    : live && remote.data
      ? remote.data.blocks
      : (local?.blocks ?? null);
  const layout = mergeLayout(defs, saved);
  const current = draft ?? layout;

  return {
    /** Blocos na ordem, com tamanho e visibilidade (o rascunho durante a edição). */
    blocks: current,
    editing: draft !== null,
    /** A conta ainda não respondeu: a tela usa o layout local ou o padrão até lá. */
    loading: live && remote.isPending && !local,
    isDefault: isDefaultLayout(defs, current),
    startEditing: () => setDraft(layout),
    change: (next: LayoutBlock[]) => setDraft(next),
    restoreDefault: () => setDraft(defaultLayout(defs)),
    /** Salva o rascunho e sai da edição. */
    finish: () => {
      if (!draft) return;
      writeLocal(screen, {
        version: LAYOUT_VERSION,
        blocks: toStored(defs, draft),
        pending: live,
      });
      setDraft(null);
    },
  };
}

export type ScreenLayout = ReturnType<typeof useScreenLayout>;
