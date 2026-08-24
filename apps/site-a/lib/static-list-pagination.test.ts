import { describe, expect, it } from "vitest";

import {
  getStaticListAdditionalPages,
  getStaticListPageCount,
  getStaticListPagePath,
  paginateStaticList,
  resolveStaticListAdditionalPage,
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

  it("enumerates only page-two-and-later static parameters", () => {
    expect(getStaticListPageCount(0)).toBe(1);
    expect(getStaticListPageCount(25)).toBe(3);
    expect(getStaticListAdditionalPages(12)).toEqual([]);
    expect(getStaticListAdditionalPages(25)).toEqual([2, 3]);
    expect(() => getStaticListPageCount(-1)).toThrow(RangeError);
    expect(() => getStaticListPageCount(1.5)).toThrow(RangeError);
  });

  it("accepts only canonical in-range additional-page parameters", () => {
    expect(resolveStaticListAdditionalPage("2", 25)).toBe(2);
    expect(resolveStaticListAdditionalPage("3", 25)).toBe(3);
    expect(resolveStaticListAdditionalPage("1", 25)).toBeNull();
    expect(resolveStaticListAdditionalPage("02", 25)).toBeNull();
    expect(resolveStaticListAdditionalPage("2.0", 25)).toBeNull();
    expect(resolveStaticListAdditionalPage("4", 25)).toBeNull();
    expect(resolveStaticListAdditionalPage("9007199254740992", 25)).toBeNull();
  });
});
