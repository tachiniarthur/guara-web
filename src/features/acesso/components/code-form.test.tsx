import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type * as OriginalAuth from "../auth";
import { useAuthFlow } from "@/stores/auth-flow";

import { PasswordAuthError } from "../auth";
import { CodeForm } from "./code-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

const refresh = vi.fn();
vi.mock("../session", () => ({
  useSession: () => ({ live: true, status: "signedOut", refresh, signOut: vi.fn() }),
}));

const verifySignUpCode = vi.fn();
const verifyEmailCode = vi.fn();
const resendSignUpCode = vi.fn();
vi.mock("../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof OriginalAuth>()),
  verifySignUpCode: (...args: unknown[]) => verifySignUpCode(...args),
  verifyEmailCode: (...args: unknown[]) => verifyEmailCode(...args),
  resendSignUpCode: (...args: unknown[]) => resendSignUpCode(...args),
}));

const saveCpf = vi.fn();
const saveDisplayName = vi.fn();
vi.mock("@/features/perfil/api", () => ({
  saveCpf: (...args: unknown[]) => saveCpf(...args),
  saveDisplayName: (...args: unknown[]) => saveDisplayName(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  verifySignUpCode.mockResolvedValue(undefined);
  verifyEmailCode.mockResolvedValue(undefined);
  resendSignUpCode.mockResolvedValue(undefined);
  saveCpf.mockResolvedValue({});
  saveDisplayName.mockResolvedValue({});
  useAuthFlow.getState().clear();
});

function typeCode(code: string, button: string) {
  [...code].forEach((digit, index) => {
    fireEvent.change(screen.getByLabelText(`Dígito ${index + 1} de 6`), {
      target: { value: digit },
    });
  });
  fireEvent.click(screen.getByRole("button", { name: button }));
}

describe("Código", () => {
  it("criar conta: confirma o e-mail e grava nome e CPF na conta", async () => {
    useAuthFlow.getState().start("arthur@exemplo.com", "Arthur", "52998224725");
    render(<CodeForm mode="criar" />);
    typeCode("482917", "Criar conta");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(verifySignUpCode).toHaveBeenCalledWith("arthur@exemplo.com", "482917");
    expect(saveDisplayName).toHaveBeenCalledWith("Arthur");
    expect(saveCpf).toHaveBeenCalledWith("52998224725");
    expect(useAuthFlow.getState()).toMatchObject({ email: null, cpf: null });
  });

  it("criar conta: código errado gasta uma tentativa e não abre a conta", async () => {
    verifySignUpCode.mockRejectedValue(new PasswordAuthError("codigo-invalido"));
    useAuthFlow.getState().start("arthur@exemplo.com", "Arthur", "52998224725");
    render(<CodeForm mode="criar" />);
    typeCode("482917", "Criar conta");
    expect(await screen.findByText(/Código incorreto/)).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
    expect(saveCpf).not.toHaveBeenCalled();
  });

  it("recuperar senha: trava o porteiro antes de confirmar e segue para a senha nova", async () => {
    useAuthFlow.getState().start("arthur@exemplo.com", null);
    let pendingDuringVerify = false;
    verifyEmailCode.mockImplementation(() => {
      pendingDuringVerify = useAuthFlow.getState().passwordPending;
      return Promise.resolve();
    });
    render(<CodeForm mode="recuperar" />);
    typeCode("482917", "Continuar");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/nova-senha"));
    expect(pendingDuringVerify).toBe(true);
    expect(useAuthFlow.getState().passwordPending).toBe(true);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("recuperar senha: código errado destrava o porteiro", async () => {
    verifyEmailCode.mockRejectedValue(new PasswordAuthError("codigo-invalido"));
    useAuthFlow.getState().start("arthur@exemplo.com", null);
    render(<CodeForm mode="recuperar" />);
    typeCode("482917", "Continuar");
    expect(await screen.findByText(/Código incorreto/)).toBeInTheDocument();
    expect(useAuthFlow.getState().passwordPending).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });
});
