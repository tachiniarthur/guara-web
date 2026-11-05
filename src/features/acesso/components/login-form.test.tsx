import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type * as OriginalAuth from "../auth";
import { useAuthFlow } from "@/stores/auth-flow";

import { PasswordAuthError } from "../auth";
import { LoginForm, SignInOptions } from "./login-form";

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
    fill("arthur@exemplo.com", "Senha@2026");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(signInWithPassword).toHaveBeenCalledWith("arthur@exemplo.com", "Senha@2026");
  });

  it("entra com o CPF do jeito que foi digitado", async () => {
    render(<LoginForm />);
    fill("529.982.247-25", "Senha@2026");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(signInWithPassword).toHaveBeenCalledWith("529.982.247-25", "Senha@2026");
  });

  it("põe a máscara do CPF quando só há números", () => {
    render(<LoginForm />);
    const field = screen.getByLabelText("E-mail ou CPF");
    fireEvent.change(field, { target: { value: "52998224725" } });
    expect(field).toHaveValue("529.982.247-25");
    fireEvent.change(field, { target: { value: "ana@exemplo.com" } });
    expect(field).toHaveValue("ana@exemplo.com");
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
      social: false,
    });
    render(<LoginForm />);
    expect(screen.getByLabelText("E-mail ou CPF")).toHaveValue("529.982.247-25");
    expect(screen.getByText("Esse CPF já tem uma conta no Guará.")).toBeInTheDocument();
    // O aviso aparece uma vez só.
    expect(useAuthFlow.getState().signInHint).toBeNull();
  });

  it("usa os campos do design do Entrar (borda de 1,5 px e 16 px de recuo)", () => {
    render(<LoginForm />);
    const identifier = screen.getByLabelText("E-mail ou CPF");
    expect(identifier).toHaveClass("border-[1.5px]", "px-4");
    expect(identifier).not.toHaveClass("border", "px-3.5");
    const password = screen.getByLabelText("Senha");
    expect(password).toHaveClass("border-[1.5px]", "pl-4", "pr-12");
  });

  it("só os campos de e-mail ou CPF e senha, sem Google e Apple (eles ficam na escolha)", () => {
    render(<LoginForm />);
    expect(screen.queryByRole("button", { name: "Continuar com Google" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/boas-vindas/criar",
    );
  });
});

describe("Entrar · escolha", () => {
  it("oferece Google, Apple e e-mail ou CPF, sem campos", () => {
    render(<SignInOptions />);
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar com Apple" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar com e-mail ou CPF" })).toHaveAttribute(
      "href",
      "/entrar/email",
    );
    expect(screen.queryByLabelText("Senha")).not.toBeInTheDocument();
  });

  it("mostra o aviso de quem veio do Criar conta com uma conta só do Google", () => {
    useAuthFlow.getState().setSignInHint({
      identifier: "ana@exemplo.com",
      notice: "Esse e-mail já tem uma conta no Guará, criada com o Google.",
      social: true,
    });
    render(<SignInOptions />);
    expect(
      screen.getByText("Esse e-mail já tem uma conta no Guará, criada com o Google."),
    ).toBeInTheDocument();
  });
});
