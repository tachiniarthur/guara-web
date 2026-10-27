import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";

import { PlanStep } from "./plan-step";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

function renderStep() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <SessionProvider>
        <PlanStep />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Onboarding · Plano (protótipo)", () => {
  it("mostra os três planos lado a lado, com o que cada um inclui, e assina pelo card", () => {
    renderStep();
    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
    for (const name of ["Básico", "Plus", "Pro"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText("Mais popular")).toBeInTheDocument();
    expect(screen.queryByText(/além da Capivara/)).not.toBeInTheDocument();
    // O Básico não exporta: aparece como "não inclui".
    expect(screen.getAllByText("Exportar relatórios").length).toBe(1);
    // Clicar no card escolhe o plano (a borda e o botão em destaque vão para ele).
    expect(screen.getByRole("radio", { name: /Plus/ })).toBeChecked();
    fireEvent.click(screen.getByText("Para acompanhar tudo, sem limites."));
    expect(screen.getByRole("radio", { name: /Pro/ })).toBeChecked();
    // O Private aparece fechado, com cadeado.
    expect(screen.getByRole("heading", { level: 2, name: /Private/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Em breve" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Assinar o Pro" }));
    expect(push).toHaveBeenCalledWith("/onboarding/bancos");
  });
});
