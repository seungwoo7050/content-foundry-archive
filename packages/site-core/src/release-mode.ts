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

const fail = (message: string): never => {
  throw new BuildTargetConfigError(message);
};

function readMode(value: string | undefined): ReleaseMode {
  const mode = value ?? "template";
  if (!(RELEASE_MODES as readonly string[]).includes(mode)) {
    return fail(`Unsupported RELEASE_MODE: ${mode}`);
  }
  return mode as ReleaseMode;
}

function readFlag(name: string, value: string | undefined): boolean {
  if (value === undefined || value === "false") return false;
  if (value === "true") return true;
  return fail(`${name} must be true or false`);
}

export function resolveBuildTargetConfig(
  environment: Readonly<Record<string, string | undefined>>,
  options: BuildTargetOptions,
): BuildTargetConfig {
  const mode = readMode(environment.RELEASE_MODE);
  const releaseDirectory =
    environment.CONTENT_RELEASE_DIR?.trim() ||
    (mode === "template" ? options.templateReleaseDirectory : null);
  if (!releaseDirectory) {
    return fail(`CONTENT_RELEASE_DIR is required in ${mode} mode`);
  }

  const origin = environment.SITE_ORIGIN?.trim() || null;
  if (mode === "production") {
    return fail("production release policy is not configured");
  }

  readFlag("ENABLE_ANALYTICS", environment.ENABLE_ANALYTICS);
  readFlag("ENABLE_ADS", environment.ENABLE_ADS);

  return {
    siteId: options.siteId,
    mode,
    releaseDirectory,
    origin,
    noindex: true,
    analyticsEnabled: false,
    adsEnabled: false,
  };
}
