import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CategoryTopics } from "./category-topics";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("CategoryTopics", () => {
  it("renders referenced tag labels without inventing links", () => {
    expect(
      renderToStaticMarkup(
        createElement(CategoryTopics, { tags: bundle.taxonomy.tags }),
      ),
    ).toBe(
      '<section aria-labelledby="category-topics"><h2 id="category-topics">관련 주제</h2><ul><li>정부24</li></ul></section>',
    );
  });

  it("omits the section when no related tags exist", () => {
    expect(
      renderToStaticMarkup(createElement(CategoryTopics, { tags: [] })),
    ).toBe("");
  });
});
