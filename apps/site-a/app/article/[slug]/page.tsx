import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleReaderActions } from "../../../components/article-reader-actions";
import { ImageBlock } from "../../../components/image-block";
import { StructuredData } from "../../../components/structured-data";
import { VersionedContentBlocks } from "../../../components/versioned-content-blocks";
import { createArticleMetadata } from "../../../lib/article-metadata";
import { createArticleThemeViewModel } from "../../../lib/article-theme-view-model";
import {
  findArticleBySlug,
  getArticlePageStaticParams,
} from "../../../lib/article-route";
import { createArticleBreadcrumbs } from "../../../lib/article-breadcrumbs";
import { createArticleStructuredData } from "../../../lib/article-structured-data";
import { createBreadcrumbStructuredData } from "../../../lib/breadcrumb-structured-data";
import { findGoneRoute } from "../../../lib/gone-route";
import type { VersionedSiteReleaseContext } from "../../../lib/load-site-release";
import { createRetiredRouteMetadata } from "../../../lib/retired-route-metadata";
import { resolveSiteAdSlots } from "../../../lib/resolve-site-ad-slots";
import { getVersionedSiteReleaseContext } from "../../../lib/site-release";
import { createRetiredThemeViewModel } from "../../../lib/status-theme-view-model";
import { renderThemePage } from "../../../lib/theme-page";

export const dynamicParams = false;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface ReaderActionArticle {
  readonly id: string;
  readonly seo: { readonly canonicalPath: string };
}

export function generateStaticParams() {
  return getArticlePageStaticParams(getVersionedSiteReleaseContext().bundle);
}

function createReaderActions(
  context: VersionedSiteReleaseContext,
  article: ReaderActionArticle,
) {
  return (
    <ArticleReaderActions
      articleId={article.id}
      canonicalUrl={new URL(
        article.seo.canonicalPath,
        context.canonicalOrigin,
      ).href}
      localBookmarksEnabled={
        context.bundle.site.featureFlags.localBookmarks === true
      }
      siteId={context.bundle.release.siteId}
    />
  );
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

function createArticleSlots(context: VersionedSiteReleaseContext, slug: string) {
  if (context.contractVersion === "3.0.0") {
    const article = findArticleBySlug(context.bundle, slug);
    if (!article) notFound();
    return {
      readerActions: createReaderActions(context, article),
      hero: article.heroMediaId === null ? null : (
        <ImageBlock
          assets={context.mediaAssets}
          block={{ type: "image", mediaId: article.heroMediaId }}
        />
      ),
      body: <VersionedContentBlocks
        blocks={article.content}
        context={{
          mediaAssets: context.mediaAssets,
          nicheComponents: context.nicheComponents,
          siteId: context.bundle.release.siteId,
        }}
        contractVersion="3.0.0"
      />,
    };
  }

  const article = findArticleBySlug(context.bundle, slug);
  if (!article) notFound();
  return {
    readerActions: createReaderActions(context, article),
    hero: null,
    body: (
      <VersionedContentBlocks
        blocks={article.content}
        contractVersion="2.0.0"
      />
    ),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const context = getVersionedSiteReleaseContext();
  const { bundle } = context;
  const article = findArticleBySlug(bundle, slug);

  if (!article) {
    const retiredRoute = findGoneRoute(bundle, `/article/${slug}`);
    if (retiredRoute) {
      return renderThemePage(
        bundle,
        createRetiredThemeViewModel(bundle, retiredRoute),
      );
    }
    notFound();
  }

  const category = bundle.taxonomy.categories.find(
    ({ id }) => id === article.categoryId,
  );
  if (!category) notFound();

  const breadcrumbs = createArticleBreadcrumbs(bundle.site, category, article);
  const route = createArticleThemeViewModel(
    context,
    article,
    category,
    createArticleSlots(context, slug),
  );

  return (
    <>
      <StructuredData
        value={createArticleStructuredData(
          { canonicalOrigin: context.canonicalOrigin, site: bundle.site },
          article,
        )}
      />
      <StructuredData
        value={createBreadcrumbStructuredData(
          context.canonicalOrigin,
          breadcrumbs,
        )}
      />
      {renderThemePage(
        bundle,
        route,
        resolveSiteAdSlots(context, process.env),
      )}
    </>
  );
}
