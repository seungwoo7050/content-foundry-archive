export interface ArticleBreadcrumbSite {
  readonly name: string;
}

export interface ArticleBreadcrumbCategory {
  readonly slug: string;
  readonly label: string;
}

export interface ArticleBreadcrumbArticle {
  readonly title: string;
  readonly seo: { readonly canonicalPath: string };
}

export interface ArticleBreadcrumbItem {
  readonly label: string;
  readonly path: string;
  readonly current: boolean;
}

export function createArticleBreadcrumbs(
  site: ArticleBreadcrumbSite,
  category: ArticleBreadcrumbCategory,
  article: ArticleBreadcrumbArticle,
): readonly ArticleBreadcrumbItem[] {
  return [
    { label: site.name, path: "/", current: false },
    {
      label: category.label,
      path: `/category/${category.slug}`,
      current: false,
    },
    { label: article.title, path: article.seo.canonicalPath, current: true },
  ];
}
