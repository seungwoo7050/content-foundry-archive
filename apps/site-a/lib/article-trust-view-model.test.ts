import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createArticleTrustViewModel,
  type ArticleTrustRecord,
  type ArticleTrustSource,
} from "./article-trust-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

describe("article trust view model", () => {
  it("accepts both releases and avoids inventing a v2 update", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<ArticleTrustSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ArticleTrustSource>();
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<ArticleTrustRecord>();

    expect(createArticleTrustViewModel(bundle, article)).toMatchObject({
      authorLabel: "생활메모",
      operatorLabel: "생활메모",
      published: {
        dateTime: "2026-08-20T01:00:00Z",
        label: "2026년 8월 20일",
      },
      updated: null,
      sources: [],
      updateTriggers: [],
      faq: [],
      aboutPath: "/about",
      contactPath: null,
    });
  });

  it("projects later updates, safe sources, triggers, FAQ, and available routes", () => {
    const viewModel = createArticleTrustViewModel(
      { ...bundle, pages: [...bundle.pages, { path: "/contact" }] },
      {
        ...article,
        updatedAt: "2026-08-24T02:30:00Z",
        sourceDisclosures: [
          { label: "공식 안내", url: "https://official.example/guide" },
          { label: "이메일", url: "mailto:help@example.com" },
        ],
        updateTriggers: ["공식 절차가 바뀔 때"],
        faq: [{ question: "무엇이 필요한가요?", answerMarkdown: "신분증입니다." }],
      },
    );

    expect(viewModel).toMatchObject({
      updated: {
        dateTime: "2026-08-24T02:30:00Z",
        label: "2026년 8월 24일",
      },
      sources: [
        { label: "공식 안내", href: "https://official.example/guide" },
        { label: "이메일", href: null },
      ],
      updateTriggers: ["공식 절차가 바뀔 때"],
      faq: [{ question: "무엇이 필요한가요?", answerText: "신분증입니다." }],
      contactPath: "/contact",
    });
  });
});
