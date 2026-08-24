import type { MetadataRoute } from "next";

export interface RobotsPolicySource {
  readonly noindex: boolean;
}

export function createRobotsPolicy(
  canonicalOrigin: string,
  config: RobotsPolicySource,
): MetadataRoute.Robots {
  if (config.noindex) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_release.json", "/search-index.json"],
    },
    sitemap: new URL("/sitemap.xml", canonicalOrigin).href,
  };
}
