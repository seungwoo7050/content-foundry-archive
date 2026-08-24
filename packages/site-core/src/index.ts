export {
  BuildTargetConfigError,
  RELEASE_MODES,
  resolveBuildTargetConfig,
  type BuildTargetConfig,
  type BuildTargetOptions,
  type ReleaseMode,
} from "./release-mode.js";
export {
  CONSENT_PROVIDERS,
  resolveConsentBuildConfig,
  type ConsentBuildConfig,
  type ConsentProvider,
} from "./consent-config.js";
export {
  GOOGLE_CMP_PURPOSE_STATUS,
  canLoadGoogleAdvertising,
  canLoadGoogleAnalytics,
  type GoogleCmpConsentModeValues,
} from "./google-cmp-consent.js";
export { parseProductionOrigins } from "./production-origins.js";
export {
  CONSENT_STATE_VERSION,
  createConsentState,
  parseConsentState,
  serializeConsentState,
  type ConsentDecision,
  type ConsentPurposes,
  type ConsentState,
  type SelectedConsentState,
  type UnsetConsentState,
} from "./consent-state.js";
