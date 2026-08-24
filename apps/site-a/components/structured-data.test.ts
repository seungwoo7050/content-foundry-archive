import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StructuredData } from "./structured-data";

describe("StructuredData", () => {
  it("renders inert JSON that round-trips without raw tag openings", () => {
    const value = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: '</script><script>alert("unsafe")</script>',
    };
    const html = renderToStaticMarkup(
      createElement(StructuredData, { value }),
    );
    const payload = html.match(
      /^<script type="application\/ld\+json">([\s\S]+)<\/script>$/,
    )?.[1];

    expect(payload).toBeDefined();
    expect(payload).not.toContain("<");
    expect(JSON.parse(payload!)).toEqual(value);
    expect(html.match(/<script/g)).toHaveLength(1);
  });
});
