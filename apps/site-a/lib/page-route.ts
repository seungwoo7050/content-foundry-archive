import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

export function getPageStaticParams(bundle: LoadedReleaseBundle) {
  return bundle.pages.map((page) => ({
    pagePath: page.path.slice(1).split("/"),
  }));
}

export function findPageByPathSegments(
  bundle: LoadedReleaseBundle,
  pagePath: readonly string[],
) {
  const path = `/${pagePath.join("/")}`;
  return bundle.pages.find((page) => page.path === path);
}
