import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Autorise les Server Actions depuis GitHub Codespaces (protection CSRF).
    serverActions: {
      allowedOrigins: ["*.app.github.dev"],
    },
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;