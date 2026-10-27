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
  it("mostra os três planos mensais e avança com o escolhido", () => {
    renderStep();
    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^Plus,/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: /^Pro,/ }));
    expect(screen.getAllByRole("button", { name: "Assinar o Pro" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Assinar o Pro" })[0]!);
    expect(push).toHaveBeenCalledWith("/onboarding/bancos");
  });
});
