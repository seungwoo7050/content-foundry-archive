import { describe, expect, it } from "vitest";

import {
  getStaticListPagePath,
  paginateStaticList,
  STATIC_LIST_PAGE_SIZE,
} from "./static-list-pagination";

describe("static list pagination", () => {
  const records = Array.from({ length: 25 }, (_, index) => index + 1);

  it("keeps page one on the stable base URL", () => {
    const page = paginateStaticList(records, 1, "/archive");

    expect(STATIC_LIST_PAGE_SIZE).toBe(12);
    expect(page.records).toEqual(records.slice(0, 12));
    expect(page.pagination).toMatchObject({
      currentPage: 1,
      pageCount: 3,
      previous: null,
      next: { href: "/archive/page/2", label: "다음 페이지" },
    });
  });

  it("provides real previous and next paths for an interior category page", () => {
    expect(paginateStaticList(records, 2, "/category/daily-admin")).toEqual({
      records: records.slice(12, 24),
      pagination: {
        currentPage: 2,
        pageCount: 3,
        previous: { href: "/category/daily-admin", label: "이전 페이지" },
        next: { href: "/category/daily-admin/page/3", label: "다음 페이지" },
      },
    });
  });

  it("fails closed for non-integer and out-of-range pages", () => {
    expect(() => getStaticListPagePath("/archive", 1.5)).toThrow(RangeError);
    expect(() => paginateStaticList(records, 0, "/archive")).toThrow(RangeError);
    expect(() => paginateStaticList(records, 4, "/archive")).toThrow(RangeError);
  });
});
