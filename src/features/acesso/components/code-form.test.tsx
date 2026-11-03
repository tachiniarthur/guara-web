import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as renderUi, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";

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
const savePhone = vi.fn();
vi.mock("@/features/perfil/api", () => ({
  meKeys: { me: ["perfil", "eu"] },
  saveCpf: (...args: unknown[]) => saveCpf(...args),
  saveDisplayName: (...args: unknown[]) => saveDisplayName(...args),
  savePhone: (...args: unknown[]) => savePhone(...args),
}));

const render = (ui: ReactElement) =>
  renderUi(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

beforeEach(() => {
  vi.clearAllMocks();
  verifySignUpCode.mockResolvedValue(undefined);
  verifyEmailCode.mockResolvedValue(undefined);
  resendSignUpCode.mockResolvedValue(undefined);
  saveCpf.mockResolvedValue({});
  saveDisplayName.mockResolvedValue({});
  savePhone.mockResolvedValue({});
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
  it("criar conta: confirma o e-mail e grava nome, celular e CPF na conta", async () => {
    useAuthFlow.getState().start("arthur@exemplo.com", "Arthur", "52998224725", "11987654321");
    // O porteiro fica parado enquanto os dados vão para a conta (senão o onboarding pediria o CPF).
    const pendingWhileSaving: boolean[] = [];
    saveCpf.mockImplementation(() => {
      pendingWhileSaving.push(useAuthFlow.getState().signUpPending);
      return Promise.resolve({});
    });
    render(<CodeForm mode="criar" />);
    typeCode("482917", "Criar conta");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(verifySignUpCode).toHaveBeenCalledWith("arthur@exemplo.com", "482917");
    expect(saveDisplayName).toHaveBeenCalledWith("Arthur");
    expect(savePhone).toHaveBeenCalledWith("11987654321");
    expect(saveCpf).toHaveBeenCalledWith("52998224725");
    expect(pendingWhileSaving).toEqual([true]);
    expect(useAuthFlow.getState()).toMatchObject({
      email: null,
      cpf: null,
      phone: null,
      signUpPending: false,
    });
  });

  it("criar conta: código errado gasta uma tentativa e não abre a conta", async () => {
    verifySignUpCode.mockRejectedValue(new PasswordAuthError("codigo-invalido"));
    useAuthFlow.getState().start("arthur@exemplo.com", "Arthur", "52998224725");
    render(<CodeForm mode="criar" />);
    typeCode("482917", "Criar conta");
    expect(await screen.findByText(/Código incorreto/)).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
    expect(saveCpf).not.toHaveBeenCalled();
    expect(useAuthFlow.getState().signUpPending).toBe(false);
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
