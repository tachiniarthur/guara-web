import { dehydrate, hydrate, type QueryClient } from "@tanstack/react-query";

/**
 * Cópia do cache das consultas no navegador: ao abrir o site de novo, as telas aparecem na hora
 * com o que a pessoa viu da última vez e se atualizam por trás (a API de teste leva segundos por
 * resposta e dorme quando fica parada).
 *
 * - Só desta conta: a cópia guarda o id do usuário e é ignorada se outra pessoa entrar.
 * - Some ao sair da conta (`clearPersistedQueries`) e vale por no máximo 3 dias.
 * - Só respostas que deram certo, das chaves da API, do plano e do perfil.
 */

const STORAGE_KEY = "guara:consultas:v1";
const MAX_AGE = 3 * 24 * 60 * 60_000;
const SAVE_DELAY = 1_000;
const PERSISTED_SCOPES = new Set(["api", "plano", "perfil", "usuario"]);

type Saved = { userId: string; savedAt: number; state: ReturnType<typeof dehydrate> };

/**
 * De quem são os dados no cache em memória. A cópia só é gravada em nome dessa pessoa: se outra
 * conta entrar sem sair da primeira (outra aba, sessão trocada), nada é gravado em nome dela.
 */
let owner: string | null = null;

export const cacheOwner = () => owner;
export const setCacheOwner = (userId: string | null) => {
  owner = userId;
};

/** Id de quem está logado, lido da sessão que o Supabase guarda (sem esperar a rede). */
export function storedUserId(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !/^sb-.+-auth-token$/.test(key)) continue;
      const session = JSON.parse(localStorage.getItem(key) ?? "null") as {
        user?: { id?: unknown };
      } | null;
      if (typeof session?.user?.id === "string") return session.user.id;
    }
  } catch {
    // Sem acesso ao armazenamento (aba privada, bloqueio): segue sem a cópia.
  }
  return null;
}

/** Devolve ao cache o que foi salvo para esta conta. `true` se havia algo. */
export function restorePersistedQueries(client: QueryClient): boolean {
  try {
    const userId = storedUserId();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
    if (!saved || !userId || saved.userId !== userId || Date.now() - saved.savedAt > MAX_AGE) {
      if (saved) localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    hydrate(client, saved.state);
    owner = saved.userId;
    // A cópia aparece na hora, mas pode estar velha (salvou e fechou antes de gravar): toda tela
    // que usar uma consulta restaurada busca de novo por trás.
    void client.invalidateQueries({ refetchType: "none" });
    return saved.state.queries.length > 0;
  } catch {
    return false;
  }
}

/** Salva o cache (um segundo depois da última mudança) enquanto houver alguém logado. */
export function persistQueries(client: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const save = () => {
    try {
      const userId = storedUserId();
      if (!userId) return;
      owner ??= userId;
      if (userId !== owner) {
        // A sessão do navegador é de outra conta: o cache em memória não é dela.
        clearPersistedQueries();
        return;
      }
      const state = dehydrate(client, {
        shouldDehydrateQuery: (query) =>
          query.state.status === "success" &&
          PERSISTED_SCOPES.has(String(query.queryKey[0])) &&
          query.state.data !== undefined,
      });
      const saved: Saved = { userId, savedAt: Date.now(), state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Cheio ou bloqueado: o site funciona igual, só sem a cópia.
    }
  };
  const unsubscribe = client.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" && event.type !== "removed") return;
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}

/** Apaga a cópia (ao sair da conta ou trocar de conta). */
export function clearPersistedQueries() {
  owner = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a apagar.
  }
}
