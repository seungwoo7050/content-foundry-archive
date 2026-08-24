import {
  SUPPORTED_CONTRACT_VERSIONS,
  type SupportedContractVersion,
} from "@content-foundry/content-contract";

import {
  createReleaseIdentity,
  type ReleaseIdentity,
  type ReleaseIdentitySource,
} from "./release-identity";
import { getGoneRoutes, type GoneRouteSource } from "./gone-route";
import { getRouteClaims, type GeneratedRouteSource } from "./route-claims";

export interface ReleaseBuildMetadata extends ReleaseIdentity {
  readonly supportedContractVersions: readonly SupportedContractVersion[];
  readonly routeCount: number;
}

export function createReleaseBuildMetadata(
  bundle: ReleaseIdentitySource & GeneratedRouteSource & GoneRouteSource,
): ReleaseBuildMetadata {
  const generatedHtmlCount = [...getRouteClaims(bundle).values()].filter(
    ({ outputKind }) => outputKind === "html",
  ).length;

  return {
    ...createReleaseIdentity(bundle),
    supportedContractVersions: [...SUPPORTED_CONTRACT_VERSIONS],
    routeCount: generatedHtmlCount + getGoneRoutes(bundle).length,
  };
}
