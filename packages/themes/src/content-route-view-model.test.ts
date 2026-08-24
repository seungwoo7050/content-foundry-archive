import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";

import type {
  ArticleRouteViewModel,
  ContentRouteViewModel,
  StaticPageRouteViewModel,
} from "./content-route-view-model.js";
import type { EstimatedReadingTimeViewModel } from "./presentation-view-model.js";

describe("content route view models", () => {
  it("uses explicit React slots for already-safe rendered content", () => {
    expectTypeOf<ArticleRouteViewModel["hero"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<ArticleRouteViewModel["body"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<ArticleRouteViewModel["readerActions"]>().toEqualTypeOf<
      ReactNode | null | undefined
    >();
    expectTypeOf<StaticPageRouteViewModel["body"]>().toEqualTypeOf<ReactNode>();
  });

  it("keeps release-backed article navigation and ad eligibility explicit", () => {
    expectTypeOf<ArticleRouteViewModel["toc"]>().toEqualTypeOf<
      readonly { readonly id: string; readonly label: string; readonly level: number }[]
    >();
    expectTypeOf<
      ArticleRouteViewModel["advertisingEligible"]
    >().toEqualTypeOf<boolean>();
    expectTypeOf<ArticleRouteViewModel["estimatedReadingTime"]>()
      .toEqualTypeOf<EstimatedReadingTimeViewModel | undefined>();
  });

  it("discriminates the five public content routes", () => {
    expectTypeOf<ContentRouteViewModel["kind"]>().toEqualTypeOf<
      "home" | "category" | "article" | "static-page" | "archive"
    >();
  });

  it("does not expose producer-owned records through article routes", () => {
    expectTypeOf<ArticleRouteViewModel>().not.toHaveProperty("bundle");
    expectTypeOf<ArticleRouteViewModel>().not.toHaveProperty("contractVersion");
    expectTypeOf<ArticleRouteViewModel>().not.toHaveProperty("categoryId");
    expectTypeOf<ArticleRouteViewModel>().not.toHaveProperty("media");
  });
});
