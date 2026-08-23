import { notFound } from "next/navigation";

import { ContentBlocks } from "../../../components/content-blocks";
import {
  findArticleBySlug,
  getArticleStaticParams,
} from "../../../lib/article-route";
import { getSiteReleaseContext } from "../../../lib/site-release";

export const dynamicParams = false;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getArticleStaticParams(getSiteReleaseContext().bundle);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { bundle } = getSiteReleaseContext();
  const article = findArticleBySlug(bundle, slug);

  if (!article) {
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
    <article>
      <header>
        {category ? <p>{category.label}</p> : null}
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <dl>
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
      <div>
        <ContentBlocks blocks={article.content} />
      </div>
    </article>
  );
}
