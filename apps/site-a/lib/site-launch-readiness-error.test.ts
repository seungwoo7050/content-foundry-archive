import { BuildTargetConfigError } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

describe("Site A launch readiness errors", () => {
  it("preserves an immutable ordered issue list", () => {
    const source = ["missing privacy page", "CMP is not ready"];
    const error = new SiteLaunchReadinessError(source);
    source.push("late mutation");

    expect(error).toBeInstanceOf(BuildTargetConfigError);
    expect(error.name).toBe("SiteLaunchReadinessError");
    expect(error.issues).toEqual([
      "missing privacy page",
      "CMP is not ready",
    ]);
    expect(Object.isFrozen(error.issues)).toBe(true);
    expect(error.message).toContain("missing privacy page; CMP is not ready");
  });
});
