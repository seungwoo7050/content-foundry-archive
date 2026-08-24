import { createHash } from "node:crypto";

import {
  createBuildConfigProjection,
  type BuildConfigProjectionSource,
} from "./build-config-projection";

export type BuildConfigChecksum = `sha256:${string}`;

export function createBuildConfigChecksum(
  source: BuildConfigProjectionSource,
): BuildConfigChecksum {
  const canonicalJson = JSON.stringify(createBuildConfigProjection(source));
  const digest = createHash("sha256")
    .update(canonicalJson, "utf8")
    .digest("hex");
  return `sha256:${digest}`;
}
