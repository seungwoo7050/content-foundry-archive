import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { compileFromFile } from "json-schema-to-typescript";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const generatedRoot = join(packageRoot, "src", "generated");
const checkOnly = process.argv.includes("--check");

const contracts = [
  {
    version: "2.0.0",
    outputRoot: generatedRoot,
    schemas: [
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
    ],
  },
  {
    version: "3.0.0",
    outputRoot: join(generatedRoot, "3.0.0"),
    schemas: [
      "action-link-block",
      "article",
      "code-command-block",
      "content-block",
      "content",
      "gallery-block",
      "media-manifest",
      "navigation",
      "niche-component-block",
      "page",
      "redirects",
      "release",
      "site",
      "taxonomy",
    ],
  },
];

for (const contract of contracts) {
  const schemaRoot = join(packageRoot, "vendor", contract.version, "schemas");
  const options = {
    bannerComment: `/* Generated from contract ${contract.version}. Do not edit. */`,
    cwd: schemaRoot,
    style: { singleQuote: false },
    unreachableDefinitions: true,
  };

  await mkdir(contract.outputRoot, { recursive: true });

  for (const name of contract.schemas) {
    const source = join(schemaRoot, `${name}.schema.json`);
    const target = join(contract.outputRoot, `${name}.ts`);
    const generated = await compileFromFile(source, options);

    if (checkOnly) {
      const current = await readFile(target, "utf8").catch(() => "");
      if (current !== generated) {
        throw new Error(
          `Generated contract type is stale: ${contract.version}/${name}.ts`,
        );
      }
      continue;
    }

    await writeFile(target, generated);
  }
}
