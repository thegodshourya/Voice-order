import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the compiler API provided by the pinned TypeScript 5 toolchain.
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
