import { spawnSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BuildTargetConfigError } from "@content-foundry/site-core";

import { createQaBuildEnvironment } from "../qa/build-environment";
import { planQaStaticBuilds } from "../qa/build-matrix-plan";
import { verifyQaStaticBuild } from "../qa/verify-static-build";
import { writeQaPreviewGallery } from "../qa/write-preview-gallery";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (resolve(process.cwd()) !== appDirectory) {
  throw new BuildTargetConfigError(
    "QA site matrix builds must run from the Site A application directory",
  );
}

const args = process.argv.slice(2);
if (args.length > 1) {
  throw new BuildTargetConfigError("QA site matrix builds accept at most one quality path");
}
const repositoryDirectory = resolve(appDirectory, "../..");
const qualityDirectory = args[0]
  ? resolve(args[0])
  : resolve(repositoryDirectory, "output/quality-release");
const sitesDirectory = resolve(qualityDirectory, "sites");
const galleryTarget = resolve(qualityDirectory, "preview-gallery.html");
if (dirname(sitesDirectory) !== qualityDirectory) {
  throw new BuildTargetConfigError("QA sites target must be a direct child");
}
if (existsSync(galleryTarget)) {
  throw new BuildTargetConfigError("QA preview gallery target already exists");
}
const plans = planQaStaticBuilds({
  matrixDirectory: join(qualityDirectory, "releases"),
  qualityDirectory,
});
const appOutputDirectory = join(appDirectory, "out");
let owned = false;
let galleryOwned = false;

try {
  mkdirSync(sitesDirectory);
  owned = true;
  const dependencyEnvironment = createQaBuildEnvironment(
    process.env,
    plans[0]!.environment,
  ) as NodeJS.ProcessEnv;
  const dependencies = spawnSync(
    "pnpm",
    ["exec", "turbo", "run", "build", "--filter=@content-foundry/site-a^..."],
    {
      cwd: repositoryDirectory,
      env: dependencyEnvironment,
      stdio: "inherit",
    },
  );
  if (dependencies.error) throw dependencies.error;
  if (dependencies.status !== 0) {
    throw new Error("QA workspace dependency build failed");
  }
  for (const plan of plans) {
    const result = spawnSync("pnpm", ["run", "build"], {
      cwd: appDirectory,
      env: createQaBuildEnvironment(
        process.env,
        plan.environment,
      ) as NodeJS.ProcessEnv,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`QA site build failed for ${plan.id}`);
    }
    if (!lstatSync(appOutputDirectory).isDirectory()) {
      throw new Error(`QA site build did not create out for ${plan.id}`);
    }
    cpSync(appOutputDirectory, plan.outputDirectory, {
      recursive: true,
      force: false,
      errorOnExist: true,
    });
    verifyQaStaticBuild(plan);
  }
  writeQaPreviewGallery({ plans, qualityDirectory, repositoryDirectory });
  galleryOwned = true;
  process.stdout.write(`${sitesDirectory}\n`);
} catch (error) {
  if (galleryOwned) rmSync(galleryTarget, { force: true });
  if (owned) rmSync(sitesDirectory, { recursive: true, force: true });
  throw error;
}
