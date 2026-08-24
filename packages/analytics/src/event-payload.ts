export const ANALYTICS_EVENT_CONTRACT_VERSION = "1.0.0" as const;
export const ANALYTICS_EVENT_NAMES = Object.freeze([
  "article_engaged", "scroll_depth", "internal_link_click",
  "external_official_click", "affiliate_click", "search_submit",
  "search_result_click", "share_click", "bookmark_local",
  "article_feedback", "ad_slot_viewability",
] as const);
export const ANALYTICS_ROUTE_TYPES = Object.freeze([
  "home", "category", "article", "static-page", "archive", "search",
  "not-found", "retired",
] as const);
export const ANALYTICS_THEME_IDS = Object.freeze([
  "editorial-utility", "clean-personal-blog", "information-portal",
  "minimal-knowledge-base", "friendly-mobile-utility",
] as const);
export const ANALYTICS_SKIN_IDS = Object.freeze(["calm-blue", "forest-green", "warm-neutral"] as const);

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsRouteType = (typeof ANALYTICS_ROUTE_TYPES)[number];
export type AnalyticsThemeId = (typeof ANALYTICS_THEME_IDS)[number];
export type AnalyticsSkinId = (typeof ANALYTICS_SKIN_IDS)[number];
export interface AnalyticsEventContext {
  readonly eventContractVersion: typeof ANALYTICS_EVENT_CONTRACT_VERSION;
  readonly siteId: string;
  readonly releaseId: string;
  readonly routeType: AnalyticsRouteType;
  readonly themeId: AnalyticsThemeId;
  readonly skinId: AnalyticsSkinId;
}
interface EventDetails {
  readonly article_engaged: { readonly articleId: string };
  readonly scroll_depth: { readonly articleId: string; readonly depthPercent: 25 | 50 | 75 | 90 };
  readonly internal_link_click: { readonly destinationType: "article" | "category"; readonly destinationId: string };
  readonly external_official_click: { readonly targetId: string };
  readonly affiliate_click: { readonly partnerId: string; readonly placement: string };
  readonly search_submit: { readonly queryCategory: string };
  readonly search_result_click: { readonly articleId: string; readonly resultPosition: number };
  readonly share_click: { readonly articleId: string; readonly channel: string };
  readonly bookmark_local: { readonly articleId: string };
  readonly article_feedback: { readonly articleId: string; readonly feedback: "helpful" | "not-helpful" };
  readonly ad_slot_viewability: { readonly slotId: string };
}
export type AnalyticsEventPayload = {
  [TName in AnalyticsEventName]: AnalyticsEventContext &
    { readonly eventName: TName } & EventDetails[TName];
}[AnalyticsEventName];

export class AnalyticsEventContractError extends Error {
  constructor(message: string) { super(message); this.name = "AnalyticsEventContractError"; }
}

type RecordValue = Record<string, unknown>;
type EventSpec = readonly [readonly string[], (value: RecordValue) => boolean];
const COMMON_KEYS = Object.freeze([
  "eventContractVersion", "eventName", "siteId", "releaseId", "routeType",
  "themeId", "skinId",
] as const);
const themeIds = new Set<string>(ANALYTICS_THEME_IDS);
const skinIds = new Set<string>(ANALYTICS_SKIN_IDS);
const AD_SLOT_IDS = new Set(["home-feed", "article-after-summary", "article-mid-1", "article-mid-2", "article-end", "desktop-sidebar"]);
const eventNames = new Set<string>(ANALYTICS_EVENT_NAMES);
const routeTypes = new Set<string>(ANALYTICS_ROUTE_TYPES);
const token = (value: unknown): value is string => typeof value === "string" && value.length <= 64 && /^[a-z0-9][a-z0-9-]*$/.test(value);
const article = (value: unknown): value is string => typeof value === "string" && value.length <= 64 && /^ART-[A-Z0-9-]+$/.test(value);
const specs: Readonly<Record<AnalyticsEventName, EventSpec>> = Object.freeze({
  article_engaged: [["articleId"], (v) => article(v.articleId)],
  scroll_depth: [["articleId", "depthPercent"], (v) => article(v.articleId) && [25, 50, 75, 90].includes(v.depthPercent as number)],
  internal_link_click: [["destinationType", "destinationId"], (v) => v.destinationType === "article" ? article(v.destinationId) : v.destinationType === "category" && token(v.destinationId)],
  external_official_click: [["targetId"], (v) => token(v.targetId)],
  affiliate_click: [["partnerId", "placement"], (v) => token(v.partnerId) && token(v.placement)],
  search_submit: [["queryCategory"], (v) => token(v.queryCategory)],
  search_result_click: [["articleId", "resultPosition"], (v) => article(v.articleId) && Number.isInteger(v.resultPosition) && (v.resultPosition as number) >= 1 && (v.resultPosition as number) <= 100],
  share_click: [["articleId", "channel"], (v) => article(v.articleId) && token(v.channel)],
  bookmark_local: [["articleId"], (v) => article(v.articleId)],
  article_feedback: [["articleId", "feedback"], (v) => article(v.articleId) && ["helpful", "not-helpful"].includes(v.feedback as string)],
  ad_slot_viewability: [["slotId"], (v) => AD_SLOT_IDS.has(v.slotId as string)],
});
const exactKeys = (value: RecordValue, keys: readonly string[]) =>
  Object.keys(value).sort().join(",") === [...keys].sort().join(",");

export function createAnalyticsEventPayload(value: unknown): AnalyticsEventPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new AnalyticsEventContractError("analytics event must be an object");
  const candidate = value as RecordValue;
  if (typeof candidate.eventName !== "string" || !eventNames.has(candidate.eventName)) throw new AnalyticsEventContractError("analytics event name is unsupported");
  const spec = specs[candidate.eventName as AnalyticsEventName];
  if (!exactKeys(candidate, [...COMMON_KEYS, ...spec[0]])) throw new AnalyticsEventContractError("analytics event keys must match the contract exactly");
  if (candidate.eventContractVersion !== ANALYTICS_EVENT_CONTRACT_VERSION || !token(candidate.siteId) || typeof candidate.releaseId !== "string" || candidate.releaseId.length > 64 || !/^REL-[A-Z0-9-]+$/.test(candidate.releaseId) || !routeTypes.has(candidate.routeType as string) || !themeIds.has(candidate.themeId as string) || !skinIds.has(candidate.skinId as string) || !spec[1](candidate)) throw new AnalyticsEventContractError("analytics event values are invalid");
  return Object.freeze({ ...candidate }) as unknown as AnalyticsEventPayload;
}
