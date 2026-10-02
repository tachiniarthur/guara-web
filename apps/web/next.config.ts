import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pacotes internos do monorepo são publicados como TypeScript puro.
  transpilePackages: ["@guara/types", "@guara/ui-tokens", "@guara/utils"],
};

export default nextConfig;
