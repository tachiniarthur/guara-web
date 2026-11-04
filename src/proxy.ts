import { NextResponse, type NextRequest } from "next/server";

/**
 * Estados do protótipo nas abas principais: `/investimentos?estado=erro` vira, por dentro,
 * `/previa/erro/investimentos` (o endereço do navegador não muda). Sem `?estado=` o proxy nem roda
 * (ver `matcher`), e a aba é a página gerada no build.
 */
export function proxy(request: NextRequest) {
  const estado = request.nextUrl.searchParams.get("estado");
  if (!estado) return NextResponse.next();
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;
  url.pathname = `/previa/${encodeURIComponent(estado)}${path}`;
  return NextResponse.rewrite(url);
}

// Literal (o Next lê o matcher no build): só as abas principais, e só com `?estado=`.
export const config = {
  matcher: [
    {
      source: "/:tab(|gastos|assinaturas|investimentos|metas|relatorio|alertas|conversas)",
      has: [{ type: "query", key: "estado" }],
    },
    // Só as rotas com parâmetro; as telas fixas vizinhas (histórico, adicionar…) ficam de fora.
    { source: "/conversas/:id((?!historico$)[^/]+)", has: [{ type: "query", key: "estado" }] },
    {
      source: "/investimentos/:ativo((?!novo$|alocacao$|duplicidade$|bens$)[^/]+)",
      has: [{ type: "query", key: "estado" }],
    },
  ],
};
