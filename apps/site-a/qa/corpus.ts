import type {
  PublicRouteDispositionsV4,
  PublicSiteConfigurationV4,
  PublicSitePresentationProjection,
  PublicSiteTaxonomyV4,
} from "@content-foundry/content-contract";

import { qaArticles } from "./articles";
import { createQaPage } from "./corpus-factory";

export const QA_ORIGIN = "https://corpus.qa.public-sites.example";
export const QA_MEDIA_IDS = Array.from(
  { length: 5 },
  (_, index) => `MED-QA-${String(index + 1).padStart(3, "0")}`,
);
const categorySeeds = [
  ["field-notes", "QA 비운영 현장 메모"],
  ["patterns", "QA 비운영 패턴"],
  ["reference", "QA 비운영 참고"],
  ["studio", "QA 비운영 스튜디오"],
  ["updates", "QA 비운영 업데이트"],
] as const;
const taxonomy: PublicSiteTaxonomyV4 = {
  categories: categorySeeds.map(([id, label]) => ({
    id,
    slug: id,
    label,
    description: `${label} 합성 카테고리`,
  })),
  tags: [
    {
      id: "qa-synthetic",
      slug: "qa-synthetic",
      label: "QA 비운영 합성",
      description: "실제 정보가 아닌 화면 검증 자료",
    },
  ],
};
const site: PublicSiteConfigurationV4 = {
  id: "site-a",
  origin: QA_ORIGIN,
  locale: "ko-KR",
  timeZone: "Asia/Seoul",
  name: "QA 비운영 Public Sites",
  shortName: "QA 비운영",
  description: "QA 비운영 합성 콘텐츠 전용 사이트",
  defaultTheme: "minimal-knowledge-base",
  defaultSkin: "calm-blue",
  author: { displayName: "QA 비운영 편집실", profileId: "qa-owner" },
  analytics: { provider: "disabled", publicMeasurementId: null },
  ads: { provider: "disabled", enabled: false, publicClientId: null },
  search: { enabled: true },
  featureFlags: { localBookmarks: true },
};
const pages = [
  createQaPage("about", "/about", "소개"),
  createQaPage("contact", "/contact", "연락"),
  createQaPage("privacy", "/privacy", "개인정보 템플릿"),
  createQaPage("advertising-disclosure", "/advertising-disclosure", "광고 공개 템플릿"),
];
const presentation: PublicSitePresentationProjection = {
  home: {
    featuredArticleIds: ["ART-QA-001"],
    currentArticleIds: ["ART-QA-002", "ART-QA-014"],
    evergreenArticleIds: ["ART-QA-003"],
  },
  categoryHighlights: categorySeeds.map(([categoryId], index) => ({
    categoryId,
    articleIds: [
      `ART-QA-${String(index === 0 ? 1 : index + 13).padStart(3, "0")}`,
    ],
  })),
  brand: {
    logoMediaId: null,
    faviconMediaId: "MED-QA-005",
    socialImageMediaId: "MED-QA-001",
  },
};
const redirects: PublicRouteDispositionsV4 = {
  items: [
    {
      type: "gone",
      path: "/retired/qa-old-guide",
      status: 410,
      replacementPath: null,
    },
  ],
};

export const qaCorpus = {
  siteWideNoindex: true,
  site,
  taxonomy,
  articles: qaArticles,
  pages,
  presentation,
  redirects,
  mediaIds: QA_MEDIA_IDS,
};
