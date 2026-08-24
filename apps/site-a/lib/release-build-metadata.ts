import {
  SUPPORTED_CONTRACT_VERSIONS,
  type SupportedContractVersion,
} from "@content-foundry/content-contract";

import {
  createReleaseIdentity,
  type ReleaseIdentity,
  type ReleaseIdentitySource,
} from "./release-identity";
import { getRouteClaims, type GeneratedRouteSource } from "./route-claims";

export interface ReleaseBuildMetadata extends ReleaseIdentity {
  readonly supportedContractVersions: readonly SupportedContractVersion[];
  readonly routeCount: number;
}

export function createReleaseBuildMetadata(
  bundle: ReleaseIdentitySource & GeneratedRouteSource,
): ReleaseBuildMetadata {
  const routeCount = [...getRouteClaims(bundle).values()].filter(
    ({ outputKind }) => outputKind === "html",
  ).length;

  return {
    ...createReleaseIdentity(bundle),
    supportedContractVersions: [...SUPPORTED_CONTRACT_VERSIONS],
    routeCount,
  };
}
