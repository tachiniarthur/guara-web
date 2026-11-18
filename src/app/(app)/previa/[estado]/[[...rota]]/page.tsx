import { notFound } from "next/navigation";
import type { ComponentType } from "react";

import { AlertasScreen } from "../../../alertas/alertas-screen";
import { RelatorioScreen } from "../../../relatorio/relatorio-screen";

/**
 * Estados do protótipo das abas que ainda têm dados de exemplo (`/relatorio?estado=erro` etc.).
 * As abas são geradas no build e não leem a URL; quando há `?estado=`, o proxy (`src/proxy.ts`)
 * reescreve a requisição para cá, e esta rota desenha a mesma tela no estado pedido. O endereço no
 * navegador não muda. Investimentos e Metas são só API: os estados vêm dos dados de verdade.
 */
const screens: Record<string, ComponentType<{ estado?: string }>> = {
  relatorio: RelatorioScreen,
  alertas: AlertasScreen,
};

export default async function PreviaPage({ params }: PageProps<"/previa/[estado]/[[...rota]]">) {
  const { estado: raw, rota = [] } = await params;
  const Screen = screens[rota.join("/")];
  if (!Screen) notFound();
  return <Screen estado={decodeURIComponent(raw)} />;
}
