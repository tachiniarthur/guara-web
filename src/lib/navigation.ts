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
  badge?: number;
};

/** Destinos principais (menu lateral e trilho). */
export const mainNav: NavItem[] = [
  { href: "/", label: "Início", shortLabel: "Início", icon: "home" },
  { href: "/gastos", label: "Gastos", shortLabel: "Gastos", icon: "wallet" },
  { href: "/assinaturas", label: "Assinaturas", shortLabel: "Assinaturas", icon: "repeat" },
  { href: "/investimentos", label: "Investimentos", shortLabel: "Investir", icon: "trending-up" },
  { href: "/simulador", label: "Simulador", shortLabel: "Simular", icon: "simulator" },
  { href: "/relatorio", label: "Relatórios", shortLabel: "Relatórios", icon: "bar-chart" },
  { href: "/alertas", label: "Alertas", shortLabel: "Alertas", icon: "bell", badge: 2 },
];

/** Barra inferior do mobile: 5 destinos com "Conversar" no centro. */
export const bottomNav: (NavItem & { featured?: boolean })[] = [
  { href: "/", label: "Início", shortLabel: "Início", icon: "home" },
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

export function isActive(pathname: string, item: Pick<NavItem, "href" | "match">) {
  const prefixes = [item.href, ...(item.match ?? [])];
  return prefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type ShellConfig = {
  /** Painel à direita no desktop: histórico de conversas, conversa aberta (Início) ou nenhum. */
  aside: "history" | "home" | false;
  /** Botão flutuante "Conversar" no tablet. */
  fab: boolean;
  /** Barra inferior no mobile. */
  bottomNav: boolean;
};

const formRoutes = ["/alertas/novo-teto", "/alertas/novo-preco", "/investimentos/novo"];

/** Como o app shell se comporta em cada rota (segue os protótipos de cada tela). */
export function shellConfig(pathname: string): ShellConfig {
  if (pathname === "/") return { aside: "home", fab: true, bottomNav: true };
  if (formRoutes.includes(pathname)) return { aside: false, fab: false, bottomNav: false };
  if (pathname.startsWith("/perfil")) return { aside: false, fab: false, bottomNav: false };
  if (pathname === "/conversas/historico") return { aside: false, fab: false, bottomNav: true };
  if (pathname === "/conversas" || pathname.startsWith("/conversas/")) {
    return { aside: false, fab: false, bottomNav: false };
  }
  if (pathname.startsWith("/assistentes")) return { aside: "history", fab: true, bottomNav: true };
  return { aside: "history", fab: true, bottomNav: true };
}
