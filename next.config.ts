import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plusieurs lockfiles existent sur la machine : on fixe la racine du projet
  // pour que Turbopack ne se trompe pas de dossier.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
