import type { ReactNode } from "react";

import type { StaticPageRouteViewModel } from "@content-foundry/themes";

import type { PageRouteRecord } from "./page-route";

export interface StaticPageThemeContext {
  readonly bundle: { readonly site: { readonly name: string } };
}

export interface StaticPageThemeRecord extends PageRouteRecord {
  readonly title: string;
  readonly summary: string;
}

export function createStaticPageThemeViewModel(
  context: StaticPageThemeContext,
  page: StaticPageThemeRecord,
  body: ReactNode,
): StaticPageRouteViewModel {
  return {
    kind: "static-page",
    path: page.path,
    heading: page.title,
    description: page.summary,
    breadcrumbs: [
      { href: "/", label: context.bundle.site.name },
      { href: page.path, label: page.title },
    ],
    body,
  };
}
