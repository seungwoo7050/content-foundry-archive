import {
  ContractError,
  type ContractIssue,
} from "@content-foundry/content-contract";

import {
  getRouteClaims,
  type GeneratedRouteSource,
} from "./route-claims";

type RouteDisposition =
  | { readonly type: "redirect"; readonly fromPath: string; readonly toPath: string }
  | {
      readonly type: "gone";
      readonly path: string;
      readonly replacementPath: string | null;
    };

export interface DispositionRouteSource extends GeneratedRouteSource {
  readonly redirects: { readonly items: readonly RouteDisposition[] };
}

export function validateDispositionSourceClaims<T extends DispositionRouteSource>(
  bundle: T,
): T {
  const claims = getRouteClaims(bundle);
  const issues: ContractIssue[] = [];

  bundle.redirects.items.forEach((item, index) => {
    const { source, sourceField } =
      item.type === "redirect"
        ? { source: item.fromPath, sourceField: "fromPath" }
        : { source: item.path, sourceField: "path" };
    const claim = claims.get(source);
    if (claim) {
      issues.push({
        path: `/redirects/items/${index}/${sourceField}`,
        message: `route ${source} is already claimed by ${claim.kind} at ${claim.source}`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Route dispositions overlap generated outputs",
      issues,
    );
  }
  return bundle;
}
