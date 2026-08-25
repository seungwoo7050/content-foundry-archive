import type { QaStaticBuildPlan } from "./build-matrix-plan";
import {
  verifyQaStaticHtmlCorpus,
  verifyQaStaticMetadata,
  verifyQaStaticPagination,
  verifyQaStaticSecurity,
  verifyQaStaticSiteArtifacts,
  verifyQaStaticSiteIdentity,
} from "./verify-static-site";

export type QaStaticVerificationPlan = Pick<
  QaStaticBuildPlan,
  "id" | "origin" | "outputDirectory" | "skin" | "theme"
>;
type QaStaticVerifier = (plan: QaStaticVerificationPlan) => unknown;
const verifiers: readonly (readonly [string, QaStaticVerifier])[] = [
  ["release identity", verifyQaStaticSiteIdentity],
  ["provider-free artifacts", verifyQaStaticSiteArtifacts],
  ["HTML corpus", verifyQaStaticHtmlCorpus],
  ["pagination", verifyQaStaticPagination],
  ["metadata", verifyQaStaticMetadata],
  ["security", verifyQaStaticSecurity],
];

export function verifyQaStaticBuild(plan: QaStaticVerificationPlan) {
  let verifierCount = 0;
  for (const [label, verify] of verifiers) {
    try {
      verify(plan);
      verifierCount += 1;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `QA static ${label} failed for ${plan.theme}×${plan.skin} (${plan.id}): ${detail}`,
      );
    }
  }
  return Object.freeze({ id: plan.id, verifierCount });
}
