# 08. Bundle Layout and Integrity

## Canonical layout

```text
release.json
site.json
navigation.json
taxonomy.json
presentation.json
articles/<article-id>.json
pages/<page-id>.json
media/media-manifest.json
media/<binary-assets>
redirects.json
checksums.txt
```

`search-index.json` is not a producer record. Public Sites generates its
search index from validated articles and taxonomy during the build.

## File checksum manifest

`checksums.txt` covers every regular logical bundle file except `release.json`
and `checksums.txt` itself. This includes media binaries when present.

Each line is exactly:

```text
<64 lowercase SHA-256 hex><two ASCII spaces><POSIX relative path><LF>
```

Rules:

- paths contain no leading `./`, absolute prefix, `..`, backslash, or empty
  segment;
- entries are sorted by the UTF-8 bytes of the path;
- duplicate, missing, and unlisted files fail integrity validation;
- blank lines, comments, CRLF, symbolic links, and non-regular payload entries
  are forbidden;
- the final line also ends with LF.

The per-file hash is computed over the exact transported bytes. JSON whitespace
therefore remains integrity-sensitive for every record except `release.json`.

## Bundle checksum

The bundle checksum protects the logical release manifest without creating a
self-reference.

1. Parse `release.json` as JSON and require exactly one `bundleChecksum` field.
2. Replace its value in memory with
   `sha256:0000000000000000000000000000000000000000000000000000000000000000`.
3. Serialize that object with the JSON Canonicalization Scheme (RFC 8785) to
   UTF-8 bytes. Do not append whitespace.
4. Append one LF byte (`0a`).
5. Append the exact transported bytes of `checksums.txt`.
6. SHA-256 the combined bytes and prefix the lowercase hex digest with
   `sha256:`.
7. Require that result to equal the original `release.json.bundleChecksum`.

Changing any release field, listed payload byte, file path, or manifest order
changes the resulting identity.

## Validation order

1. Resolve and support `contractVersion`.
2. Reject unsafe filesystem entries and parse `checksums.txt`.
3. Verify the complete file set and per-file hashes.
4. Verify `bundleChecksum`.
5. Validate JSON schemas.
6. Validate cross-record references and route semantics.

Failures in steps 2–4 use `INTEGRITY_FAILED`; schema failures use
`CONTRACT_INVALID`; unresolved references use `REFERENCE_INVALID`.
