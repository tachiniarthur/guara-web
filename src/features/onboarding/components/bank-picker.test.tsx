import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";
import { useOnboardingBanks } from "@/stores/onboarding-banks";

import { BankPicker, BankStepContinue } from "./bank-picker";

function renderStep() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <BankPicker />
        <BankStepContinue />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Onboarding · bancos (protótipo, plano Plus: 4 bancos)", () => {
  it("acima do limite, pede para desconectar e trava o Continuar", () => {
    act(() =>
      useOnboardingBanks.setState({
        connected: ["nubank", "itau", "bradesco", "bb", "caixa", "c6"],
        justConnected: null,
      }),
    );
    renderStep();
    expect(screen.getByRole("alert")).toHaveTextContent("há 6 conectados");
    expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Desconectar Caixa" }));
    fireEvent.click(screen.getByRole("button", { name: "Desconectar C6 Bank" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(/você chegou ao limite do plano Plus/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar" })).toBeInTheDocument();
  });

  it("sem nenhum banco, trava o Continuar (é obrigatório: o banco confirma o CPF)", () => {
    act(() => useOnboardingBanks.setState({ connected: [], justConnected: null }));
    renderStep();
    expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();
    expect(screen.getByText("Continuar")).toHaveAttribute("aria-disabled", "true");
  });

  it("deixa Caixa e Santander fora da lista (a não ser que já estejam conectados)", () => {
    act(() => useOnboardingBanks.setState({ connected: [], justConnected: null }));
    renderStep();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
    expect(screen.queryByText("Caixa")).not.toBeInTheDocument();
    expect(screen.queryByText("Santander")).not.toBeInTheDocument();
  });
});
