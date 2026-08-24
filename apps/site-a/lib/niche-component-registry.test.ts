import { createElement } from "react";
import { describe, expect, it } from "vitest";

import {
  type NicheComponentRegistry,
  type RegisteredNicheComponent,
} from "../components/niche-component-block";
import {
  createSiteNicheComponentRegistry,
  projectNicheComponentIds,
} from "./niche-component-registry";

describe("Site A niche component registry", () => {
  it("declares no component ID before an implementation exists", () => {
    const registry = createSiteNicheComponentRegistry();

    expect(registry.get("site-a")).toBeInstanceOf(Map);
    expect(projectNicheComponentIds(registry)).toEqual({ "site-a": [] });
  });

  it("projects site-scoped component IDs in deterministic order", () => {
    const Implementation = () => createElement("p", null, "구현됨");
    const implementation: RegisteredNicheComponent = createElement(Implementation);
    const registry: NicheComponentRegistry = new Map([
      ["site-b", new Map([["zeta", implementation]])],
      [
        "site-a",
        new Map([
          ["second-component", implementation],
          ["first-component", implementation],
        ]),
      ],
    ]);

    expect(projectNicheComponentIds(registry)).toEqual({
      "site-a": ["first-component", "second-component"],
      "site-b": ["zeta"],
    });
  });
});
