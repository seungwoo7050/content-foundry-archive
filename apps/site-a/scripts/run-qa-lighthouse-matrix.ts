import { spawnSync } from "node:child_process";
import { lstatSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BuildTargetConfigError } from "@content-foundry/site-core";

import { planQaBrowserMatrix } from "../qa/browser-matrix-plan";
import { planQaStaticBuilds } from "../qa/build-matrix-plan";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (resolve(process.cwd()) !== appDirectory) {
  throw new BuildTargetConfigError(
    "QA Lighthouse matrix must run from the Site A application directory",
  );
}
if (process.argv.length !== 2) {
  throw new BuildTargetConfigError("QA Lighthouse matrix accepts no arguments");
}

const repositoryDirectory = resolve(appDirectory, "../..");
const qualityDirectory = join(repositoryDirectory, "output/quality-release");
const sitesDirectory = join(qualityDirectory, "sites");
const reportsDirectory = join(qualityDirectory, "lighthouse");
const lighthouseCommand = join(repositoryDirectory, "node_modules/.bin/lhci");
const lighthouseConfig = join(repositoryDirectory, "lighthouserc.cjs");

for (const path of [lighthouseCommand, lighthouseConfig]) {
  if (!lstatSync(path).isFile()) {
    throw new BuildTargetConfigError(`QA Lighthouse dependency is not a file: ${path}`);
  }
}

const buildPlans = planQaStaticBuilds({
  matrixDirectory: join(qualityDirectory, "releases"),
  qualityDirectory,
});
const plans = planQaBrowserMatrix({ qualityDirectory, buildPlans });
const diagnosticId = process.env.QA_LIGHTHOUSE_DIAGNOSTIC_VARIANT_ID;
const diagnosticPlan = diagnosticId === undefined
  ? undefined
  : plans.find(({ id }) => id === diagnosticId);
if (diagnosticId !== undefined && diagnosticPlan === undefined) {
  throw new BuildTargetConfigError(
    "QA_LIGHTHOUSE_DIAGNOSTIC_VARIANT_ID must exactly match the QA registry",
  );
}
const selectedPlans = diagnosticPlan ? [diagnosticPlan] : plans;

for (const plan of selectedPlans) {
  if (dirname(plan.staticDirectory) !== sitesDirectory
    || !lstatSync(plan.staticDirectory).isDirectory()) {
    throw new BuildTargetConfigError(`QA static site is missing or unsafe: ${plan.id}`);
  }
}

let owned = false;
try {
  mkdirSync(reportsDirectory);
  owned = true;
  for (const [index, plan] of selectedPlans.entries()) {
    const reportDirectory = join(reportsDirectory, plan.id);
    if (dirname(reportDirectory) !== reportsDirectory) {
      throw new BuildTargetConfigError(`QA Lighthouse report path is unsafe: ${plan.id}`);
    }
    process.stdout.write(
      `[QA Lighthouse ${index + 1}/${selectedPlans.length}] ${plan.id}\n`,
    );
    const result = spawnSync(lighthouseCommand, [
      "autorun",
      `--config=${lighthouseConfig}`,
      "--failOnUploadFailure",
    ], {
      cwd: repositoryDirectory,
      env: {
        ...process.env,
        QA_LIGHTHOUSE_STATIC_DIST_DIR: plan.staticDirectory,
        QA_LIGHTHOUSE_OUTPUT_DIR: reportDirectory,
      },
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`QA Lighthouse checks failed for ${plan.id}`);
    }
    if (!lstatSync(reportDirectory).isDirectory()) {
      throw new Error(`QA Lighthouse reports are missing for ${plan.id}`);
    }
  }
  process.stdout.write(`QA Lighthouse matrix passed ${selectedPlans.length} variant(s).\n`);
} catch (error) {
  if (owned) rmSync(reportsDirectory, { recursive: true, force: true });
  throw error;
}
