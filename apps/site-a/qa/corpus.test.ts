import { existsSync } from "node:fs";

import { validateContractDocument } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { qaCorpus } from "./corpus";

describe("QA Contract 4 source corpus", () => {
  it("is schema-valid, published, dense, and deterministic", () => {
    expect(validateContractDocument("4.0.0", "site", qaCorpus.site)).toBe(qaCorpus.site);
    expect(
      validateContractDocument("4.0.0", "taxonomy", qaCorpus.taxonomy),
    ).toBe(qaCorpus.taxonomy);
    expect(
      validateContractDocument("4.0.0", "presentation", qaCorpus.presentation),
    ).toBe(qaCorpus.presentation);
    expect(
      validateContractDocument("4.0.0", "redirects", qaCorpus.redirects),
    ).toBe(qaCorpus.redirects);
    qaCorpus.articles.forEach((article) =>
      expect(validateContractDocument("4.0.0", "article", article)).toBe(
        article,
      ),
    );
    qaCorpus.pages.forEach((page) =>
      expect(validateContractDocument("4.0.0", "page", page)).toBe(page),
    );
    expect(qaCorpus.taxonomy.categories).toHaveLength(5);
    expect(qaCorpus.articles).toHaveLength(17);
    expect(
      qaCorpus.articles.filter(({ categoryId }) => categoryId === "field-notes"),
    ).toHaveLength(13);
    expect(new Set(qaCorpus.articles.map(({ id }) => id)).size).toBe(17);
    expect(new Set(qaCorpus.articles.map(({ slug }) => slug)).size).toBe(17);
  });

  it("stays visibly non-operational and provider-free", () => {
    expect(new URL(qaCorpus.site.origin).hostname).toMatch(/\.qa\.public-sites\.example$/);
    expect(qaCorpus.siteWideNoindex).toBe(true);
    expect(qaCorpus.site).toMatchObject({
      analytics: { provider: "disabled" },
      ads: { provider: "disabled", enabled: false },
      featureFlags: { localBookmarks: true },
    });
    for (const document of [...qaCorpus.articles, ...qaCorpus.pages]) {
      expect(`${document.title} ${document.summary}`).toMatch(/QA 비운영/);
      expect(document.seo.index).toBe(false);
    }
    const sourceHosts = qaCorpus.articles.flatMap(({ sourceDisclosures }) =>
      sourceDisclosures.map(({ url }) => new URL(url).hostname),
    );
    expect(sourceHosts.every((host) => host.endsWith(".qa.public-sites.example"))).toBe(true);
    expect(qaCorpus.pages.map(({ path }) => path)).toEqual([
      "/about",
      "/contact",
      "/privacy",
      "/advertising-disclosure",
    ]);
    expect(qaCorpus.pages.some(({ path }) => path === "/404")).toBe(false);
    expect(existsSync("app/not-found.tsx")).toBe(true);
    expect(qaCorpus.redirects.items).toContainEqual({
      type: "gone",
      path: "/retired/qa-old-guide",
      status: 410,
      replacementPath: null,
    });
    const homeIds = Object.values(qaCorpus.presentation.home).flat();
    expect(new Set(homeIds).size).toBe(homeIds.length);
    expect(
      qaCorpus.presentation.categoryHighlights
        .map(({ categoryId }) => categoryId)
        .sort(),
    ).toEqual(qaCorpus.taxonomy.categories.map(({ id }) => id).sort());
    expect(
      qaCorpus.presentation.categoryHighlights.every(
        ({ categoryId, articleIds }) =>
          articleIds.every((id) =>
            qaCorpus.articles.some(
              (article) => article.id === id && article.categoryId === categoryId,
            ),
          ),
      ),
    ).toBe(true);
    expect(
      Object.values(qaCorpus.presentation.brand)
        .filter(Boolean)
        .every((id) => qaCorpus.mediaIds.includes(id!)),
    ).toBe(true);
  });

  it("covers rich, short, and long rendering cases without policy invention", () => {
    const [rich, short] = [qaCorpus.articles[0]!, qaCorpus.articles[1]!];
    expect(rich.title.length).toBeGreaterThan(50);
    expect(rich.slug.length).toBeGreaterThan(80);
    expect(short.content).toHaveLength(1);
    expect(rich.content.map(({ type }) => type)).toEqual(
      expect.arrayContaining([
        "table",
        "code",
        "command",
        "gallery",
        "action-link",
      ]),
    );
    expect(rich).toMatchObject({
      faq: [{ question: expect.any(String) }],
      sourceDisclosures: [{ url: "https://source.qa.public-sites.example/synthetic-reference" }],
      relatedArticleIds: ["ART-QA-002"],
      updateTriggers: [expect.any(String)],
    });
  });
});
