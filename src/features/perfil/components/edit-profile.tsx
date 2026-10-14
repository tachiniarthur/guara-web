"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { user } from "@/features/usuario/data";
import { cn } from "@/lib/utils";

const colors = [
  { nome: "amarelo", cor: "#F2C230" },
  { nome: "verde", cor: "#6CC08E" },
  { nome: "azul", cor: "#6DB3EC" },
  { nome: "urucum", cor: "#FF6A50" },
  { nome: "areia", cor: "#F2EFE6" },
];

/** Iniciais (88px) com "Escolher foto" e a escolha da cor do círculo. */
export function AvatarFields() {
  const [color, setColor] = useState(colors[0]!.cor);
  return (
    <>
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex size-22 shrink-0 items-center justify-center rounded-full font-display text-32 font-extrabold text-canvas"
          style={{ background: color }}
        >
          {user.iniciais}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm">
            <Icon name="camera" size={18} />
            <span>Escolher foto</span>
          </Button>
          <span className="text-13 text-caption">Sem foto, mostramos suas iniciais</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-14 font-bold">Cor das iniciais</span>
        <div role="group" aria-label="Cor das iniciais" className="flex gap-2.5">
          {colors.map((c) => (
            <button
              key={c.nome}
              type="button"
              aria-label={`Cor ${c.nome}`}
              aria-pressed={color === c.cor}
              onClick={() => setColor(c.cor)}
              className={cn(
                "size-9 rounded-full",
                color === c.cor ? "border-3 border-sand" : "border border-line-strong",
              )}
              style={{ background: c.cor }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
