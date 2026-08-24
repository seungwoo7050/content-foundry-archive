import {
  ContractError,
  type ContractIssue,
} from "@content-foundry/content-contract";

export interface GeneratedRouteSource {
  readonly articles: readonly {
    readonly seo: { readonly canonicalPath: string };
  }[];
  readonly taxonomy: {
    readonly categories: readonly { readonly slug: string }[];
  };
  readonly pages: readonly { readonly path: string }[];
}

export type RouteClaimKind =
  | "fixed-home"
  | "fixed-archive"
  | "fixed-not-found"
  | "fixed-release-identity"
  | "article"
  | "category"
  | "page";

export interface RouteClaim {
  readonly kind: RouteClaimKind;
  readonly navigable: boolean;
  readonly outputKind: "html" | "machine";
  readonly source: string;
}

interface RouteClaimCandidate extends RouteClaim {
  readonly path: string;
}

export function getRouteClaims(
  bundle: GeneratedRouteSource,
): ReadonlyMap<string, RouteClaim> {
  const candidates: RouteClaimCandidate[] = [
    {
      path: "/",
      kind: "fixed-home",
      navigable: true,
      outputKind: "html",
      source: "fixed home route",
    },
    {
      path: "/archive",
      kind: "fixed-archive",
      navigable: true,
      outputKind: "html",
      source: "fixed archive route",
    },
    {
      path: "/404",
      kind: "fixed-not-found",
      navigable: false,
      outputKind: "html",
      source: "fixed not-found route",
    },
    {
      path: "/_release.json",
      kind: "fixed-release-identity",
      navigable: false,
      outputKind: "machine",
      source: "fixed release-identity route",
    },
    ...bundle.articles.map((article, index) => ({
      path: article.seo.canonicalPath,
      kind: "article" as const,
      navigable: true,
      outputKind: "html" as const,
      source: `/articles/${index}/seo/canonicalPath`,
    })),
    ...bundle.taxonomy.categories.map((category, index) => ({
      path: `/category/${category.slug}`,
      kind: "category" as const,
      navigable: true,
      outputKind: "html" as const,
      source: `/taxonomy/categories/${index}/slug`,
    })),
    ...bundle.pages.map((page, index) => ({
      path: page.path,
      kind: "page" as const,
      navigable: true,
      outputKind: "html" as const,
      source: `/pages/${index}/path`,
    })),
  ];
  const claims = new Map<string, RouteClaim>();
  const issues: ContractIssue[] = [];

  for (const { path, ...claim } of candidates) {
    const first = claims.get(path);
    if (first) {
      issues.push({
        path: claim.source,
        message: `route ${path} is already claimed by ${first.kind} at ${first.source}`,
      });
    } else {
      claims.set(path, claim);
    }
  }

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Generated route claims collide",
      issues,
    );
  }
  return claims;
}
