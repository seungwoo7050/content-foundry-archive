import type { ReactNode } from "react";

import type { SearchRouteViewModel } from "@content-foundry/themes";

export interface SearchThemePageSource {
  readonly site: { readonly name: string };
}

export function createSearchThemePageViewModel(
  bundle: SearchThemePageSource,
  client: ReactNode,
): SearchRouteViewModel {
  return {
    kind: "search",
    path: "/search",
    heading: "검색",
    description: "게시된 안내를 검색합니다. 검색어는 외부로 전송하지 않습니다.",
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: "/search", label: "검색" },
    ],
    client,
  };
}
