import { fireEvent, render, screen } from "@testing-library/react";

import { defaultSettings, useSettings } from "@/stores/settings";

import { SettingsScreen } from "./settings-screen";

describe("Configurações", () => {
  beforeEach(() => useSettings.setState(defaultSettings));

  it("só guarda as mudanças ao salvar; descartar volta ao salvo", () => {
    render(<SettingsScreen />);
    const [salvar] = screen.getAllByRole("button", { name: "Salvar alterações" });
    expect(salvar).toBeDisabled();

    const [reduzir] = screen.getAllByRole("switch", { name: "Reduzir animações" });
    fireEvent.click(reduzir!);
    expect(useSettings.getState().reduceMotion).toBe(false);
    expect(salvar).toBeEnabled();

    fireEvent.click(salvar!);
    expect(useSettings.getState().reduceMotion).toBe(true);
    expect(salvar).toBeDisabled();

    const [email] = screen.getAllByRole("checkbox", { name: "Tetos de gasto por e-mail" });
    fireEvent.click(email!);
    fireEvent.click(screen.getAllByRole("button", { name: "Descartar" })[0]!);
    expect(email).toBeChecked();
    expect(useSettings.getState().notifications["Tetos de gasto"]?.email).toBe(true);
  });
});
