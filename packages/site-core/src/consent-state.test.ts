import { describe, expect, it } from "vitest";

import {
  createConsentState,
  parseConsentState,
  serializeConsentState,
} from "./consent-state.js";

const revision = "sha256:config-a";
const unset = { status: "unset", configRevision: revision, analytics: "denied", advertising: "denied" };

describe("provider-neutral consent state", () => {
  it("creates and serializes an explicit revision-bound selection", () => {
    const state = createConsentState(revision, {
      analytics: "granted",
      advertising: "denied",
    });
    const serialized = serializeConsentState(state);

    expect(serialized).toBe(
      '{"version":"1.0.0","configRevision":"sha256:config-a","analytics":"granted","advertising":"denied"}',
    );
    expect(parseConsentState(serialized, revision)).toEqual(state);
  });

  it.each([undefined, null, "", "not-json", "null", "[]"])(
    "fails closed for missing or broken storage %j",
    (serialized) => {
      expect(parseConsentState(serialized, revision)).toEqual(unset);
    },
  );

  it("invalidates a selection from another config revision", () => {
    const serialized = serializeConsentState(
      createConsentState("sha256:config-old", {
        analytics: "granted",
        advertising: "granted",
      }),
    );

    expect(parseConsentState(serialized, revision)).toEqual(unset);
  });

  it.each([
    { version: "2.0.0", configRevision: revision, analytics: "granted", advertising: "denied" },
    { version: "1.0.0", configRevision: revision, analytics: "pending", advertising: "denied" },
    { version: "1.0.0", configRevision: revision, analytics: "denied", advertising: "yes" },
    { version: "1.0.0", configRevision: revision, analytics: "denied", advertising: "denied", extra: true },
    { version: "1.0.0", configRevision: revision, analytics: "denied" },
  ])("rejects a non-exact stored payload %#", (payload) => {
    expect(parseConsentState(JSON.stringify(payload), revision)).toEqual(unset);
  });

  it("preserves independent explicit decisions", () => {
    const state = createConsentState(revision, {
      analytics: "denied",
      advertising: "granted",
    });

    expect(parseConsentState(serializeConsentState(state), revision)).toEqual(state);
  });
});
