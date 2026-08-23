import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  transpilePackages: [
    "@content-foundry/content-contract",
    "@content-foundry/site-core",
  ],
};

export default nextConfig;
