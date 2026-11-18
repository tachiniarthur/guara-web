import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { questionnaireMock } from "../questionnaire.mock";
import { ProfileResultView } from "./profile-result";

vi.mock("next/navigation", () => ({
  usePathname: () => "/onboarding/perfil/resultado",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const answers = { 1: 1, 2: 1, 3: 1 };

function renderView(onContinue = vi.fn(), error: string | null = null) {
  render(
    <ProfileResultView
      questionnaire={questionnaireMock}
      answers={answers}
      suggested="moderate"
      saving={false}
      error={error}
      onContinue={onContinue}
    />,
  );
  return onContinue;
}

describe("Onboarding · resultado do perfil (dados da API)", () => {
  it("mostra o perfil indicado, as respostas curtas e o alvo das 4 classes", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Moderado");
    expect(screen.getByText("Resultado · 3 de 3 respondidas")).toBeInTheDocument();
    expect(screen.getByText("Crescer no longo prazo")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Renda fixa 50%/ })).toBeInTheDocument();
  });

  it("troca de perfil só com o termo aceito, volta ao indicado e envia a escolha", async () => {
    const onContinue = renderView();
    // Tocar no perfil abre a comparação; o termo só vem ao escolher.
    fireEvent.click(screen.getByRole("radio", { name: /Arrojado/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Comparação: Moderado e Arrojado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Escolher o perfil Arrojado" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Termo de alteração do perfil de investidor",
    );
    const confirm = screen.getByRole("button", { name: "Confirmar troca" });
    expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(confirm);

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Arrojado");
    expect(screen.getByText(/Escolhido por você/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Continuar" })[0]!);
    expect(onContinue).toHaveBeenLastCalledWith("aggressive");

    // Voltar ao indicado não precisa de termo.
    fireEvent.click(screen.getByRole("button", { name: "Comparar com o Moderado" }));
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao Moderado" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Moderado");
    fireEvent.click(screen.getAllByRole("button", { name: "Continuar" })[0]!);
    expect(onContinue).toHaveBeenLastCalledWith(null);
  });

  it("fecha a comparação recolhendo (sem foco lá dentro) e tira da tela no fim", () => {
    renderView();
    fireEvent.click(screen.getByRole("radio", { name: /Arrojado/ }));
    const panel = screen.getByLabelText("Comparação: Moderado e Arrojado");
    fireEvent.click(screen.getByRole("button", { name: "Fechar a comparação" }));
    const wrapper = panel.closest("[inert]");
    expect(wrapper).not.toBeNull();
    fireEvent.transitionEnd(wrapper!);
    expect(screen.queryByLabelText("Comparação: Moderado e Arrojado")).not.toBeInTheDocument();
  });

  it("mostra o erro de salvar", () => {
    renderView(vi.fn(), "Não deu para salvar o perfil. Tente de novo.");
    expect(screen.getByText("Não deu para salvar o perfil. Tente de novo.")).toBeInTheDocument();
  });
});
