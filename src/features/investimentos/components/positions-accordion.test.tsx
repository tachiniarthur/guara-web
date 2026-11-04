import { fireEvent, render, screen } from "@testing-library/react";

import { PositionCards } from "./position-cards";
import { PositionsTable } from "./positions-table";

describe("Posições em accordion por classe", () => {
  it("tabela: a faixa da classe esconde e mostra os ativos dela", () => {
    render(<PositionsTable />);
    const faixa = screen.getByRole("button", { name: /Renda fixa/ });
    expect(faixa).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Tesouro Selic 2029" })).toBeVisible();

    fireEvent.click(faixa);
    expect(faixa).toHaveAttribute("aria-expanded", "false");
    // Recolhida, a linha desliza para fora e sai do foco e do leitor de tela (inert).
    const linhas = () => document.getElementById(faixa.getAttribute("aria-controls")!)!;
    expect(linhas()).toHaveAttribute("inert");
    // As outras classes continuam abertas.
    expect(screen.getByRole("link", { name: "PETR4" }).closest("tbody")).not.toHaveAttribute(
      "inert",
    );

    fireEvent.click(faixa);
    expect(linhas()).not.toHaveAttribute("inert");
    expect(screen.getByRole("link", { name: "Tesouro Selic 2029" })).toBeVisible();
  });

  it("cards: a faixa vira botão com o estado aberto/fechado", () => {
    render(<PositionCards columns={1} />);
    const faixa = screen.getByRole("button", { name: /Renda variável/ });
    expect(faixa).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(faixa);
    expect(faixa).toHaveAttribute("aria-expanded", "false");
  });
});
