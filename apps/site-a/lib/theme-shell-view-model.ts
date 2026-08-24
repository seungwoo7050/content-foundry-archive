import type {
  NavigationItemViewModel,
  SiteShellViewModel,
} from "@content-foundry/themes";

interface ThemeShellNavigationRecord {
  readonly label: string;
  readonly path: string;
  readonly children: readonly ThemeShellNavigationRecord[];
}

export interface ThemeShellSource {
  readonly release: { readonly createdAt: string };
  readonly site: {
    readonly locale: string;
    readonly name: string;
    readonly description: string;
    readonly author: { readonly displayName: string };
  };
  readonly navigation: {
    readonly items: readonly ThemeShellNavigationRecord[];
  };
  readonly pages: readonly {
    readonly path: string;
    readonly title: string;
  }[];
}

export const SITE_FOOTER_PAGE_PATHS = Object.freeze([
  "/about",
  "/contact",
  "/privacy",
  "/advertising-disclosure",
] as const);

function createNavigationItem(
  item: ThemeShellNavigationRecord,
): NavigationItemViewModel {
  return {
    link: { href: item.path, label: item.label },
    children: item.children.map(createNavigationItem),
  };
}

export function createThemeShellViewModel(
  bundle: ThemeShellSource,
): SiteShellViewModel {
  const releaseYear = new Date(bundle.release.createdAt).getUTCFullYear();
  const pageByPath = new Map(bundle.pages.map((page) => [page.path, page]));

  return {
    locale: bundle.site.locale,
    skipLink: { href: "#main-content", label: "본문으로 바로가기" },
    brand: { href: "/", label: bundle.site.name },
    description: bundle.site.description,
    primaryNavigation: bundle.navigation.items.map(createNavigationItem),
    footerNavigation: SITE_FOOTER_PAGE_PATHS.flatMap((path) => {
      const page = pageByPath.get(path);
      return page ? [{ href: page.path, label: page.title }] : [];
    }),
    footerText: `© ${releaseYear} ${bundle.site.name} · 운영: ${bundle.site.author.displayName}`,
  };
}
