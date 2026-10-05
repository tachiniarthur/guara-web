import { render, screen } from "@testing-library/react";

import InicioPage from "@/app/(app)/page";

describe("Início", () => {
  it("saúda o usuário e mostra as seções do mês", () => {
    render(<InicioPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Boa tarde, Arthur." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resumo de setembro" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Seus assistentes" })).toBeInTheDocument();
  });
});
