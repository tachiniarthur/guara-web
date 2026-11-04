import { render, screen } from "@testing-library/react";

import { InicioScreen } from "@/app/(app)/inicio-screen";

describe("Início", () => {
  it("saúda o usuário e mostra as seções do mês", () => {
    render(<InicioScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Boa tarde, Arthur." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resumo de setembro" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Visão geral" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Seus assistentes" })).not.toBeInTheDocument();
    expect(screen.getByText("Próximas cobranças")).toBeInTheDocument();
  });

  it("mostra os primeiros passos para quem ainda não conectou banco", () => {
    render(<InicioScreen estado="novo" />);
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Primeiros passos" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "Resumo de setembro" })).not.toBeInTheDocument();
  });
});
