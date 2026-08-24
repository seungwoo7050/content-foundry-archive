import { readFileSync } from "node:fs";
import { join } from "node:path";

export function declaresV3SiteRelease(releaseDirectory: string): boolean {
  try {
    const candidate = JSON.parse(
      readFileSync(join(releaseDirectory, "release.json"), "utf8"),
    ) as unknown;
    return (
      typeof candidate === "object" &&
      candidate !== null &&
      "contractVersion" in candidate &&
      candidate.contractVersion === "3.0.0"
    );
  } catch {
    return false;
  }
}
