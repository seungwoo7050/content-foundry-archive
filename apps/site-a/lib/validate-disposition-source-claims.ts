import {
  ContractError,
  type ContractIssue,
  type LoadedReleaseBundle,
} from "@content-foundry/content-contract";

import { getRouteClaims } from "./route-claims";

export function validateDispositionSourceClaims(
  bundle: LoadedReleaseBundle,
): LoadedReleaseBundle {
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
