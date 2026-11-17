import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { useSavedSimulations } from "@/stores/saved-simulations";

import { buildRetirement, RETIREMENT_START } from "../build";
import { SaveSimulationButton } from "./save-simulation";

vi.mock("@/features/acesso/session", () => ({ useSession: () => ({ live: false }) }));

describe("Simulador · Salvar", () => {
  beforeEach(() => useSavedSimulations.setState({ items: [] }));

  it("guarda a simulação em Simulações salvas e avisa onde ela está", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SaveSimulationButton simulation={buildRetirement(RETIREMENT_START)} />
      </QueryClientProvider>,
    );
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
