import { describe, expect, it } from "vitest";

import { createRobotsPolicy } from "./robots-policy";

describe("crawler policy", () => {
  it("blocks every crawler without advertising a sitemap in noindex modes", () => {
    expect(
      createRobotsPolicy("https://preview.example.com", { noindex: true }),
    ).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("opens production HTML while protecting machine-only artifacts", () => {
    expect(
      createRobotsPolicy("https://www.example.com", { noindex: false }),
    ).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/_release.json", "/search-index.json"],
      },
      sitemap: "https://www.example.com/sitemap.xml",
    });
  });
});
