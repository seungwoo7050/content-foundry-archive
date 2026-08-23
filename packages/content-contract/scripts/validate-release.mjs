import path from "node:path";
import process from "node:process";

import { loadReleaseBundle } from "../dist/index.js";

const releaseDirectory = process.env.CONTENT_RELEASE_DIR;
if (!releaseDirectory) {
  process.stderr.write("CONTENT_RELEASE_DIR is required\n");
  process.exitCode = 2;
} else {
  try {
    const bundle = loadReleaseBundle(
      path.resolve(process.env.INIT_CWD ?? process.cwd(), releaseDirectory),
    );
    process.stdout.write(
      `${JSON.stringify({
        contractVersion: bundle.release.contractVersion,
        releaseId: bundle.release.releaseId,
        siteId: bundle.release.siteId,
        bundleChecksum: bundle.release.bundleChecksum,
      })}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
