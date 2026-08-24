import { resolve } from "node:path";

import {
  parseProductionOrigins,
  type BuildTargetConfig,
  resolveBuildTargetConfig,
} from "@content-foundry/site-core";

const templateReleaseDirectory = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);

export function resolveSiteBuildConfig(
  environment: Readonly<Record<string, string | undefined>>,
): BuildTargetConfig {
  return resolveBuildTargetConfig(environment, {
    siteId: "site-a",
    templateReleaseDirectory,
    allowedProductionOrigins: parseProductionOrigins(
      environment.SITE_ALLOWED_PRODUCTION_ORIGINS,
    ),
  });
}
