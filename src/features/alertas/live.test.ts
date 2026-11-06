import { toPriceAlert } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));
const base = {
  id: "a1",
  symbol: "PETR4",
  assetName: "Petrobras PN",
  targetPriceCents: 3_400,
  quotedAt: null,
  triggeredAt: null,
  triggeredPriceCents: null,
  createdAt: "2026-10-01T12:00:00Z",
};

describe("Alertas de preço com os dados da API", () => {
  it("ativo: condição, distância e progresso", () => {
    expect(
      plain(
        toPriceAlert({
          ...base,
          direction: "buy",
          status: "active",
          currentPriceCents: 3_782,
          distancePct: -10.1,
        }),
      ),
    ).toEqual({
      id: "a1",
      ativo: "PETR4",
      direcao: "compra",
      condicao: "Quando cair a R$ 34,00 · agora R$ 37,82",
      progresso: 90,
      faltam: "Faltam 10,1%",
    });
  });

  it("sem cotação agora: não inventa distância", () => {
    const alert = toPriceAlert({
      ...base,
      direction: "sell",
      status: "active",
      currentPriceCents: null,
      distancePct: null,
    });
    expect(plain(alert)).toMatchObject({ faltam: "Sem cotação agora", progresso: 0 });
    expect(plain(alert).condicao).toBe("Quando subir a R$ 34,00 · agora —");
  });
});
