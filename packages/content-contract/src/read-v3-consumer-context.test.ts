import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readV3ConsumerContextFile } from "./read-v3-consumer-context.js";

const roots: string[] = [];
const writeContext = (value: string | Buffer) => {
  const root = mkdtempSync(join(tmpdir(), "content-foundry-context-"));
  roots.push(root);
  const path = join(root, "consumer.json");
  writeFileSync(path, value);
  return path;
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

describe("readV3ConsumerContextFile", () => {
  it("reads the exact consumer context shape", () => {
    const context = readV3ConsumerContextFile(
      writeContext(
        JSON.stringify({
          generatedRoutes: ["/about", "/article/example"],
          nicheComponentRegistry: { "site-a": ["calculator"] },
        }),
      ),
    );

    expect([...context.generatedRoutes]).toEqual(["/about", "/article/example"]);
    expect(context.nicheComponentRegistry).toEqual({
      "site-a": ["calculator"],
    });
  });

  it.each([
    "[]",
    '{"generatedRoutes":"/about","nicheComponentRegistry":{}}',
    '{"generatedRoutes":["/about","/about"],"nicheComponentRegistry":{}}',
    '{"generatedRoutes":[],"nicheComponentRegistry":{"site-a":"widget"}}',
  ])("rejects malformed context %s", (source) => {
    expect(() => readV3ConsumerContextFile(writeContext(source))).toThrowError(
      expect.objectContaining({ name: "V3ConsumerContextFileError" }),
    );
  });

  it("rejects invalid UTF-8", () => {
    expect(() =>
      readV3ConsumerContextFile(writeContext(Buffer.from([0xc3, 0x28]))),
    ).toThrowError(expect.objectContaining({ name: "V3ConsumerContextFileError" }));
  });
});
