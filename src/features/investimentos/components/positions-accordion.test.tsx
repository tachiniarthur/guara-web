import { fireEvent, render, screen } from "@testing-library/react";

import { EMPTY_INVESTIMENTOS, InvestimentosDataProvider } from "../context";
import type { Position } from "../types";
import { ClassBanner, PositionCards } from "./position-cards";
import { PositionsTable } from "./positions-table";

const position = (id: string, nome: string, classe: string): Position => ({
  id,
  href: `/investimentos/${id}`,
  nome,
  descricao: classe,
  classe,
  instrumento: "Ação",
  risco: "Médio",
  origem: { tipo: "manual", texto: "Cadastro manual", atualizado: "" },
  total: "R$ 1.000,00",
  percentual: "50%",
  rentabilidade: { valor: "1%", alta: true },
});

const data = {
  ...EMPTY_INVESTIMENTOS,
  positionGroups: [
    {
      classe: "Renda fixa",
      total: "R$ 1.000,00",
      percentual: "50%",
      posicoes: [position("a", "Tesouro Selic 2029", "Renda fixa")],
    },
    {
      classe: "Renda variável",
      total: "R$ 1.000,00",
      percentual: "50%",
      posicoes: [position("b", "PETR4", "Renda variável")],
    },
  ],
};

const withData = (ui: React.ReactNode) =>
  render(<InvestimentosDataProvider value={data}>{ui}</InvestimentosDataProvider>);

describe("Posições em accordion por classe", () => {
  it("tabela: a faixa da classe esconde e mostra os ativos dela", () => {
    withData(<PositionsTable />);
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
    withData(<PositionCards columns={1} />);
    const faixa = screen.getByRole("button", { name: /Renda variável/ });
    expect(faixa).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(faixa);
    expect(faixa).toHaveAttribute("aria-expanded", "false");
  });

  it("com erro, a faixa não vira botão (o Tentar de novo não fica dentro de outro botão)", () => {
    const { container } = render(
      <ClassBanner
        classe="Renda fixa"
        total="R$ 22.222,10"
        percentual="46%"
        failed
        expanded
        onToggle={() => {}}
      />,
    );
    expect(screen.queryByRole("button", { name: /Renda fixa/ })).not.toBeInTheDocument();
    expect(container.querySelector("button button")).toBeNull();
  });
});
