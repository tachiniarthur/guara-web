import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cacheOwner,
  clearPersistedQueries,
  persistQueries,
  restorePersistedQueries,
  storedUserId,
} from "./query-persist";

const login = (id: string) =>
  localStorage.setItem("sb-projeto-auth-token", JSON.stringify({ user: { id } }));

describe("cópia do cache no navegador", () => {
  afterEach(() => {
    clearPersistedQueries();
    localStorage.clear();
    vi.useRealTimers();
  });

  it("lê o id de quem entrou na sessão do Supabase", () => {
    expect(storedUserId()).toBeNull();
    login("u1");
    expect(storedUserId()).toBe("u1");
  });

  it("salva só as respostas da API e devolve só para a mesma conta", () => {
    vi.useFakeTimers();
    login("u1");
    const client = new QueryClient();
    const stop = persistQueries(client);
    client.setQueryData(["api", "/v1/goals"], { data: [] });
    client.setQueryData(["outra", "coisa"], 1);
    vi.advanceTimersByTime(1_100);
    stop();

    const same = new QueryClient();
    expect(restorePersistedQueries(same)).toBe(true);
    expect(same.getQueryData(["api", "/v1/goals"])).toEqual({ data: [] });
    expect(same.getQueryData(["outra", "coisa"])).toBeUndefined();
    // Aparece na hora, mas busca de novo quando a tela usar.
    expect(same.getQueryState(["api", "/v1/goals"])?.isInvalidated).toBe(true);

    login("u2");
    const other = new QueryClient();
    expect(restorePersistedQueries(other)).toBe(false);
    expect(other.getQueryData(["api", "/v1/goals"])).toBeUndefined();
  });

  it("não grava o cache de uma conta em nome de outra que entrou depois", () => {
    vi.useFakeTimers();
    login("u1");
    const client = new QueryClient();
    const stop = persistQueries(client);
    client.setQueryData(["api", "/v1/me"], { displayName: "Marina" });
    vi.advanceTimersByTime(1_100);
    expect(cacheOwner()).toBe("u1");

    // Outra aba troca a sessão do navegador sem sair; o cache em memória ainda é da u1.
    login("u2");
    client.setQueryData(["api", "/v1/goals"], { data: ["da u1"] });
    vi.advanceTimersByTime(1_100);
    // A memória da u1 foi apagada e nada dela ficou gravado.
    expect(client.getQueryData(["api", "/v1/goals"])).toBeUndefined();
    expect(localStorage.getItem("guara:consultas:v1")).toBeNull();
    expect(cacheOwner()).toBe("u2");

    // Mais mudanças depois disso (agora da u2) continuam sem nada da u1.
    client.setQueryData(["api", "/v1/me"], { displayName: "Outra" });
    vi.advanceTimersByTime(1_100);
    stop();
    const restored = new QueryClient();
    expect(restorePersistedQueries(restored)).toBe(true);
    expect(restored.getQueryData(["api", "/v1/me"])).toEqual({ displayName: "Outra" });
    expect(restored.getQueryData(["api", "/v1/goals"])).toBeUndefined();
  });

  it("some ao sair da conta", () => {
    vi.useFakeTimers();
    login("u1");
    const client = new QueryClient();
    const stop = persistQueries(client);
    client.setQueryData(["api", "/v1/me"], { displayName: "Marina" });
    vi.advanceTimersByTime(1_100);
    stop();
    clearPersistedQueries();
    expect(restorePersistedQueries(new QueryClient())).toBe(false);
  });
});
