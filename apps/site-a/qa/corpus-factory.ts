import type {
  PublishedArticleProjectionV4,
  PublishedStaticPageProjectionV4,
} from "@content-foundry/content-contract";

const QA_NOTICE = "QA 비운영 합성 자료";
type ArticleDetails = Pick<
  PublishedArticleProjectionV4,
  | "content"
  | "toc"
  | "faq"
  | "sourceDisclosures"
  | "relatedArticleIds"
  | "updateTriggers"
>;
type ArticleSeed = {
  index: number;
  categoryId: string;
  title?: string;
  slug?: string;
  updatedAt?: string;
} & Partial<ArticleDetails>;

export function createQaArticle(seed: ArticleSeed): PublishedArticleProjectionV4 {
  const ordinal = String(seed.index).padStart(3, "0");
  const slug = seed.slug ?? `qa-nonproduction-sample-${ordinal}`;
  const publishedAt = `2026-08-${String(seed.index).padStart(2, "0")}T01:00:00Z`;
  return {
    id: `ART-QA-${ordinal}`,
    revision: seed.updatedAt ? 2 : 1,
    slug,
    title: seed.title ?? `${QA_NOTICE} 안내 ${ordinal}`,
    summary: `${QA_NOTICE}의 화면 검증용 요약 ${ordinal}입니다.`,
    status: "published",
    categoryId: seed.categoryId,
    tagIds: ["qa-synthetic"],
    author: { displayName: "QA 비운영 편집실", profileId: "qa-owner" },
    publishedAt,
    updatedAt: seed.updatedAt ?? publishedAt,
    content: seed.content ?? [
      {
        type: "paragraph",
        markdown: `${QA_NOTICE} 본문 ${ordinal}입니다.`,
      },
    ],
    toc: seed.toc ?? [],
    faq: seed.faq ?? [],
    sourceDisclosures: seed.sourceDisclosures ?? [],
    relatedArticleIds: seed.relatedArticleIds ?? [],
    heroMediaId: `MED-QA-${String(((seed.index - 1) % 5) + 1).padStart(3, "0")}`,
    seo: {
      title: seed.title ?? `${QA_NOTICE} 안내 ${ordinal}`,
      description: `${QA_NOTICE} 검색 제외 설명 ${ordinal}`,
      canonicalPath: `/article/${slug}`,
      index: false,
      follow: true,
    },
    advertising: { enabled: false },
    updateTriggers: seed.updateTriggers ?? [],
  };
}

export function createQaPage(
  id: string,
  path: string,
  label: string,
): PublishedStaticPageProjectionV4 {
  const title = `QA 비운영 ${label}`;
  return {
    id,
    path,
    title,
    summary: `${title} 템플릿이며 실제 운영 문서가 아닙니다.`,
    content: [{ type: "paragraph", markdown: `${title} 합성 본문입니다.` }],
    seo: {
      title,
      description: `${title} 검색 제외 설명`,
      canonicalPath: path,
      index: false,
      follow: true,
    },
  };
}
