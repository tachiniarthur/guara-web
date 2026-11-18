import { NextResponse, type NextRequest } from "next/server";

/**
 * Estados do protótipo nas abas principais: `/relatorio?estado=erro` vira, por dentro,
 * `/previa/erro/relatorio` (o endereço do navegador não muda). Sem `?estado=` o proxy nem roda
 * (ver `matcher`), e a aba é a página gerada no build.
 */
export function proxy(request: NextRequest) {
  const estado = request.nextUrl.searchParams.get("estado");
  if (!estado) return NextResponse.next();
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;
  url.pathname = `/previa/${encodeURIComponent(estado)}${path}`;
  return NextResponse.rewrite(url);
}

// Literal (o Next lê o matcher no build): só as abas com protótipo, e só com `?estado=`.
export const config = {
  matcher: [
    {
      source: "/:tab(relatorio|alertas)",
      has: [{ type: "query", key: "estado" }],
    },
  ],
};
