import { describe, expect, it } from "vitest";

import { getSafeSourceHref } from "./safe-source-url";

describe("public source URLs", () => {
  it("normalizes credential-free HTTP and HTTPS sources", () => {
    expect(getSafeSourceHref("https://official.example/guide?step=1")).toBe(
      "https://official.example/guide?step=1",
    );
    expect(getSafeSourceHref("http://official.example")).toBe(
      "http://official.example/",
    );
  });

  it.each([
    "mailto:contact@example.com",
    "javascript:alert(1)",
    "https://user:secret@official.example/guide",
    "not a URL",
  ])("rejects a non-public source href: %s", (value) => {
    expect(getSafeSourceHref(value)).toBeNull();
  });
});
