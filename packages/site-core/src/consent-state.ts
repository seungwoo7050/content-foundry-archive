export const CONSENT_STATE_VERSION = "1.0.0" as const;

export type ConsentDecision = "granted" | "denied";

export interface ConsentPurposes {
  readonly analytics: ConsentDecision; readonly advertising: ConsentDecision;
}

export interface SelectedConsentState extends ConsentPurposes {
  readonly status: "selected"; readonly configRevision: string;
}

export interface UnsetConsentState {
  readonly status: "unset"; readonly configRevision: string;
  readonly analytics: "denied"; readonly advertising: "denied";
}

export type ConsentState = SelectedConsentState | UnsetConsentState;

function createUnsetConsentState(configRevision: string): UnsetConsentState {
  return { status: "unset", configRevision, analytics: "denied", advertising: "denied" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDecision(value: unknown): value is ConsentDecision {
  return value === "granted" || value === "denied";
}

export function createConsentState(
  configRevision: string,
  purposes: ConsentPurposes,
): SelectedConsentState {
  return { status: "selected", configRevision, ...purposes };
}

export function parseConsentState(
  serialized: string | null | undefined,
  currentConfigRevision: string,
): ConsentState {
  const unset = createUnsetConsentState(currentConfigRevision);
  if (serialized === null || serialized === undefined) return unset;

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return unset;
  }
  if (!isRecord(value)) return unset;
  if (Object.keys(value).sort().join(",") !== "advertising,analytics,configRevision,version") return unset;
  if (
    value.version !== CONSENT_STATE_VERSION ||
    value.configRevision !== currentConfigRevision ||
    !isDecision(value.analytics) ||
    !isDecision(value.advertising)
  ) {
    return unset;
  }
  return createConsentState(currentConfigRevision, {
    analytics: value.analytics,
    advertising: value.advertising,
  });
}

export function serializeConsentState(state: SelectedConsentState): string {
  return JSON.stringify({
    version: CONSENT_STATE_VERSION,
    configRevision: state.configRevision,
    analytics: state.analytics,
    advertising: state.advertising,
  });
}
