import { describe, expect, it } from "vitest";

import { createRetiredRouteMetadata } from "./retired-route-metadata";

describe("retired route metadata", () => {
  it("always suppresses indexing, following, and canonical claims", () => {
    expect(createRetiredRouteMetadata()).toMatchObject({
      title: "더 이상 제공하지 않는 페이지",
      description: "이 주소의 콘텐츠는 더 이상 제공하지 않습니다.",
      alternates: { canonical: null },
      robots: { index: false, follow: false },
      openGraph: { type: "website", images: [] },
      twitter: { card: "summary", images: [] },
    });
  });
});
