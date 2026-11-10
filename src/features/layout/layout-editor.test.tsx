import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as baseRender, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";

import { InicioScreen } from "@/app/(app)/inicio-screen";
import { SessionProvider } from "@/features/acesso/session";

function render(ui: ReactElement) {
  return baseRender(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>{ui}</SessionProvider>
    </QueryClientProvider>,
  );
}

const editBar = () => screen.getByRole("region", { name: "Editar layout" });
const startEditing = () =>
  fireEvent.click(screen.getAllByRole("button", { name: "Editar layout" })[0]!);

beforeEach(() => window.localStorage.clear());

describe("Editar layout (Início)", () => {
  it("ocultar some com o bloco; reexibir traz idêntico; nada muda fora da edição", () => {
    render(<InicioScreen />);
    expect(screen.getByText("Metas")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ocultar Metas" })).not.toBeInTheDocument();

    startEditing();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Metas" }));
    // Fica na lista de ocultos da barra, pronto para voltar.
    const restore = within(editBar()).getByRole("button", { name: "Mostrar Metas" });
    fireEvent.click(restore);
    expect(within(editBar()).queryByRole("button", { name: "Mostrar Metas" })).toBeNull();
  });

  it("concluir salva no navegador e o layout volta ao recarregar", () => {
    const { unmount } = render(<InicioScreen />);
    startEditing();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Metas" }));
    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
    const saved = JSON.parse(window.localStorage.getItem("guara:layout:home")!);
    expect(saved.version).toBe(1);
    expect(saved.blocks.find((b: { id: string }) => b.id === "metas")).toMatchObject({
      hidden: true,
    });
    unmount();

    render(<InicioScreen />);
    expect(screen.queryByText("Metas")).not.toBeInTheDocument();
    expect(screen.getByText("Investimentos")).toBeInTheDocument();
  });

  it("tamanho pelos botões − e + só entre os tamanhos aceitos", () => {
    render(<InicioScreen />);
    startEditing();
    const grow = () => screen.getByRole("button", { name: "Aumentar Metas" });
    fireEvent.click(grow());
    fireEvent.click(grow());
    // Metas aceita até a metade: o + desliga no limite.
    expect(grow()).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Mudar o tamanho de Metas: Metade" }),
    ).toBeInTheDocument();
  });

  it("restaurar padrão desfaz tudo (e fica desligado quando já é o padrão)", () => {
    render(<InicioScreen />);
    startEditing();
    const restoreDefault = within(editBar()).getByRole("button", { name: "Restaurar padrão" });
    expect(restoreDefault).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Metas" }));
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Pendências" }));
    fireEvent.click(restoreDefault);
    expect(within(editBar()).queryByRole("group", { name: "Blocos ocultos" })).toBeNull();
    expect(restoreDefault).toBeDisabled();
  });

  it("layout salvo com bloco que não existe mais não quebra a tela", () => {
    window.localStorage.setItem(
      "guara:layout:home",
      JSON.stringify({
        version: 1,
        blocks: [
          { id: "grafico-removido", size: "xl", hidden: false, compact: false },
          { id: "metas", size: "m", hidden: true, compact: false },
        ],
      }),
    );
    render(<InicioScreen />);
    expect(screen.queryByText("Metas")).not.toBeInTheDocument();
    expect(screen.getByText("Investimentos")).toBeInTheDocument();
  });

  it("altura pelo teclado na alça de baixo: baixa, automática, alta", () => {
    render(<InicioScreen />);
    startEditing();
    const handle = () => screen.getByRole("button", { name: /Mudar a altura de Metas/ });
    expect(handle()).toHaveAccessibleName("Mudar a altura de Metas: Automática");
    fireEvent.keyDown(handle(), { key: "ArrowDown" });
    expect(handle()).toHaveAccessibleName("Mudar a altura de Metas: Alta");
    fireEvent.keyDown(handle(), { key: "ArrowUp" });
    fireEvent.keyDown(handle(), { key: "ArrowUp" });
    expect(handle()).toHaveAccessibleName("Mudar a altura de Metas: Baixa");
  });
});
