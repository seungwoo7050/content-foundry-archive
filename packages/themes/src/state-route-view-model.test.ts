import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";

import type {
  SearchRouteViewModel,
  StateRouteViewModel,
} from "./state-route-view-model.js";

describe("state route view models", () => {
  it("keeps the search implementation behind a rendered client slot", () => {
    expectTypeOf<SearchRouteViewModel["client"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<SearchRouteViewModel>().not.toHaveProperty("searchIndex");
    expectTypeOf<SearchRouteViewModel>().not.toHaveProperty("query");
  });

  it("discriminates the three non-content HTML routes", () => {
    expectTypeOf<StateRouteViewModel["kind"]>().toEqualTypeOf<
      "search" | "not-found" | "retired"
    >();
  });
});
