import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RetiredRoute } from "../../../components/retired-route";
import { VersionedContentBlocks } from "../../../components/versioned-content-blocks";
import { createArticleMetadata } from "../../../lib/article-metadata";
import {
  findArticleBySlug,
  getArticlePageStaticParams,
} from "../../../lib/article-route";
import { findGoneRoute } from "../../../lib/gone-route";
import type { VersionedSiteReleaseContext } from "../../../lib/load-site-release";
import { createRetiredRouteMetadata } from "../../../lib/retired-route-metadata";
import { getVersionedSiteReleaseContext } from "../../../lib/site-release";

export const dynamicParams = false;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getArticlePageStaticParams(getVersionedSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = getVersionedSiteReleaseContext();
  const article = findArticleBySlug(context.bundle, slug);

  if (!article) {
    if (findGoneRoute(context.bundle, `/article/${slug}`)) {
      return createRetiredRouteMetadata();
    }
    notFound();
  }

  return createArticleMetadata(context, article);
}

function renderArticleContent(context: VersionedSiteReleaseContext, slug: string) {
  if (context.contractVersion === "3.0.0") {
    const article = findArticleBySlug(context.bundle, slug);
    if (!article) notFound();
    return (
      <VersionedContentBlocks
        blocks={article.content}
        context={{
          mediaAssets: context.mediaAssets,
          nicheComponents: context.nicheComponents,
          siteId: context.bundle.release.siteId,
        }}
        contractVersion="3.0.0"
      />
    );
  }

  const article = findArticleBySlug(context.bundle, slug);
  if (!article) notFound();
  return <VersionedContentBlocks blocks={article.content} contractVersion="2.0.0" />;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const context = getVersionedSiteReleaseContext();
  const { bundle } = context;
  const article = findArticleBySlug(bundle, slug);

  if (!article) {
    const retiredRoute = findGoneRoute(bundle, `/article/${slug}`);
    if (retiredRoute) {
      return (
        <RetiredRoute
          path={retiredRoute.path}
          replacementPath={retiredRoute.replacementPath}
        />
      );
    }
    notFound();
  }

  const category = bundle.taxonomy.categories.find(
    ({ id }) => id === article.categoryId,
  );
  const dateFormatter = new Intl.DateTimeFormat(bundle.site.locale, {
    dateStyle: "long",
    timeZone: bundle.site.timeZone,
  });

  return (
    <article className="article-page">
      <header className="article-header">
        {category ? <p>{category.label}</p> : null}
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <dl className="article-meta">
          <div>
            <dt>작성</dt>
            <dd>{article.author.displayName}</dd>
          </div>
          <div>
            <dt>게시</dt>
            <dd>
              <time dateTime={article.publishedAt}>
                {dateFormatter.format(new Date(article.publishedAt))}
              </time>
            </dd>
          </div>
          <div>
            <dt>수정</dt>
            <dd>
              <time dateTime={article.updatedAt}>
                {dateFormatter.format(new Date(article.updatedAt))}
              </time>
            </dd>
          </div>
        </dl>
      </header>
      <div className="article-content">{renderArticleContent(context, slug)}</div>
    </article>
  );
}
