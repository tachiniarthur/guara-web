import { fireEvent, render, screen } from "@testing-library/react";

import { useSavedSimulations } from "@/stores/saved-simulations";

import { buildRetirement, RETIREMENT_START } from "../build";
import { SaveSimulationButton } from "./save-simulation";

describe("Simulador · Salvar", () => {
  beforeEach(() => useSavedSimulations.setState({ items: [] }));

  it("guarda a simulação em Simulações salvas e avisa onde ela está", () => {
    render(<SaveSimulationButton simulation={buildRetirement(RETIREMENT_START)} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    const [item] = useSavedSimulations.getState().items;
    expect(item?.tipo).toBe("Aposentadoria");
    expect(item?.nome).toBe("Aposentadoria em 25 anos");
    expect(screen.getByRole("button", { name: "Salva" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Ver salvas" })).toHaveAttribute(
      "href",
      "/simulador/salvas",
    );
  });
});
