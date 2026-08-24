import { describe, expect, it } from "vitest";

import { BuildTargetConfigError } from "./release-mode.js";
import { parseProductionOrigins } from "./production-origins.js";

describe("production origin allowlist", () => {
  it("parses and freezes distinct canonical HTTPS origins", () => {
    const origins = parseProductionOrigins(
      '["https://example.com","https://www.example.com"]',
    );

    expect(origins).toEqual([
      "https://example.com",
      "https://www.example.com",
    ]);
    expect(Object.isFrozen(origins)).toBe(true);
  });

  it.each([undefined, "", "   "])("treats %j as no configured origins", (value) => {
    expect(parseProductionOrigins(value)).toEqual([]);
  });

  it.each([
    "not-json",
    "{}",
    "[null]",
    '["http://example.com"]',
    '["https://example.com/"]',
    '["https://user@example.com"]',
    '["https://example.com/path"]',
    '["https://example.com","https://example.com"]',
  ])("rejects an untrusted allowlist %s", (value) => {
    expect(() => parseProductionOrigins(value)).toThrow(BuildTargetConfigError);
  });
});
