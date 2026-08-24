import { hasMaterialArticleUpdate } from "./article-update";
import { getSafeSourceHref } from "./safe-source-url";

export interface ArticleTrustRecord {
  readonly author: { readonly displayName: string };
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly sourceDisclosures: readonly {
    readonly label: string;
    readonly url: string;
  }[];
  readonly updateTriggers: readonly string[];
  readonly faq: readonly {
    readonly question: string;
    readonly answerMarkdown: string;
  }[];
}

export interface ArticleTrustSource {
  readonly site: {
    readonly locale: string;
    readonly timeZone: string;
    readonly author: { readonly displayName: string };
  };
  readonly pages: readonly { readonly path: string }[];
}

interface TrustDate {
  readonly dateTime: string;
  readonly label: string;
}

export interface ArticleTrustViewModel {
  readonly authorLabel: string;
  readonly operatorLabel: string;
  readonly published: TrustDate;
  readonly updated: TrustDate | null;
  readonly sources: readonly { readonly label: string; readonly href: string | null }[];
  readonly updateTriggers: readonly string[];
  readonly faq: readonly { readonly question: string; readonly answerText: string }[];
  readonly aboutPath: "/about" | null;
  readonly contactPath: "/contact" | null;
}

export function createArticleTrustViewModel(
  bundle: ArticleTrustSource,
  article: ArticleTrustRecord,
): ArticleTrustViewModel {
  const formatter = new Intl.DateTimeFormat(bundle.site.locale, {
    dateStyle: "long",
    timeZone: bundle.site.timeZone,
  });
  const toDate = (dateTime: string): TrustDate => ({
    dateTime,
    label: formatter.format(new Date(dateTime)),
  });
  const pagePaths = new Set(bundle.pages.map(({ path }) => path));

  return {
    authorLabel: article.author.displayName,
    operatorLabel: bundle.site.author.displayName,
    published: toDate(article.publishedAt),
    updated: hasMaterialArticleUpdate(article) ? toDate(article.updatedAt) : null,
    sources: article.sourceDisclosures.map(({ label, url }) => ({
      label,
      href: getSafeSourceHref(url),
    })),
    updateTriggers: [...article.updateTriggers],
    faq: article.faq.map(({ question, answerMarkdown }) => ({
      question,
      answerText: answerMarkdown,
    })),
    aboutPath: pagePaths.has("/about") ? "/about" : null,
    contactPath: pagePaths.has("/contact") ? "/contact" : null,
  };
}
