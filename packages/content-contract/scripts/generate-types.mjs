import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { compileFromFile } from "json-schema-to-typescript";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaRoot = join(packageRoot, "vendor", "2.0.0", "schemas");
const outputRoot = join(packageRoot, "src", "generated");
const checkOnly = process.argv.includes("--check");

const schemas = [
  "article",
  "content-block",
  "content",
  "media-manifest",
  "navigation",
  "page",
  "redirects",
  "release",
  "site",
  "taxonomy",
];

const options = {
  bannerComment: "/* Generated from contract 2.0.0. Do not edit. */",
  cwd: schemaRoot,
  style: { singleQuote: false },
  unreachableDefinitions: true,
};

await mkdir(outputRoot, { recursive: true });

for (const name of schemas) {
  const source = join(schemaRoot, `${name}.schema.json`);
  const target = join(outputRoot, `${name}.ts`);
  const generated = await compileFromFile(source, options);

  if (checkOnly) {
    const current = await readFile(target, "utf8").catch(() => "");
    if (current !== generated) {
      throw new Error(`Generated contract type is stale: ${name}.ts`);
    }
    continue;
  }

  await writeFile(target, generated);
}
