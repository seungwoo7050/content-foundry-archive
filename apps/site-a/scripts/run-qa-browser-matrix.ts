import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { lstatSync } from "node:fs";
import { once } from "node:events";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { BuildTargetConfigError } from "@content-foundry/site-core";

import { planQaBrowserMatrix } from "../qa/browser-matrix-plan";
import { planQaStaticBuilds } from "../qa/build-matrix-plan";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (resolve(process.cwd()) !== appDirectory) {
  throw new BuildTargetConfigError(
    "QA browser matrix must run from the Site A application directory",
  );
}
if (process.argv.length !== 2) {
  throw new BuildTargetConfigError("QA browser matrix accepts no arguments");
}

const repositoryDirectory = resolve(appDirectory, "../..");
const qualityDirectory = join(repositoryDirectory, "output/quality-release");
const serveConfig = join(repositoryDirectory, "serve.json");
const serveCommand = join(repositoryDirectory, "node_modules/.bin/serve");
const playwrightCommand = join(repositoryDirectory, "node_modules/.bin/playwright");
const origin = "http://127.0.0.1:4174";
const specs = ["qa-static", "qa-accessibility", "qa-interactions"]
  .map((name) => `apps/site-a/e2e/${name}.spec.ts`);

for (const path of [serveConfig, serveCommand, playwrightCommand]) {
  if (!lstatSync(path).isFile()) throw new BuildTargetConfigError(
    `QA browser dependency is not a file: ${path}`,
  );
}

const buildPlans = planQaStaticBuilds({
  matrixDirectory: join(qualityDirectory, "releases"), qualityDirectory,
});
const browserPlans = planQaBrowserMatrix({ qualityDirectory, buildPlans });
const diagnosticId = process.env.QA_BROWSER_DIAGNOSTIC_VARIANT_ID;
const diagnosticPlan = diagnosticId === undefined
  ? undefined
  : browserPlans.find(({ id }) => id === diagnosticId);
if (diagnosticId !== undefined && diagnosticPlan === undefined) {
  throw new BuildTargetConfigError("QA_BROWSER_DIAGNOSTIC_VARIANT_ID must "
    + "exactly match the QA registry");
}
const selectedPlans = diagnosticPlan ? [diagnosticPlan] : browserPlans;

async function waitUntilReady(server: ChildProcess): Promise<void> {
  let spawnError: Error | undefined;
  server.once("error", (error) => { spawnError = error; });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await delay(100);
    if (spawnError) throw spawnError;
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(
        `QA static server exited before readiness: ${server.exitCode ?? server.signalCode}`,
      );
    }
    try {
      const response = await fetch(origin, {
        redirect: "manual", signal: AbortSignal.timeout(500),
      });
      if (response.ok) return;
    } catch {
      // The owned server may still be binding its loopback socket.
    }
  }
  throw new Error(`QA static server did not become ready at ${origin}`);
}

async function terminate(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null || server.signalCode !== null
    || server.pid === undefined) return;
  const exited = once(server, "exit");
  server.kill("SIGTERM");
  await Promise.race([exited, delay(2_000)]);
  if (server.exitCode === null && server.signalCode === null) {
    const killed = once(server, "exit");
    server.kill("SIGKILL");
    await killed;
  }
}

for (const [index, plan] of selectedPlans.entries()) {
  process.stdout.write(`[QA browser ${index + 1}/${selectedPlans.length}] ${plan.id}\n`);
  const server = spawn(serveCommand, [
    plan.staticDirectory, "--config", serveConfig,
    "--listen", `tcp://${new URL(origin).host}`,
    "--no-clipboard",
  ], {
    cwd: repositoryDirectory,
    env: { ...process.env, NO_UPDATE_CHECK: "1" },
    stdio: ["ignore", "ignore", "inherit"],
  });
  try {
    await waitUntilReady(server);
    const result = spawnSync(playwrightCommand, ["test", ...specs], {
      cwd: repositoryDirectory,
      env: {
        ...process.env, QUALITY_BASE_URL: origin, QUALITY_VARIANT_ID: plan.id,
      },
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`QA browser checks failed for ${plan.id}`);
    }
  } finally {
    await terminate(server);
  }
}

process.stdout.write(`QA browser matrix passed ${selectedPlans.length} variant(s).\n`);
