export const RELEASE_MODES = ["template", "preview", "production"] as const;

export type ReleaseMode = (typeof RELEASE_MODES)[number];

export interface BuildTargetConfig {
  readonly siteId: string;
  readonly mode: ReleaseMode;
  readonly releaseDirectory: string;
  readonly origin: string | null;
  readonly noindex: boolean;
  readonly analyticsEnabled: boolean;
  readonly adsEnabled: boolean;
}

export interface BuildTargetOptions {
  readonly siteId: string;
  readonly templateReleaseDirectory: string;
  readonly allowedProductionOrigins: readonly string[];
}

export class BuildTargetConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildTargetConfigError";
  }
}
