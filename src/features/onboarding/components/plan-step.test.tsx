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
    fireEvent.click(screen.getByRole("button", { name: "Assinar o Pro" }));
    expect(push).toHaveBeenCalledWith("/onboarding/bancos");
  });
});
