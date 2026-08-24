import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  STATE_RECOVERY_LINK_KINDS,
  type NotFoundRouteViewModel,
  type RetiredRouteViewModel,
  type SearchRouteViewModel,
  type StateRecoveryLinkViewModel,
  type StateRouteViewModel,
} from "./state-route-view-model.js";
import type { LinkViewModel } from "./presentation-view-model.js";

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

  it("defines optional typed recovery links without replacing the primary action", () => {
    expect(STATE_RECOVERY_LINK_KINDS).toEqual([
      "search",
      "category",
      "replacement",
    ]);
    expect(Object.isFrozen(STATE_RECOVERY_LINK_KINDS)).toBe(true);
    expectTypeOf<StateRecoveryLinkViewModel>().toEqualTypeOf<{
      readonly kind: (typeof STATE_RECOVERY_LINK_KINDS)[number];
      readonly href: string;
      readonly label: string;
    }>();
    expectTypeOf<NotFoundRouteViewModel["action"]>().toEqualTypeOf<LinkViewModel>();
    expectTypeOf<RetiredRouteViewModel["action"]>().toEqualTypeOf<LinkViewModel>();
    expectTypeOf<NotFoundRouteViewModel["recoveryLinks"]>().toEqualTypeOf<
      readonly StateRecoveryLinkViewModel[] | undefined
    >();
    expectTypeOf<RetiredRouteViewModel["recoveryLinks"]>().toEqualTypeOf<
      readonly StateRecoveryLinkViewModel[] | undefined
    >();
  });
});
