import {
  ContractError,
  type ContractIssue,
  type LoadedReleaseBundle,
} from "@content-foundry/content-contract";

import { getGeneratedRoutes } from "./generated-routes";

export function validateDispositionTargets(
  bundle: LoadedReleaseBundle,
): LoadedReleaseBundle {
  const generatedRoutes = getGeneratedRoutes(bundle);
  const issues: ContractIssue[] = [];

  bundle.redirects.items.forEach((item, index) => {
    const target =
      item.type === "redirect" ? item.toPath : item.replacementPath;
    const targetField =
      item.type === "redirect" ? "toPath" : "replacementPath";
    if (target !== null && !generatedRoutes.has(target)) {
      issues.push({
        path: `/redirects/items/${index}/${targetField}`,
        message: `not a direct generated route: ${target}`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Route disposition targets do not resolve directly",
      issues,
    );
  }
  return bundle;
}
