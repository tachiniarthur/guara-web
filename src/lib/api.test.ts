import { ApiError, apiRequest } from "./api";

vi.mock("./env", () => ({
  env: { apiUrl: "https://api.teste", supabaseUrl: "x", supabaseKey: "y" },
}));
vi.mock("./supabase", () => ({
  getSupabase: () => ({
    auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) },
  }),
}));

const schema = { parse: (value: unknown) => value } as never;

function respond(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

describe("cliente da API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("manda o token e devolve o corpo", async () => {
    respond(200, { ok: true });
    await expect(apiRequest("/v1/me/plan", schema)).resolves.toEqual({ ok: true });
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("https://api.teste/v1/me/plan");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer token" });
  });

  it("traduz o erro da API (plano) e cai no status para código desconhecido", async () => {
    respond(402, { error: { code: "SUBSCRIPTION_REQUIRED", message: "Escolha um plano." } });
    await expect(apiRequest("/v1/budgets", schema)).rejects.toMatchObject({
      code: "subscription_required",
      message: "Escolha um plano.",
      status: 402,
    });
    respond(429, { error: { code: "NOVO", message: "Calma." } });
    await expect(apiRequest("/v1/budgets", schema)).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("sem resposta vira erro de rede", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("offline"))),
    );
    const error = await apiRequest("/v1/me/plan", schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "network" });
  });
});
