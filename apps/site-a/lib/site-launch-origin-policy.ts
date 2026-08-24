import type { ReleaseMode } from "@content-foundry/site-core";

import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

const reservedHostnames = Object.freeze([
  "example.com",
  "example.net",
  "example.org",
  "localhost",
]);
const reservedSuffixes = Object.freeze([
  ".example",
  ".invalid",
  ".localhost",
  ".test",
  ".example.com",
  ".example.net",
  ".example.org",
]);

export function validateSiteLaunchOrigin(
  mode: ReleaseMode,
  origin: string | null,
): void {
  if (mode !== "production") return;
  if (origin === null) {
    throw new SiteLaunchReadinessError(["production origin is required"]);
  }

  const hostname = new URL(origin).hostname.toLowerCase();
  if (
    reservedHostnames.includes(hostname)
    || reservedSuffixes.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new SiteLaunchReadinessError([
      `production origin must not use reserved hostname ${hostname}`,
    ]);
  }
}
