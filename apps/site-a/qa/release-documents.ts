import type { LoadedReleaseBundleV4 } from "@content-foundry/content-contract";

import { qaCorpus } from "./corpus";
import { projectQaReleaseFacts, type QaReleaseVariant } from "./release-facts";

export function projectQaReleaseDocuments({
  theme,
  skin,
  origin,
}: QaReleaseVariant): LoadedReleaseBundleV4 {
  return {
    ...projectQaReleaseFacts({ theme, skin, origin }),
    taxonomy: qaCorpus.taxonomy,
    presentation: qaCorpus.presentation,
    redirects: qaCorpus.redirects,
    articles: qaCorpus.articles,
    pages: qaCorpus.pages,
  };
}
