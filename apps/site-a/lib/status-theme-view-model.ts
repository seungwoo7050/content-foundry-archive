import type {
  NotFoundRouteViewModel,
  RetiredRouteViewModel,
  StateRecoveryLinkViewModel,
} from "@content-foundry/themes";

import type { GoneRouteRecord } from "./gone-route";

export interface StatusThemeSource {
  readonly site: {
    readonly name: string;
    readonly search: { readonly enabled: boolean };
  };
  readonly taxonomy: {
    readonly categories: readonly {
      readonly slug: string;
      readonly label: string;
    }[];
  };
  readonly articles: readonly {
    readonly id: string;
    readonly title: string;
    readonly updatedAt: string;
    readonly seo: { readonly canonicalPath: string };
  }[];
}

function compareRecentArticles(
  left: StatusThemeSource["articles"][number],
  right: StatusThemeSource["articles"][number],
) {
  const updatedDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  return updatedDifference || left.id.localeCompare(right.id);
}

function createRecoveryLinks(
  bundle: StatusThemeSource,
  excludedHrefs: readonly string[],
): readonly StateRecoveryLinkViewModel[] {
  const seen = new Set(excludedHrefs);
  const links: StateRecoveryLinkViewModel[] = [];
  const add = (link: StateRecoveryLinkViewModel) => {
    if (seen.has(link.href)) return;
    seen.add(link.href);
    links.push(link);
  };

  if (bundle.site.search.enabled) {
    add({ kind: "search", href: "/search", label: "사이트 검색" });
  }
  for (const category of bundle.taxonomy.categories) {
    add({
      kind: "category",
      href: `/category/${category.slug}`,
      label: category.label,
    });
  }
  const recent = [...bundle.articles]
    .sort(compareRecentArticles)
    .find(({ seo }) => !seen.has(seo.canonicalPath));
  if (recent) {
    add({
      kind: "replacement",
      href: recent.seo.canonicalPath,
      label: `최근 안내: ${recent.title}`,
    });
  }
  return links;
}

export function createNotFoundThemeViewModel(
  bundle: StatusThemeSource,
): NotFoundRouteViewModel {
  return {
    kind: "not-found",
    path: "/404",
    heading: "페이지를 찾을 수 없습니다",
    description: `주소가 바뀌었거나 존재하지 않는 페이지입니다. ${bundle.site.name} 홈에서 최신 안내를 확인해 주세요.`,
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: "/404", label: "페이지를 찾을 수 없습니다" },
    ],
    statusCode: 404,
    action: { href: "/", label: `${bundle.site.name} 홈으로 돌아가기` },
    recoveryLinks: createRecoveryLinks(bundle, ["/"]),
  };
}

export function createRetiredThemeViewModel(
  bundle: StatusThemeSource,
  route: GoneRouteRecord,
): RetiredRouteViewModel {
  const replacement = route.replacementPath !== null;
  const action = {
    href: route.replacementPath ?? "/archive",
    label: replacement ? "대신 볼 수 있는 안내로 이동" : "전체 글 보기",
  };
  return {
    kind: "retired",
    path: route.path,
    heading: "더 이상 제공하지 않는 페이지입니다",
    description: `${route.path} 주소의 콘텐츠는 더 이상 제공하지 않습니다.`,
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: route.path, label: "더 이상 제공하지 않는 페이지입니다" },
    ],
    statusCode: 410,
    action,
    recoveryLinks: createRecoveryLinks(bundle, [action.href]),
  };
}
