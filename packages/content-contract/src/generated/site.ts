/* Generated from contract 2.0.0. Do not edit. */

export interface PublicSiteConfiguration {
  id: string;
  origin: string;
  locale: string;
  timeZone: string;
  name: string;
  shortName: string;
  description: string;
  defaultTheme:
    | "editorial-utility"
    | "clean-personal-blog"
    | "information-portal"
    | "minimal-knowledge-base"
    | "friendly-mobile-utility";
  defaultSkin: string;
  author: {
    displayName: string;
    profileId: string;
  };
  analytics: {
    provider: "disabled" | "ga4";
    publicMeasurementId: string | null;
  };
  ads: {
    provider: "disabled" | "adsense" | "other";
    enabled: boolean;
    publicClientId: string | null;
  };
  search: {
    enabled: boolean;
  };
  featureFlags: {
    [k: string]: unknown;
  };
}
