import process from "node:process";

import {
  ReleaseValidationUsageError,
  V3ConsumerContextFileError,
  validateReleaseFromEnvironment,
} from "../dist/validate-release-cli.js";

try {
  const result = validateReleaseFromEnvironment(process.env, process.cwd());
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode =
    error instanceof ReleaseValidationUsageError ||
    error instanceof V3ConsumerContextFileError
      ? 2
      : 1;
}
