import type { PaginationViewModel } from "@content-foundry/themes";

export const STATIC_LIST_PAGE_SIZE = 12;

export function getStaticListPageCount(recordCount: number): number {
  if (!Number.isSafeInteger(recordCount) || recordCount < 0) {
    throw new RangeError(`Static list record count must be a non-negative integer: ${recordCount}`);
  }
  return Math.max(1, Math.ceil(recordCount / STATIC_LIST_PAGE_SIZE));
}

export function getStaticListAdditionalPages(recordCount: number): number[] {
  const pageCount = getStaticListPageCount(recordCount);
  return Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
}

export function resolveStaticListAdditionalPage(
  value: string,
  recordCount: number,
): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  const pageCount = getStaticListPageCount(recordCount);
  return Number.isSafeInteger(page) && page >= 2 && page <= pageCount
    ? page
    : null;
}

export function getStaticListPagePath(basePath: string, page: number): string {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new RangeError(`Static list page must be a positive integer: ${page}`);
  }
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

export function paginateStaticList<T>(
  records: readonly T[],
  currentPage: number,
  basePath: string,
): { readonly records: readonly T[]; readonly pagination: PaginationViewModel } {
  const pageCount = getStaticListPageCount(records.length);
  if (!Number.isSafeInteger(currentPage) || currentPage < 1 || currentPage > pageCount) {
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
