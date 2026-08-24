import { describe, expect, it } from "vitest";

import {
  StrictJsonStringMapError,
  parseStrictJsonStringMap,
} from "./strict-json-string-map.js";

describe("strict JSON string map", () => {
  it("returns decoded entries without losing source order", () => {
    expect(parseStrictJsonStringMap(
      ' { "home\\u002dfeed" : "123", "article-end": "456" } ',
    )).toEqual([
      ["home-feed", "123"],
      ["article-end", "456"],
    ]);
  });

  it.each([
    "",
    "null",
    "[]",
    '{"slot":123}',
    '{"slot":"123",}',
    '{"slot":"123"} trailing',
  ])("rejects non-exact flat string map %j", (serialized) => {
    expect(() => parseStrictJsonStringMap(serialized))
      .toThrow(StrictJsonStringMapError);
  });

  it.each([
    '{"home-feed":"123","home-feed":"456"}',
    '{"home-feed":"123","home\\u002dfeed":"456"}',
  ])("rejects semantically duplicate keys", (serialized) => {
    expect(() => parseStrictJsonStringMap(serialized))
      .toThrow(StrictJsonStringMapError);
  });
});
