import { createAdsTxtRecord } from "@content-foundry/advertising";

import type { SiteGoogleCmpConfig } from "./site-google-cmp-config";

export function createSiteAdsTxtResponse(
  publication: SiteGoogleCmpConfig,
): Response {
  const body = publication.provider === "google-cmp"
    ? createAdsTxtRecord(publication.publicClientId)
    : "";

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
