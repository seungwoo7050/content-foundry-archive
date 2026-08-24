import { BuildTargetConfigError } from "./release-mode.js";

const fail = (message: string): never => {
  throw new BuildTargetConfigError(message);
};

function validateOrigin(value: unknown, index: number): string {
  if (typeof value !== "string" || value.length === 0) {
    return fail(`Production origin at index ${index} must be a non-empty string`);
  }

  const Url = (globalThis as unknown as {
    readonly URL: new (input: string) => {
      readonly origin: string;
      readonly protocol: string;
    };
  }).URL;
  let url: InstanceType<typeof Url>;
  try {
    url = new Url(value);
  } catch {
    return fail(`Production origin at index ${index} is not a valid URL`);
  }
  if (url.protocol !== "https:" || url.origin !== value) {
    return fail(
      `Production origin at index ${index} must be a canonical HTTPS origin`,
    );
  }
  return value;
}

export function parseProductionOrigins(
  value: string | undefined,
): readonly string[] {
  if (value === undefined || value.trim() === "") return Object.freeze([]);

  let candidate: unknown;
  try {
    candidate = JSON.parse(value);
  } catch {
    return fail("SITE_ALLOWED_PRODUCTION_ORIGINS must be valid JSON");
  }
  if (!Array.isArray(candidate)) {
    return fail("SITE_ALLOWED_PRODUCTION_ORIGINS must be a JSON array");
  }

  const origins = candidate.map(validateOrigin);
  if (new Set(origins).size !== origins.length) {
    return fail("SITE_ALLOWED_PRODUCTION_ORIGINS must not contain duplicates");
  }
  return Object.freeze(origins);
}
