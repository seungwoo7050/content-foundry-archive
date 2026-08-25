import type { QaStaticBuildPlan } from "./build-matrix-plan";

const QA_FORBIDDEN_INHERITED_KEYS = Object.freeze([
  "CI",
  "INIT_CWD",
  "CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE",
  "IMMUTABLE_MEDIA_DIR",
  "SITE_ALLOWED_PRODUCTION_ORIGINS",
  "CONSENT_PROVIDER",
  "CONSENT_CONFIG_REVISION",
  "ADSENSE_MANUAL_UNITS",
  "SITE_OWNED_GA4_MEASUREMENT_ID",
  "SITE_OWNED_ADSENSE_CLIENT_ID",
  "GOOGLE_CMP_READY",
  "ADSENSE_AUTO_ADS_ENABLED",
  "ADSENSE_SITE_READY",
] as const);

export function createQaBuildEnvironment(
  inherited: Readonly<Record<string, string | undefined>>,
  facts: QaStaticBuildPlan["environment"],
): Readonly<Record<string, string | undefined>> {
  const environment = { ...inherited };
  for (const key of QA_FORBIDDEN_INHERITED_KEYS) delete environment[key];
  return Object.freeze({ ...environment, ...facts });
}
