import "server-only";

import { resolve } from "node:path";

import { resolveBuildTargetConfig } from "@content-foundry/site-core";

import { loadSiteRelease, type SiteReleaseContext } from "./load-site-release";

const templateReleaseDirectory = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);

let cachedContext: SiteReleaseContext | undefined;

export function getSiteReleaseContext(): SiteReleaseContext {
  cachedContext ??= loadSiteRelease(
    resolveBuildTargetConfig(process.env, {
      siteId: "site-a",
      templateReleaseDirectory,
      allowedProductionOrigins: [],
    }),
  );
  return cachedContext;
}
