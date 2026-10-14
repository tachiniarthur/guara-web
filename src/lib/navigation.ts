import type { IconName } from "@/components/ui/icon";

export type NavItem = {
  href: string;
  /** Rótulo no menu lateral (desktop). */
  label: string;
  /** Rótulo curto no trilho (tablet) e na barra inferior (mobile). */
  shortLabel: string;
  icon: IconName;
  /** Prefixos de rota que também marcam o item como atual. */
  match?: string[];
  /** Rotas que não marcam o item, mesmo casando com um prefixo. */
  exclude?: string[];
  badge?: number;
};

/** Destinos principais (menu lateral e trilho). */
export const mainNav: NavItem[] = [
  { href: "/", label: "Início", shortLabel: "Início", icon: "home", match: ["/notificacoes"] },
  { href: "/gastos", label: "Gastos", shortLabel: "Gastos", icon: "wallet" },
  { href: "/assinaturas", label: "Assinaturas", shortLabel: "Assinaturas", icon: "repeat" },
  { href: "/investimentos", label: "Investimentos", shortLabel: "Investir", icon: "trending-up" },
  {
    href: "/simulador",
    label: "Simulador",
    shortLabel: "Simular",
    icon: "simulator",
    match: ["/metas"],
  },
  { href: "/relatorio", label: "Relatórios", shortLabel: "Relatórios", icon: "bar-chart" },
  { href: "/alertas", label: "Alertas", shortLabel: "Alertas", icon: "bell", badge: 2 },
];

/** Barra inferior do mobile: 5 destinos com "Conversar" no centro. */
export const bottomNav: (NavItem & { featured?: boolean })[] = [
  { href: "/", label: "Início", shortLabel: "Início", icon: "home", match: ["/notificacoes"] },
  {
    href: "/gastos",
    label: "Gastos",
    shortLabel: "Gastos",
    icon: "wallet",
    match: ["/assinaturas"],
  },
  {
    href: "/conversas",
    label: "Conversar",
    shortLabel: "Conversar",
    icon: "chat",
    featured: true,
  },
  {
    href: "/investimentos",
    label: "Investir",
    shortLabel: "Investir",
    icon: "trending-up",
    match: ["/simulador"],
    exclude: ["/simulador/salvas"],
  },
  { href: "/assistentes", label: "Assistentes", shortLabel: "Assistentes", icon: "users" },
];

/** Itens do menu da conta no mobile (destinos que não cabem na barra inferior). */
export const accountMenu: { href: string; label: string; icon: IconName; badge?: number }[] = [
  { href: "/assinaturas", label: "Assinaturas", icon: "repeat" },
  { href: "/simulador", label: "Simulador", icon: "simulator" },
  { href: "/relatorio", label: "Relatórios", icon: "bar-chart" },
  { href: "/alertas", label: "Alertas", icon: "bell", badge: 2 },
  { href: "/perfil", label: "Meu perfil e configurações", icon: "user" },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "match" | "exclude">) {
  if (item.exclude?.includes(pathname)) return false;
  const prefixes = [item.href, ...(item.match ?? [])];
  return prefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type ShellConfig = {
  /** Painel à direita no desktop: histórico de conversas, conversa aberta (Início) ou nenhum. */
  aside: "history" | "home" | false;
  /**
   * Botão flutuante "Conversar": no tablet sempre que `true`; no desktop só nas telas sem
   * painel à direita.
   */
  fab: boolean;
  /** Barra inferior no mobile. */
  bottomNav: boolean;
  /**
   * Botão redondo de conversa no mobile, nas telas sem barra inferior: acima da barra de ações
   * fixa dos formulários ("bar") ou no canto da tela ("corner").
   */
  mobileFab: "bar" | "corner" | false;
  /** Conversa sobre a tela fixa à direita no tablet deitado (≥ 1100 px, antes do desktop). */
  tabletChat?: boolean;
};

/** Destinos principais com o painel de conversas à direita no desktop. */
function hasHistoryAside(pathname: string) {
  if (["/gastos", "/assinaturas", "/alertas", "/investimentos", "/relatorio"].includes(pathname)) {
    return true;
  }
  if (pathname.startsWith("/assistentes")) return true;
  if (pathname.startsWith("/simulador")) return pathname !== "/simulador/salvas";
  // Detalhe de um ativo (/investimentos/petr4), mas não as outras telas de investimentos.
  const asset = pathname.match(/^\/investimentos\/([^/]+)$/)?.[1];
  return asset !== undefined && !["novo", "posicoes", "alocacao", "duplicidade"].includes(asset);
}

/** Formulários: sem barra inferior no mobile, com a ação principal fixa no rodapé. */
function isForm(pathname: string) {
  return (
    ["/alertas/novo-teto", "/alertas/novo-preco", "/investimentos/novo", "/metas/nova"].includes(
      pathname,
    ) ||
    pathname === "/investimentos/duplicidade" ||
    /^\/investimentos\/bens\/(imovel|veiculo)\/novo$/.test(pathname) ||
    /^\/alertas\/(tetos|precos)\/[^/]+\/editar$/.test(pathname) ||
    (pathname.startsWith("/perfil/") && pathname !== "/perfil/planos")
  );
}

/** Como o app shell se comporta em cada rota (segue os protótipos de cada tela). */
export function shellConfig(pathname: string, options: { novo?: boolean } = {}): ShellConfig {
  // Usuário novo (`?estado=novo`): sem bancos nem conversas, não há painel de conversas.
  if (options.novo && ["/", "/gastos", "/investimentos"].includes(pathname)) {
    return { aside: false, fab: true, bottomNav: true, mobileFab: false };
  }
  if (pathname === "/") return { aside: "home", fab: true, bottomNav: true, mobileFab: false };
  if (pathname === "/conversas/historico") {
    return { aside: false, fab: false, bottomNav: true, mobileFab: false };
  }
  if (pathname === "/conversas" || pathname.startsWith("/conversas/")) {
    return { aside: false, fab: false, bottomNav: false, mobileFab: false };
  }
  if (pathname === "/perfil") {
    return { aside: false, fab: true, bottomNav: false, mobileFab: "corner" };
  }
  if (isForm(pathname)) return { aside: false, fab: true, bottomNav: false, mobileFab: "bar" };
  if (pathname === "/relatorio") {
    return { aside: "history", fab: false, bottomNav: true, mobileFab: false, tabletChat: true };
  }
  if (hasHistoryAside(pathname)) {
    return { aside: "history", fab: true, bottomNav: true, mobileFab: false };
  }
  return { aside: false, fab: true, bottomNav: true, mobileFab: false };
}
