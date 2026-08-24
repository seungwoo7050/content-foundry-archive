import {
  createReleaseIdentity,
  type ReleaseIdentity,
  type ReleaseIdentitySource,
} from "./release-identity";

export interface SearchRouteSource extends ReleaseIdentitySource {
  readonly site: {
    readonly locale: string;
    readonly timeZone: string;
  };
  readonly taxonomy: {
    readonly categories: readonly {
      readonly id: string;
      readonly slug: string;
      readonly label: string;
    }[];
  };
}

export interface SearchRouteViewModel {
  readonly release: ReleaseIdentity;
  readonly locale: string;
  readonly timeZone: string;
  readonly searchIndexPath: "/search-index.json";
  readonly categories: readonly {
    readonly id: string;
    readonly href: string;
    readonly label: string;
  }[];
}

export function createSearchRouteViewModel(
  bundle: SearchRouteSource,
): SearchRouteViewModel {
  return {
    release: createReleaseIdentity(bundle),
    locale: bundle.site.locale,
    timeZone: bundle.site.timeZone,
    searchIndexPath: "/search-index.json",
    categories: bundle.taxonomy.categories
      .map(({ id, slug, label }) => ({
        id,
        href: `/category/${slug}`,
        label,
      }))
      .sort((left, right) => {
        if (left.href < right.href) return -1;
        if (left.href > right.href) return 1;
        return 0;
      }),
  };
}
