import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type * as OriginalAuth from "../auth";
import { useAuthFlow } from "@/stores/auth-flow";

import { PasswordAuthError } from "../auth";
import { LoginForm } from "./login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

const refresh = vi.fn();
vi.mock("../session", () => ({
  useSession: () => ({ live: true, status: "signedOut", refresh, signOut: vi.fn() }),
}));

const signInWithPassword = vi.fn();
vi.mock("../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof OriginalAuth>()),
  signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  signInWithPassword.mockResolvedValue(undefined);
  useAuthFlow.getState().clear();
});

function fill(identifier: string, password: string) {
  fireEvent.change(screen.getByLabelText("E-mail ou CPF"), { target: { value: identifier } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Entrar", () => {
  it("entra com e-mail e senha e relê a sessão", async () => {
    render(<LoginForm />);
    fill("arthur@exemplo.com", "Senha2026");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(signInWithPassword).toHaveBeenCalledWith("arthur@exemplo.com", "Senha2026");
  });

  it("entra com o CPF do jeito que foi digitado", async () => {
    render(<LoginForm />);
    fill("529.982.247-25", "Senha2026");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(signInWithPassword).toHaveBeenCalledWith("529.982.247-25", "Senha2026");
  });

  it("pede os dois campos", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Informe seu e-mail ou CPF e a senha.")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("diz a mesma coisa para qualquer credencial errada", async () => {
    signInWithPassword.mockRejectedValue(new PasswordAuthError("credenciais"));
    render(<LoginForm />);
    fill("arthur@exemplo.com", "errada123");
    expect(
      await screen.findByText("E-mail, CPF ou senha incorretos. Confira e tente de novo."),
    ).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('leva o e-mail digitado para o "Esqueci minha senha"', () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("E-mail ou CPF"), {
      target: { value: "Arthur@Exemplo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(push).toHaveBeenCalledWith("/entrar/esqueci");
    expect(useAuthFlow.getState().email).toBe("arthur@exemplo.com");
  });

  it("abre com o e-mail ou o CPF e o aviso de quem veio do Criar conta", () => {
    useAuthFlow.getState().setSignInHint({
      identifier: "529.982.247-25",
      notice: "Esse CPF já tem uma conta no Guará.",
    });
    render(<LoginForm />);
    expect(screen.getByLabelText("E-mail ou CPF")).toHaveValue("529.982.247-25");
    expect(screen.getByText("Esse CPF já tem uma conta no Guará.")).toBeInTheDocument();
    // O aviso aparece uma vez só.
    expect(useAuthFlow.getState().signInHint).toBeNull();
  });
});
