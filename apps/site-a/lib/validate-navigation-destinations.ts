import {
  ContractError,
  type ContractIssue,
} from "@content-foundry/content-contract";

import { getGeneratedRoutes } from "./generated-routes";
import { type GeneratedRouteSource } from "./route-claims";

interface RouteNavigationItem {
  readonly path: string;
  readonly children: readonly RouteNavigationItem[];
}

export interface NavigationRouteSource extends GeneratedRouteSource {
  readonly navigation: { readonly items: readonly RouteNavigationItem[] };
}

function validateItems(
  items: readonly RouteNavigationItem[],
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

export function validateNavigationDestinations<T extends NavigationRouteSource>(
  bundle: T,
): T {
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
