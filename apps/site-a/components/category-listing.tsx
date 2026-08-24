import {
  getCategoryDescription,
  type CategoryMetadataSource,
} from "../lib/category-metadata";
import { ArticleCard, type ArticleCardSource } from "./article-card";
import { CategoryTopics, type CategoryTopic } from "./category-topics";

export interface CategoryListingArticle extends ArticleCardSource {
  readonly id: string;
}

interface CategoryListingProps {
  readonly category: CategoryMetadataSource;
  readonly articles: readonly CategoryListingArticle[];
  readonly tags: readonly CategoryTopic[];
  readonly locale: string;
  readonly timeZone: string;
}

export function CategoryListing({
  category,
  articles,
  tags,
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
      <CategoryTopics tags={tags} />
    </div>
  );
}
