import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(appRoot, "../..");
const fixtureRoot = join(repositoryRoot, "packages/content-contract/vendor");
const objectPayloads = JSON.parse(
  readFileSync(join(appRoot, "fixtures/immutable-objects.json"), "utf8"),
);
const objectRoot = mkdtempSync(join(tmpdir(), "site-a-paired-media-"));
const productionOnlyKeys = Object.freeze([
  "SITE_ALLOWED_PRODUCTION_ORIGINS",
  "CONSENT_PROVIDER",
  "CONSENT_CONFIG_REVISION",
  "GOOGLE_CMP_READY",
  "SITE_OWNED_GA4_MEASUREMENT_ID",
  "SITE_OWNED_ADSENSE_CLIENT_ID",
  "ADSENSE_MANUAL_UNITS",
  "ADSENSE_AUTO_ADS_ENABLED",
  "ADSENSE_SITE_READY",
]);

function run(command, args, environment) {
  const result = spawnSync(command, args, {
    cwd: appRoot,
    env: environment,
    stdio: "inherit",
  });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed`);
}

function releaseEnvironment(version, immutableObjectDirectory = "") {
  const environment = { ...process.env };
  for (const key of productionOnlyKeys) delete environment[key];
  delete environment.CI;
  return {
    ...environment,
    RELEASE_MODE: "preview",
    CONTENT_RELEASE_DIR: join(
      fixtureRoot,
      `${version}/fixtures/bundles/valid/site-a-minimal`,
    ),
    IMMUTABLE_MEDIA_DIR: immutableObjectDirectory,
    SITE_ORIGIN: "",
    ENABLE_ANALYTICS: "false",
    ENABLE_ADS: "false",
  };
}

try {
  for (const [key, encoded] of Object.entries(objectPayloads)) {
    const target = resolve(objectRoot, key);
    const pathFromRoot = relative(objectRoot, target);
    assert.ok(
      pathFromRoot !== "" &&
        pathFromRoot !== ".." &&
        !pathFromRoot.startsWith(`..${sep}`),
      `Immutable fixture path escapes its root: ${key}`,
    );
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(encoded, "base64"));
  }

  for (const [version, immutableObjectDirectory] of [
    ["4.0.0", objectRoot],
    ["3.0.0", objectRoot],
    ["2.0.0", ""],
  ]) {
    const environment = releaseEnvironment(version, immutableObjectDirectory);
    run("pnpm", ["run", "build"], environment);
    run("pnpm", ["run", "verify:static"], environment);
  }
} finally {
  rmSync(objectRoot, { recursive: true, force: true });
}

console.log("Site A v4/v3/v2 static exports verified.");
