export class StrictJsonStringMapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StrictJsonStringMapError";
  }
}

const jsonWhitespace = new Set([" ", "\t", "\n", "\r"]);
const fail = (message: string): never => {
  throw new StrictJsonStringMapError(message);
};

function skipWhitespace(source: string, start: number): number {
  let cursor = start;
  while (jsonWhitespace.has(source[cursor] ?? "")) cursor += 1;
  return cursor;
}

function readString(source: string, start: number): readonly [string, number] {
  if (source[start] !== '"') return fail("expected a JSON string");
  let cursor = start + 1;
  while (cursor < source.length) {
    if (source[cursor] === "\\") {
      cursor += 2;
      continue;
    }
    if (source[cursor] === '"') {
      try {
        return [JSON.parse(source.slice(start, cursor + 1)) as string, cursor + 1];
      } catch {
        return fail("invalid JSON string");
      }
    }
    cursor += 1;
  }
  return fail("unterminated JSON string");
}

export function parseStrictJsonStringMap(
  source: string,
): ReadonlyArray<readonly [string, string]> {
  let cursor = skipWhitespace(source, 0);
  if (source[cursor] !== "{") return fail("expected one JSON object");
  cursor = skipWhitespace(source, cursor + 1);
  const pairs: Array<readonly [string, string]> = [];
  const seen = new Set<string>();
  if (source[cursor] === "}") cursor += 1;
  else while (true) {
    const [key, afterKey] = readString(source, cursor);
    if (seen.has(key)) return fail(`duplicate key ${key}`);
    seen.add(key);
    cursor = skipWhitespace(source, afterKey);
    if (source[cursor] !== ":") return fail("expected a colon");
    cursor = skipWhitespace(source, cursor + 1);
    const [value, afterValue] = readString(source, cursor);
    pairs.push([key, value]);
    cursor = skipWhitespace(source, afterValue);
    if (source[cursor] === "}") {
      cursor += 1;
      break;
    }
    if (source[cursor] !== ",") return fail("expected a comma");
    cursor = skipWhitespace(source, cursor + 1);
  }
  if (skipWhitespace(source, cursor) !== source.length) {
    return fail("expected one exact JSON object");
  }
  return pairs;
}
