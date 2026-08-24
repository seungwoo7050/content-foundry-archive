import {
  ContractError,
  type ContractIssue,
  type LoadedReleaseBundle,
  type NavigationItem,
} from "@content-foundry/content-contract";

import { getGeneratedRoutes } from "./generated-routes";

function validateItems(
  items: readonly NavigationItem[],
  base: string,
  generatedRoutes: ReadonlySet<string>,
  issues: ContractIssue[],
) {
  items.forEach((item, index) => {
    const path = `${base}/${index}`;
    if (!generatedRoutes.has(item.path)) {
      issues.push({
        path: `${path}/path`,
        message: `not a direct generated route: ${item.path}`,
      });
    }
    validateItems(item.children, `${path}/children`, generatedRoutes, issues);
  });
}

export function validateNavigationDestinations(
  bundle: LoadedReleaseBundle,
): LoadedReleaseBundle {
  const issues: ContractIssue[] = [];
  validateItems(
    bundle.navigation.items,
    "/navigation/items",
    getGeneratedRoutes(bundle),
    issues,
  );

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Navigation destinations do not resolve directly",
      issues,
    );
  }
  return bundle;
}
