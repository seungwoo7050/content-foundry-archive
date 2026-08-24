import {
  ContractError,
  type ContractIssue,
} from "@content-foundry/content-contract";

export interface PageRouteRecord {
  readonly path: string;
}

export interface PageRouteSource<
  TPage extends PageRouteRecord = PageRouteRecord,
> {
  readonly pages: readonly TPage[];
}

const reservedNamespaces = [
  ["/article", "article route namespace"],
  ["/category", "category route namespace"],
  ["/index", "Next static export namespace"],
] as const;

function validatePageRouteOwnership(bundle: PageRouteSource) {
  const issues: ContractIssue[] = [];
  bundle.pages.forEach((page, index) => {
    let owner = page.path === "/404" ? "fixed not-found route" : undefined;
    for (const [prefix, label] of reservedNamespaces) {
      if (page.path === prefix || page.path.startsWith(`${prefix}/`)) {
        owner = label;
        break;
      }
    }
    if (owner !== undefined) {
      issues.push({
        path: `/pages/${index}/path`,
        message: `route ${page.path} conflicts with ${owner}`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Static page routes are inconsistent",
      issues,
    );
  }
}

export function getPageStaticParams(bundle: PageRouteSource) {
  validatePageRouteOwnership(bundle);
  return bundle.pages.map((page) => ({
    pagePath: page.path.slice(1).split("/"),
  }));
}

export function findPageByPathSegments<TPage extends PageRouteRecord>(
  bundle: PageRouteSource<TPage>,
  pagePath: readonly string[],
): TPage | undefined {
  const path = `/${pagePath.join("/")}`;
  return bundle.pages.find((page) => page.path === path);
}
