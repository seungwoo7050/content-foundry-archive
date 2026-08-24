import type {
  NotFoundRouteViewModel,
  RetiredRouteViewModel,
} from "@content-foundry/themes";

import type { GoneRouteRecord } from "./gone-route";

export interface StatusThemeSource {
  readonly site: { readonly name: string };
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
  };
}

export function createRetiredThemeViewModel(
  bundle: StatusThemeSource,
  route: GoneRouteRecord,
): RetiredRouteViewModel {
  const replacement = route.replacementPath !== null;
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
    action: {
      href: route.replacementPath ?? "/archive",
      label: replacement ? "대신 볼 수 있는 안내로 이동" : "전체 글 보기",
    },
  };
}
