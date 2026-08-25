import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BuildTargetConfigError } from "@content-foundry/site-core";

import { writeQaReleaseMatrix } from "../qa/write-release-matrix";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (resolve(process.cwd()) !== appDirectory) {
  throw new BuildTargetConfigError(
    "QA release matrix generation must run from the Site A application directory",
  );
}

const args = process.argv.slice(2);
if (args.length > 1) {
  throw new BuildTargetConfigError("QA release matrix accepts at most one parent path");
}
const repositoryDirectory = resolve(appDirectory, "../..");
const parent = args[0]
  ? resolve(args[0])
  : resolve(repositoryDirectory, "output/quality-release");
mkdirSync(parent, { recursive: true });
const target = writeQaReleaseMatrix(parent, "releases");
process.stdout.write(`${target}\n`);
