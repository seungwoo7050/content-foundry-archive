import {
  StrictJsonStringMapError,
  parseStrictJsonStringMap,
} from "./strict-json-string-map.js";

export const AD_SLOT_IDS = Object.freeze([
  "home-feed",
  "article-after-summary",
  "article-mid-1",
  "article-mid-2",
  "article-end",
  "desktop-sidebar",
] as const);

export type AdSlotId = (typeof AD_SLOT_IDS)[number];
export type AdSenseUnitId = string & { readonly __adsenseUnitId: unique symbol };
export type ManualAdUnits = Readonly<Partial<Record<AdSlotId, AdSenseUnitId>>>;

export class ManualAdUnitConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManualAdUnitConfigError";
  }
}

const slotIds = new Set<string>(AD_SLOT_IDS);
const unitIdPattern = /^[0-9]{1,20}$/;

const fail = (message: string): never => {
  throw new ManualAdUnitConfigError(message);
};

export function isAdSenseUnitId(value: unknown): value is AdSenseUnitId {
  return typeof value === "string" && unitIdPattern.test(value);
}

export function hasValidManualAdUnits(value: unknown): value is ManualAdUnits {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(
    ([key, unitId]) => slotIds.has(key) && isAdSenseUnitId(unitId),
  );
}

export function parseManualAdUnits(serialized: string | null | undefined): ManualAdUnits {
  if (typeof serialized !== "string") return fail("AD_SLOT_IDS is required");
  let pairs: ReadonlyArray<readonly [string, string]>;
  try {
    pairs = parseStrictJsonStringMap(serialized);
  } catch (error) {
    if (error instanceof StrictJsonStringMapError) return fail(`invalid AD_SLOT_IDS: ${error.message}`);
    throw error;
  }
  const parsed = new Map(pairs);
  if (parsed.size === 0) return fail("enabled advertising requires a manual ad unit");
  for (const [key, unitId] of pairs) {
    if (!slotIds.has(key)) return fail(`AD_SLOT_IDS contains unknown slot ${key}`);
    if (!isAdSenseUnitId(unitId)) return fail(`AD_SLOT_IDS has invalid unit ID for ${key}`);
  }
  return Object.freeze(Object.fromEntries(
    AD_SLOT_IDS.flatMap((key) => parsed.has(key) ? [[key, parsed.get(key)]] : []),
  )) as ManualAdUnits;
}
