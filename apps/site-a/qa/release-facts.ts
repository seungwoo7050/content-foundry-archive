import type { LoadedReleaseBundleV4, NavigationItemV4 } from "@content-foundry/content-contract";
import type { SkinId, ThemeId } from "@content-foundry/themes";

import { qaCorpus } from "./corpus";
import { qaMediaAssets } from "./media-assets";

export type QaReleaseOrigin = `https://${string}.qa.public-sites.example`;
export type QaReleaseVariant = {
  readonly theme: ThemeId;
  readonly skin: SkinId;
  readonly origin: QaReleaseOrigin;
};
export type QaReleaseFacts = Pick<
  LoadedReleaseBundleV4,
  "release" | "site" | "navigation" | "mediaManifest"
>;

function item(id: string, label: string, path: string): NavigationItemV4 {
  return { id, label, path, children: [] };
}

export function projectQaReleaseFacts({
  theme,
  skin,
  origin,
}: QaReleaseVariant): QaReleaseFacts {
  const release: QaReleaseFacts["release"] = {
    contractVersion: "4.0.0",
    releaseId: "REL-QA-20260825-000001",
    siteId: qaCorpus.site.id,
    createdAt: "2026-08-25T00:00:00Z",
    contentRevision: 1,
    siteConfigRevision: 1,
    articleCount: qaCorpus.articles.length,
    pageCount: qaCorpus.pages.length,
    defaultTheme: theme,
    defaultSkin: skin,
    bundleChecksum:
      "sha256:0000000000000000000000000000000000000000000000000000000000000000",
  };
  const site = { ...qaCorpus.site, origin, defaultTheme: theme, defaultSkin: skin };
  const navigation = {
    items: [
      item("home", "QA 비운영 홈", "/"),
      ...qaCorpus.taxonomy.categories.map(({ id, label, slug }) =>
        item(id, label, `/category/${slug}`),
      ),
      item("archive", "QA 비운영 아카이브", "/archive"),
      item("about", "QA 비운영 소개", "/about"),
      item("privacy", "QA 비운영 개인정보 템플릿", "/privacy"),
      item("advertising-disclosure", "QA 비운영 광고 공개 템플릿", "/advertising-disclosure"),
    ],
  };
  const mediaManifest = {
    items: qaMediaAssets.map(({ sourcePath, ...asset }) => ({
      ...asset,
      kind: "image" as const,
      source: "bundle" as const,
      path: `media/${sourcePath}`,
    })),
  };
  return { release, site, navigation, mediaManifest };
}
