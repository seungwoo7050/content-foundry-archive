import { createReleaseIdentity, type ReleaseIdentity, type ReleaseIdentitySource } from "./release-identity";

type RouteDisposition =
  | {
      readonly type: "redirect";
      readonly fromPath: string;
      readonly toPath: string;
      readonly status: 301 | 308;
    }
  | {
      readonly type: "gone";
      readonly path: string;
      readonly replacementPath: string | null;
      readonly status: 410;
    };

export interface RouteDispositionArtifactSource extends ReleaseIdentitySource {
  readonly redirects: { readonly items: readonly RouteDisposition[] };
}

export interface RouteDispositionArtifactItem {
  readonly action: "redirect" | "gone";
  readonly sourcePath: string;
  readonly targetPath: string | null;
  readonly status: 301 | 308 | 410;
}

export interface RouteDispositionArtifact {
  readonly schemaVersion: "1.0.0";
  readonly release: ReleaseIdentity;
  readonly items: readonly RouteDispositionArtifactItem[];
}

function compareSourcePath(left: RouteDispositionArtifactItem, right: RouteDispositionArtifactItem) {
  if (left.sourcePath < right.sourcePath) return -1;
  if (left.sourcePath > right.sourcePath) return 1;
  return 0;
}

export function createRouteDispositionArtifact(
  bundle: RouteDispositionArtifactSource,
): RouteDispositionArtifact {
  const items = bundle.redirects.items.map((item) =>
    item.type === "redirect"
      ? {
          action: item.type,
          sourcePath: item.fromPath,
          targetPath: item.toPath,
          status: item.status,
        }
      : {
          action: item.type,
          sourcePath: item.path,
          targetPath: item.replacementPath,
          status: item.status,
        },
  );

  return {
    schemaVersion: "1.0.0",
    release: createReleaseIdentity(bundle),
    items: items.sort(compareSourcePath),
  };
}
