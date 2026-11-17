import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

import { AlertasScreen } from "../../../alertas/alertas-screen";
import { AtivoScreen } from "../../../investimentos/[ativo]/ativo-screen";
import { InvestimentosScreen } from "../../../investimentos/investimentos-screen";
import { PosicoesScreen } from "../../../investimentos/posicoes/posicoes-screen";
import { MetasScreen } from "../../../metas/metas-screen";
import { RelatorioScreen } from "../../../relatorio/relatorio-screen";

/**
 * Estados do protótipo das abas principais (`/investimentos?estado=erro` etc.). As abas são
 * geradas no build e não leem a URL; quando há `?estado=`, o proxy (`src/proxy.ts`) reescreve a
 * requisição para cá, e esta rota desenha a mesma tela no estado pedido. O endereço no navegador
 * não muda.
 */
const screens: Record<string, ComponentType<{ estado?: string }>> = {
  investimentos: InvestimentosScreen,
  metas: MetasScreen,
  relatorio: RelatorioScreen,
  alertas: AlertasScreen,
  "investimentos/posicoes": PosicoesScreen,
};

/** Rotas com parâmetro: `[segmento fixo, tela]` (ex.: `investimentos/petr4`). */
const withParam: Record<string, (param: string, estado: string) => ReactNode> = {
  investimentos: (ativo, estado) => <AtivoScreen ativo={ativo} estado={estado} />,
};

export default async function PreviaPage({ params }: PageProps<"/previa/[estado]/[[...rota]]">) {
  const { estado: raw, rota = [] } = await params;
  const estado = decodeURIComponent(raw);
  const Screen = screens[rota.join("/")];
  if (Screen) return <Screen estado={estado} />;
  const [base, param] = rota;
  const render = rota.length === 2 && base && param ? withParam[base] : undefined;
  if (!render) notFound();
  return render(decodeURIComponent(param!), estado);
}
