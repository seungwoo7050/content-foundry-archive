import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

import {
  ContractError,
  type ContractIssue,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";

import { createResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

const projectionVersion = 1;
const decoder = new TextDecoder("utf-8", { fatal: true });
const documentKeys = [
  "assets",
  "bundleChecksum",
  "contractVersion",
  "projectionVersion",
  "releaseId",
  "siteId",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string, issues: readonly ContractIssue[]): never {
  throw new ContractError("BUILD_FAILED", message, issues);
}

function exactDocument(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify(documentKeys)
  );
}

function projectionDocument(
  bundle: LoadedReleaseBundleV3,
  assets: Iterable<ResponsiveImageAsset>,
) {
  const registry = createResponsiveImageAssetRegistry(bundle.mediaManifest, assets);
  return {
    projectionVersion,
    contractVersion: bundle.release.contractVersion,
    siteId: bundle.release.siteId,
    releaseId: bundle.release.releaseId,
    bundleChecksum: bundle.release.bundleChecksum,
    assets: [...registry.values()],
  };
}

function parseProjectionDocument(
  source: string,
  bundle: LoadedReleaseBundleV3,
): readonly ResponsiveImageAsset[] {
  let value: unknown;
  try {
    value = JSON.parse(source) as unknown;
  } catch {
    return fail("Prepared media projection is invalid", [
      { path: "/mediaProjection", message: "projection must be valid JSON" },
    ]);
  }
  if (!exactDocument(value)) {
    return fail("Prepared media projection is invalid", [
      { path: "/mediaProjection", message: "projection fields are not exact" },
    ]);
  }

  const expected = {
    projectionVersion,
    contractVersion: bundle.release.contractVersion,
    siteId: bundle.release.siteId,
    releaseId: bundle.release.releaseId,
    bundleChecksum: bundle.release.bundleChecksum,
  } as const;
  const issues: ContractIssue[] = [];
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (value[field] !== expectedValue) {
      issues.push({
        path: `/mediaProjection/${field}`,
        message: `expected ${String(expectedValue)}`,
      });
    }
  }

  const assets = value.assets;
  if (!Array.isArray(assets)) {
    issues.push({ path: "/mediaProjection/assets", message: "expected an array" });
  } else {
    assets.forEach((asset, index) => {
      if (
        !isRecord(asset) ||
        !isRecord(asset.fallback) ||
        !Array.isArray(asset.derivatives)
      ) {
        issues.push({
          path: `/mediaProjection/assets/${index}`,
          message: "expected a responsive image asset",
        });
      }
    });
  }
  if (issues.length > 0) fail("Prepared media projection is invalid", issues);

  const registry = createResponsiveImageAssetRegistry(
    bundle.mediaManifest,
    assets as ResponsiveImageAsset[],
  );
  return [...registry.values()];
}

export async function writeSiteMediaProjection(
  path: string,
  bundle: LoadedReleaseBundleV3,
  assets: Iterable<ResponsiveImageAsset>,
): Promise<void> {
  const source = `${JSON.stringify(projectionDocument(bundle, assets), null, 2)}\n`;
  const directory = dirname(path);
  const temporary = join(directory, `.${basename(path)}.${randomUUID()}.tmp`);
  try {
    await mkdir(directory, { recursive: true });
    await writeFile(temporary, source, { encoding: "utf8", flag: "wx" });
    await rename(temporary, path);
  } catch {
    await rm(temporary, { force: true }).catch(() => undefined);
    fail("Prepared media projection cannot be written", [
      { path: "/mediaProjection", message: "projection artifact is unavailable" },
    ]);
  }
}

export function readSiteMediaProjection(
  path: string,
  bundle: LoadedReleaseBundleV3,
): readonly ResponsiveImageAsset[] {
  let source: string;
  try {
    source = decoder.decode(readFileSync(path));
  } catch {
    return fail("Prepared media projection cannot be read", [
      { path: "/mediaProjection", message: "projection artifact is unavailable" },
    ]);
  }
  return parseProjectionDocument(source, bundle);
}
