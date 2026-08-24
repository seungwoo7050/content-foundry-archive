import type {
  PublicSiteTaxonomy,
  PublishedArticleProjection,
} from "@content-foundry/content-contract";

import { getCategoryDescription } from "../lib/category-metadata";
import { ArticleCard } from "./article-card";

type Category = PublicSiteTaxonomy["categories"][number];

interface CategoryListingProps {
  readonly category: Category;
  readonly articles: readonly PublishedArticleProjection[];
  readonly locale: string;
  readonly timeZone: string;
}

export function CategoryListing({
  category,
  articles,
  locale,
  timeZone,
}: CategoryListingProps) {
  return (
    <div className="category-page">
      <header>
        <h1>{category.label}</h1>
        <p>{getCategoryDescription(category)}</p>
      </header>
      <section aria-labelledby="category-recent">
        <h2 id="category-recent">최근 안내</h2>
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                locale={locale}
                timeZone={timeZone}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
