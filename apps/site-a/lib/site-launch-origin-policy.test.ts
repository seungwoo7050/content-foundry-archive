import { describe, expect, it } from "vitest";

import { validateSiteLaunchOrigin } from "./site-launch-origin-policy";

describe("Site A launch origin policy", () => {
  it("accepts a controlled non-reserved production origin", () => {
    expect(() => validateSiteLaunchOrigin(
      "production",
      "https://guides.example.kr",
    )).not.toThrow();
  });

  it.each(["template", "preview"] as const)(
    "allows the sample origin in %s",
    (mode) => expect(() => validateSiteLaunchOrigin(
      mode,
      "https://example.com",
    )).not.toThrow(),
  );

  it("requires a production origin", () => {
    expect(() => validateSiteLaunchOrigin("production", null)).toThrow(
      "production origin is required",
    );
  });

  it.each([
    "https://example.com",
    "https://site.example.org",
    "https://site.example",
    "https://site.test",
    "https://localhost",
  ])("rejects reserved production origin %s", (origin) => {
    expect(() => validateSiteLaunchOrigin("production", origin)).toThrow(
      "production origin must not use reserved hostname",
    );
  });
});
