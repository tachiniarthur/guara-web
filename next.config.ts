import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança em toda resposta (páginas e arquivos de `public/`):
 * - o site não abre dentro de iframe de outro endereço (clickjacking);
 * - o navegador não adivinha o tipo de um arquivo (`nosniff`);
 * - outros sites recebem só a origem como referência, nunca o caminho;
 * - câmera, microfone e localização ficam desligados (o site não usa).
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: () => [{ source: "/:path*", headers: securityHeaders }],
};

export default nextConfig;
