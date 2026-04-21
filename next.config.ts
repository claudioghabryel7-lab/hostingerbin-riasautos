import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  // Configuração para TypeScript
  typescript: {
    ignoreBuildErrors: false
  }
};

export default nextConfig;
