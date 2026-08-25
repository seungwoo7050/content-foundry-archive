import { beforeEach, describe, expect, it, vi } from "vitest";

const checks = vi.hoisted(() => ({
  identity: vi.fn(),
  artifacts: vi.fn(),
  corpus: vi.fn(),
  pagination: vi.fn(),
  metadata: vi.fn(),
  security: vi.fn(),
}));
vi.mock("./verify-static-site", () => ({
  verifyQaStaticSiteIdentity: checks.identity,
  verifyQaStaticSiteArtifacts: checks.artifacts,
  verifyQaStaticHtmlCorpus: checks.corpus,
  verifyQaStaticPagination: checks.pagination,
  verifyQaStaticMetadata: checks.metadata,
  verifyQaStaticSecurity: checks.security,
}));

import { verifyQaStaticBuild } from "./verify-static-build";

const plan = {
  id: "information-portal--calm-blue",
  origin: "https://information-portal-calm-blue.qa.public-sites.example",
  outputDirectory: "/qa/sites/information-portal--calm-blue",
  theme: "information-portal",
  skin: "calm-blue",
} as const;
const orderedChecks = Object.values(checks);

beforeEach(() => vi.clearAllMocks());

describe("verifyQaStaticBuild", () => {
  it("requires all six static verifiers before reporting site success", () => {
    expect(verifyQaStaticBuild(plan)).toEqual({
      id: plan.id,
      verifierCount: 6,
    });
    for (const check of orderedChecks) {
      expect(check).toHaveBeenCalledOnce();
      expect(check).toHaveBeenCalledWith(plan);
    }
  });

  it("identifies the failed verifier and theme by skin", () => {
    checks.metadata.mockImplementationOnce(() => {
      throw new Error("social metadata mismatch");
    });
    expect(() => verifyQaStaticBuild(plan)).toThrow(
      /metadata failed for information-portal×calm-blue.*social metadata mismatch/u,
    );
    expect(checks.security).not.toHaveBeenCalled();
  });
});
