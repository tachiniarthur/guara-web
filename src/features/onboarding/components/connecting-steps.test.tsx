import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";
import { useOnboardingBanks } from "@/stores/onboarding-banks";

import { ConnectingSteps } from "./connecting-steps";

const replace = vi.fn();

/** Cada passo agenda o próximo depois de renderizar: avança um de cada vez. */
function finishSteps() {
  for (let step = 0; step < 6; step += 1) act(() => vi.advanceTimersByTime(1200));
}
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

function renderSteps() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <ConnectingSteps bank={{ id: "itau", nome: "Itaú" }} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Conectando um banco no onboarding (protótipo, plano Plus: 4 bancos)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("termina, guarda o banco e volta para a lista quando ainda cabe outro", () => {
    useOnboardingBanks.setState({ connected: ["nubank"], justConnected: null });
    renderSteps();
    expect(screen.getByRole("heading", { name: "Conectando o Itaú…" })).toBeInTheDocument();
    finishSteps();
    expect(screen.getByRole("heading", { name: "Itaú conectado" })).toBeInTheDocument();
    expect(useOnboardingBanks.getState().connected).toEqual(["nubank", "itau"]);
    expect(replace).toHaveBeenCalledWith("/onboarding/bancos");
  });

  it("no limite do plano, segue para o perfil de investidor", () => {
    useOnboardingBanks.setState({
      connected: ["nubank", "bradesco", "inter"],
      justConnected: null,
    });
    renderSteps();
    finishSteps();
    expect(replace).toHaveBeenCalledWith("/onboarding/perfil/1");
  });
});
