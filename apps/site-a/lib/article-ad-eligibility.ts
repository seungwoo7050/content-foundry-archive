export interface ArticleAdEligibilityContext {
  readonly config: { readonly adsEnabled: boolean };
  readonly site: {
    readonly ads: {
      readonly provider: "disabled" | "adsense" | "other";
      readonly enabled: boolean;
    };
  };
}

export interface ArticleAdEligibilityRecord {
  readonly advertising: { readonly enabled: boolean };
}

export function isArticleAdvertisingEligible(
  context: ArticleAdEligibilityContext,
  article: ArticleAdEligibilityRecord,
): boolean {
  return (
    context.config.adsEnabled &&
    context.site.ads.enabled &&
    context.site.ads.provider === "adsense" &&
    article.advertising.enabled
  );
}
