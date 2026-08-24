export interface WebsiteStructuredDataContext {
  readonly canonicalOrigin: string;
  readonly site: {
    readonly name: string;
    readonly shortName: string;
    readonly description: string;
    readonly locale: string;
    readonly author: { readonly displayName: string };
  };
}

export function createWebsiteStructuredData(
  context: WebsiteStructuredDataContext,
): Readonly<Record<string, unknown>> {
  const { site } = context;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    ...(site.shortName !== site.name ? { alternateName: site.shortName } : {}),
    url: new URL("/", context.canonicalOrigin).href,
    description: site.description,
    inLanguage: site.locale,
    publisher: { "@type": "Person", name: site.author.displayName },
  };
}
