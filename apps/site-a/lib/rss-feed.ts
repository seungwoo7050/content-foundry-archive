import {
  getArchiveEntries,
  type ArchiveArticleRecord,
  type ArchiveCategoryRecord,
  type ArchiveSource,
} from "./archive-view-model";
import { escapeXmlText } from "./xml-text";

export interface RssArticleRecord extends ArchiveArticleRecord {
  readonly title: string;
  readonly summary: string;
  readonly seo: {
    readonly canonicalPath: string;
    readonly index: boolean;
  };
}

export interface RssFeedSource
  extends ArchiveSource<RssArticleRecord, ArchiveCategoryRecord> {
  readonly site: {
    readonly name: string;
    readonly description: string;
    readonly locale: string;
  };
}

function renderItem(
  canonicalOrigin: string,
  article: RssArticleRecord,
  category: ArchiveCategoryRecord,
) {
  const url = escapeXmlText(
    new URL(article.seo.canonicalPath, canonicalOrigin).href,
  );
  return [
    "    <item>",
    `      <title>${escapeXmlText(article.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <description>${escapeXmlText(article.summary)}</description>`,
    `      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`,
    `      <category>${escapeXmlText(category.label)}</category>`,
    "    </item>",
  ].join("\n");
}

export function createRssFeed(
  canonicalOrigin: string,
  bundle: RssFeedSource,
): string {
  const items = getArchiveEntries(bundle)
    .filter(({ article }) => article.seo.index)
    .map(({ article, category }) =>
      renderItem(canonicalOrigin, article, category),
    );
  const homeUrl = escapeXmlText(new URL("/", canonicalOrigin).href);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXmlText(bundle.site.name)}</title>`,
    `    <link>${homeUrl}</link>`,
    `    <description>${escapeXmlText(bundle.site.description)}</description>`,
    `    <language>${escapeXmlText(bundle.site.locale)}</language>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
