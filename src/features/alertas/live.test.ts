import { toPriceAlert, toPriceAlertDetail } from "./live";

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

  it("ativo dos EUA: alvo e preço em dólar", () => {
    const usd = {
      ...base,
      symbol: "AAPL",
      micCode: "XNAS",
      currency: "USD",
      assetName: "Apple Inc.",
      targetPriceCents: 30_000,
      direction: "buy" as const,
      status: "active" as const,
      currentPriceCents: 35_079,
      distancePct: -14.48,
    };
    expect(plain(toPriceAlert(usd)).condicao).toBe("Quando cair a US$ 300,00 · agora US$ 350,79");
    const detail = plain(toPriceAlertDetail(usd, null, new Date("2026-11-09T15:00:00Z")));
    expect(detail).toMatchObject({
      alvo: "US$ 300,00",
      agora: "US$ 350,79",
      distanciaValor: "US$ 50,79",
      precos: [350.79],
    });
  });
});
