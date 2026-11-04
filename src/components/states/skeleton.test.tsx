import { render } from "@testing-library/react";
import { useEffect } from "react";

import { Skeleton } from "./skeleton";

let mounts = 0;
function Content() {
  useEffect(() => {
    mounts += 1;
  }, []);
  return <p>Conteúdo</p>;
}

it("ao terminar de carregar, o conteúdo entra de novo (as animações de entrada acontecem à vista)", () => {
  mounts = 0;
  const { rerender } = render(
    <Skeleton active>
      <Content />
    </Skeleton>,
  );
  expect(mounts).toBe(1);
  rerender(
    <Skeleton active={false}>
      <Content />
    </Skeleton>,
  );
  expect(mounts).toBe(2);
  // Sem voltar a carregar, nada remonta.
  rerender(
    <Skeleton active={false}>
      <Content />
    </Skeleton>,
  );
  expect(mounts).toBe(2);
});
