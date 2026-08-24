import type { ArticleBreadcrumbItem } from "../lib/article-breadcrumbs";

interface ArticleBreadcrumbsProps {
  readonly items: readonly ArticleBreadcrumbItem[];
}

export function ArticleBreadcrumbs({ items }: ArticleBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="현재 위치">
      <ol>
        {items.map((item) => (
          <li key={item.path}>
            {item.current ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.path}>{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
