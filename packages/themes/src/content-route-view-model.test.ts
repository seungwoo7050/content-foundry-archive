import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";

import type {
  ArticleRouteViewModel,
  ContentRouteViewModel,
  StaticPageRouteViewModel,
} from "./content-route-view-model.js";

describe("content route view models", () => {
  it("uses explicit React slots for already-safe rendered content", () => {
    expectTypeOf<ArticleRouteViewModel["hero"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<ArticleRouteViewModel["body"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<StaticPageRouteViewModel["body"]>().toEqualTypeOf<ReactNode>();
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
