import {
  AdvertisingConfigError,
  resolveAdvertisingProviderConfig,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import type { ConsentBuildConfig } from "@content-foundry/site-core";
import { getThemeModule, type ThemeId } from "@content-foundry/themes";

export interface SiteAdvertisingSource {
  readonly config: { readonly adsEnabled: boolean };
  readonly bundle: {
    readonly site: {
      readonly ads: unknown;
      readonly defaultTheme: ThemeId;
    };
  };
}

export function resolveSiteAdvertisingConfig(
  context: SiteAdvertisingSource,
  consent: ConsentBuildConfig,
  serializedManualUnits: string | null | undefined,
): AdvertisingProviderConfig {
  const config = resolveAdvertisingProviderConfig(
    context.config.adsEnabled,
    context.bundle.site.ads,
    serializedManualUnits,
  );
  if (config.provider === "disabled") return config;
  if (consent.provider !== "google-cmp") {
    throw new AdvertisingConfigError(
      "enabled Site A advertising requires google-cmp consent",
    );
  }

  const supportedSlots = new Set<string>(
    getThemeModule(context.bundle.site.defaultTheme).supportedSlots,
  );
  for (const slotId of Object.keys(config.manualUnits)) {
    if (!supportedSlots.has(slotId)) {
      throw new AdvertisingConfigError(
        `theme ${context.bundle.site.defaultTheme} does not support ad slot ${slotId}`,
      );
    }
  }
  return config;
}
