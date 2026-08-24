import path from "node:path";

import { loadSupportedReleaseBundle } from "./load-release-bundle.js";
import {
  readV3ConsumerContextFile,
  V3ConsumerContextFileError,
} from "./read-v3-consumer-context.js";

export { V3ConsumerContextFileError };

export class ReleaseValidationUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReleaseValidationUsageError";
  }
}

export interface ReleaseValidationEnvironment {
  readonly CONTENT_RELEASE_DIR?: string;
  readonly CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE?: string;
  readonly INIT_CWD?: string;
}

export function validateReleaseFromEnvironment(
  environment: ReleaseValidationEnvironment,
  currentDirectory: string,
) {
  const releaseDirectory = environment.CONTENT_RELEASE_DIR?.trim();
  if (!releaseDirectory) {
    throw new ReleaseValidationUsageError("CONTENT_RELEASE_DIR is required");
  }

  const baseDirectory = environment.INIT_CWD?.trim() || currentDirectory;
  const contextFile =
    environment.CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE?.trim();
  const bundle = loadSupportedReleaseBundle(
    path.resolve(baseDirectory, releaseDirectory),
    {
      resolveV3ConsumerContext: () => {
        if (!contextFile) {
          throw new ReleaseValidationUsageError(
            "CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE is required for contract 3.0.0",
          );
        }
        return readV3ConsumerContextFile(
          path.resolve(baseDirectory, contextFile),
        );
      },
      resolveV4ConsumerContext: () => {
        throw new ReleaseValidationUsageError(
          "Contract 4.0.0 requires a Public Sites release-mode consumer context",
        );
      },
    },
  );

  return {
    validationScope: "contract-consumer" as const,
    contractVersion: bundle.release.contractVersion,
    releaseId: bundle.release.releaseId,
    siteId: bundle.release.siteId,
    bundleChecksum: bundle.release.bundleChecksum,
  };
}
