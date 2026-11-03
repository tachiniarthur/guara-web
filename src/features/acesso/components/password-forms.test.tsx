import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import type * as OriginalAuth from "../auth";
import { useAuthFlow } from "@/stores/auth-flow";

import { EmailAuthError } from "../auth";
import { ForgotPasswordForm, NewPasswordForm } from "./password-forms";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));

const refresh = vi.fn();
vi.mock("../session", () => ({
  useSession: () => ({ live: true, status: "signedOut", refresh, signOut: vi.fn() }),
}));

const requestEmailCode = vi.fn();
const updatePassword = vi.fn();
vi.mock("../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof OriginalAuth>()),
  requestEmailCode: (...args: unknown[]) => requestEmailCode(...args),
  updatePassword: (...args: unknown[]) => updatePassword(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  requestEmailCode.mockResolvedValue(undefined);
  updatePassword.mockResolvedValue(undefined);
  useAuthFlow.getState().clear();
});

describe("Esqueci minha senha", () => {
  it("manda o código para uma conta que existe", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "Arthur@Exemplo.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Receber código" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/codigo"));
    expect(requestEmailCode).toHaveBeenCalledWith("arthur@exemplo.com", false);
    expect(useAuthFlow.getState().email).toBe("arthur@exemplo.com");
  });

  it("avisa quando não há conta com o e-mail", async () => {
    requestEmailCode.mockRejectedValue(new EmailAuthError("sem-conta"));
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "artur@exemplo.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Receber código" }));
    expect(
      await screen.findByText("Não achamos uma conta com artur@exemplo.com."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

describe("Senha nova", () => {
  const fill = (password: string, confirmation = password) => {
    fireEvent.change(screen.getByLabelText("Senha nova"), { target: { value: password } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: confirmation } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar e entrar" }));
  };

  it("volta para a entrada sem o código confirmado", () => {
    render(<NewPasswordForm />);
    expect(replace).toHaveBeenCalledWith("/entrar");
  });

  it("confere as regras antes de salvar", () => {
    useAuthFlow.getState().setPasswordPending(true);
    render(<NewPasswordForm />);
    fill("12345678", "outra");
    // A regra que falta fica vermelha na lista, sem repetir o erro embaixo do campo.
    const rules = screen.getByRole("list", { name: "A senha precisa ter" });
    expect(within(rules).getByText("Uma letra maiúscula").parentElement).toHaveClass("text-urucum");
    expect(screen.queryByText("Inclua pelo menos uma letra maiúscula.")).not.toBeInTheDocument();
    expect(screen.getByText("As senhas não são iguais.")).toBeInTheDocument();
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it("marca as regras e a confirmação enquanto a pessoa digita", () => {
    useAuthFlow.getState().setPasswordPending(true);
    render(<NewPasswordForm />);
    const rules = screen.getByRole("list", { name: "A senha precisa ter" });
    const done = () =>
      within(rules)
        .getAllByRole("listitem")
        .filter((item) => item.textContent?.includes("(feito)")).length;
    expect(done()).toBe(0);
    fireEvent.change(screen.getByLabelText("Senha nova"), { target: { value: "Senha2026" } });
    expect(done()).toBe(3);
    fireEvent.change(screen.getByLabelText("Senha nova"), { target: { value: "Senha@2026" } });
    expect(done()).toBe(4);
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "Senha@" } });
    expect(screen.getByText("As senhas ainda não são iguais.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "Senha@2026" } });
    expect(screen.getByText("As senhas são iguais.")).toBeInTheDocument();
  });

  it("salva a senha, libera a sessão e abre o app", async () => {
    useAuthFlow.getState().setPasswordPending(true);
    render(<NewPasswordForm />);
    fill("Senha@2026");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(updatePassword).toHaveBeenCalledWith("Senha@2026");
    expect(useAuthFlow.getState().passwordPending).toBe(false);
    expect(refresh).toHaveBeenCalled();
  });
});
