import { render, screen } from "@testing-library/react";

import InicioPage from "@/app/(app)/page";

const props = (searchParams: Record<string, string> = {}) => ({
  params: Promise.resolve({}),
  searchParams: Promise.resolve(searchParams),
});

describe("Início", () => {
  it("saúda o usuário e mostra as seções do mês", async () => {
    render(await InicioPage(props()));
    expect(
      screen.getByRole("heading", { level: 1, name: "Boa tarde, Arthur." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resumo de setembro" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Seus assistentes" })).toBeInTheDocument();
  });

  it("mostra os primeiros passos para quem ainda não conectou banco", async () => {
    render(await InicioPage(props({ estado: "novo" })));
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Primeiros passos" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "Resumo de setembro" })).not.toBeInTheDocument();
  });
});
