import { describe, expect, it } from "vitest";

import { createNotFoundRouteMetadata } from "./not-found-route-metadata";

describe("not-found route metadata", () => {
  it("suppresses indexing, following, and canonical claims", () => {
    expect(createNotFoundRouteMetadata()).toMatchObject({
      title: "페이지를 찾을 수 없습니다",
      description: "요청한 주소의 페이지를 찾을 수 없습니다.",
      alternates: { canonical: null },
      robots: { index: false, follow: false },
      openGraph: { type: "website", images: [] },
      twitter: { card: "summary", images: [] },
    });
  });
});
