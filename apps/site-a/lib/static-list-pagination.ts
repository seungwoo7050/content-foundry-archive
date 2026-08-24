import type { PaginationViewModel } from "@content-foundry/themes";

export const STATIC_LIST_PAGE_SIZE = 12;

export function getStaticListPagePath(basePath: string, page: number): string {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError(`Static list page must be a positive integer: ${page}`);
  }
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

export function paginateStaticList<T>(
  records: readonly T[],
  currentPage: number,
  basePath: string,
): { readonly records: readonly T[]; readonly pagination: PaginationViewModel } {
  const pageCount = Math.max(1, Math.ceil(records.length / STATIC_LIST_PAGE_SIZE));
  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > pageCount) {
    throw new RangeError(
      `Static list page ${currentPage} is outside the available range 1-${pageCount}`,
    );
  }
  const start = (currentPage - 1) * STATIC_LIST_PAGE_SIZE;
  return {
    records: records.slice(start, start + STATIC_LIST_PAGE_SIZE),
    pagination: {
      currentPage,
      pageCount,
      previous: currentPage > 1
        ? { href: getStaticListPagePath(basePath, currentPage - 1), label: "이전 페이지" }
        : null,
      next: currentPage < pageCount
        ? { href: getStaticListPagePath(basePath, currentPage + 1), label: "다음 페이지" }
        : null,
    },
  };
}
