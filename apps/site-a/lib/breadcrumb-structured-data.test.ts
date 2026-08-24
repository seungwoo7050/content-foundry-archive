import { describe, expect, it } from "vitest";

import { createBreadcrumbStructuredData } from "./breadcrumb-structured-data";

describe("breadcrumb structured data", () => {
  it("preserves the visible breadcrumb sequence as canonical URLs", () => {
    expect(
      createBreadcrumbStructuredData("https://example.com", [
        { label: "생활메모", path: "/", current: false },
        {
          label: "생활·행정",
          path: "/category/daily-admin",
          current: false,
        },
        {
          label: "정부24 주민등록등본 발급 방법",
          path: "/article/government24-resident-registration-guide",
          current: true,
        },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "생활메모",
          item: "https://example.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "생활·행정",
          item: "https://example.com/category/daily-admin",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "정부24 주민등록등본 발급 방법",
          item:
            "https://example.com/article/government24-resident-registration-guide",
        },
      ],
    });
  });
});
