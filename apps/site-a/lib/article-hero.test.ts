import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderArticleHero } from "./article-hero";

const mediaAssets = new Map([
  [
    "MED-000045",
    {
      fallback: {
        mediaId: "MED-000045",
        relativePath: "_media/MED-000045/source.png",
        publicPath: "/_media/MED-000045/source.png",
        sha256: "verified",
        mimeType: "image/png",
        width: 16,
        height: 9,
        alt: "v2 대표 발급 화면",
        credit: null,
        license: null,
      },
      derivatives: [],
    },
  ],
]);

describe("renderArticleHero", () => {
  it("renders a prepared v2 hero through the shared image block", () => {
    const html = renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        renderArticleHero("MED-000045", mediaAssets),
      ),
    );

    expect(html).toContain('src="/_media/MED-000045/source.png"');
    expect(html).toContain('alt="v2 대표 발급 화면"');
  });

  it("omits a null hero", () => {
    expect(renderArticleHero(null, mediaAssets)).toBeNull();
  });
});
