import { readFileSync } from "node:fs";
import { TextDecoder } from "node:util";

import type { V3ReleaseConsumerContext } from "./validate-v3-release-consumer-context.js";

const DECODER = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

export class V3ConsumerContextFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "V3ConsumerContextFileError";
  }
}

const fail = (message: string): never => {
  throw new V3ConsumerContextFileError(message);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function readV3ConsumerContextFile(
  path: string,
): V3ReleaseConsumerContext {
  let value: unknown;
  try {
    value = JSON.parse(DECODER.decode(readFileSync(path))) as unknown;
  } catch (error) {
    return fail(`Cannot parse v3 consumer context: ${String(error)}`);
  }
  if (!isRecord(value)) return fail("V3 consumer context must be an object");

  const routes = value.generatedRoutes;
  const registry = value.nicheComponentRegistry;
  if (!Array.isArray(routes) || routes.some((route) => typeof route !== "string")) {
    return fail("generatedRoutes must be an array of strings");
  }
  if (new Set(routes).size !== routes.length) {
    return fail("generatedRoutes must not contain duplicates");
  }
  if (!isRecord(registry)) {
    return fail("nicheComponentRegistry must be an object");
  }

  const entries = Object.entries(registry);
  if (
    entries.some(
      ([siteId, componentIds]) =>
        siteId.length === 0 ||
        !Array.isArray(componentIds) ||
        componentIds.some((componentId) => typeof componentId !== "string") ||
        new Set(componentIds).size !== componentIds.length,
    )
  ) {
    return fail("nicheComponentRegistry entries must contain unique string arrays");
  }

  return {
    generatedRoutes: new Set(routes),
    nicheComponentRegistry: Object.fromEntries(entries) as Record<
      string,
      readonly string[]
    >,
  };
}
