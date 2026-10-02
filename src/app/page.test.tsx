import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home", () => {
  it("renderiza o nome do app", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Guará" })).toBeInTheDocument();
  });
});
