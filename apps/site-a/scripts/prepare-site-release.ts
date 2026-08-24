import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { BuildTargetConfigError } from "@content-foundry/site-core";

import { resolveSiteBuildConfig } from "../lib/site-build-config";
import { resolveSiteBuildArtifactPaths } from "../lib/site-build-artifact-paths";
import { prepareSiteRelease } from "../lib/prepare-site-release";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (resolve(process.cwd()) !== appDirectory) {
  throw new BuildTargetConfigError(
    "Site A release preparation must run from the Site A application directory",
  );
}

const immutableObjectDirectory = process.env.IMMUTABLE_MEDIA_DIR?.trim();
await prepareSiteRelease(resolveSiteBuildConfig(process.env), {
  ...resolveSiteBuildArtifactPaths(appDirectory),
  ...(immutableObjectDirectory ? { immutableObjectDirectory } : {}),
});
