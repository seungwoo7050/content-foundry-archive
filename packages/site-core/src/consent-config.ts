import { BuildTargetConfigError } from "./release-mode.js";

export const CONSENT_PROVIDERS = Object.freeze([
  "disabled",
  "google-cmp",
] as const);

export type ConsentProvider = (typeof CONSENT_PROVIDERS)[number];

export type ConsentBuildConfig =
  | {
      readonly provider: "disabled";
      readonly configRevision: null;
    }
  | {
      readonly provider: "google-cmp";
      readonly configRevision: string;
    };

const MAX_CONFIG_REVISION_CODE_POINTS = 128;

const fail = (message: string): never => {
  throw new BuildTargetConfigError(message);
};

function readConfigRevision(value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    return fail("CONSENT_CONFIG_REVISION is required for google-cmp");
  }
  if ([...value].length > MAX_CONFIG_REVISION_CODE_POINTS) {
    return fail("CONSENT_CONFIG_REVISION exceeds 128 code points");
  }
  if (/\s/u.test(value) || /[\p{Cc}\p{Cf}]/u.test(value)) {
    return fail("CONSENT_CONFIG_REVISION must not contain whitespace or controls");
  }
  return value;
}

export function resolveConsentBuildConfig(
  environment: Readonly<Record<string, string | undefined>>,
): ConsentBuildConfig {
  const provider = environment.CONSENT_PROVIDER ?? "disabled";
  const revision = environment.CONSENT_CONFIG_REVISION;

  if (provider === "disabled") {
    if (revision !== undefined) {
      return fail("CONSENT_CONFIG_REVISION is forbidden when consent is disabled");
    }
    return { provider, configRevision: null };
  }
  if (provider === "google-cmp") {
    return { provider, configRevision: readConfigRevision(revision) };
  }
  return fail("CONSENT_PROVIDER must be disabled or google-cmp");
}
