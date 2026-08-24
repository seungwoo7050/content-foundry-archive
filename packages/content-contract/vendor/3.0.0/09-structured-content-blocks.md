# 09. Structured Content Blocks

## 1. Scope and compatibility

Contract `3.0.0` carries forward the eight `heading`, `paragraph`, `list`,
`quote`, `callout`, `image`, `table`, and `embed` block shapes from `2.0.0`
unchanged. It adds the five `gallery`, `code`, `command`, `action-link`, and
`niche-component` discriminators through one closed content-block union.

The normative aggregate schemas are
[`schemas/content-block.schema.json`](schemas/content-block.schema.json) and
[`schemas/content.schema.json`](schemas/content.schema.json). Article and page
schemas reference that aggregate rather than selecting individual block-family
schemas.

A consumer declaring `3.0.0` support accepts every released branch and rejects
unknown discriminators. A subset renderer is not a compatible v3 consumer.
Version dispatch, producer adoption, and rollback follow
[`05-error-versioning-compatibility-contract.md`](05-error-versioning-compatibility-contract.md).

## 2. Gallery block

A `gallery` block is an ordered group of at least two image references. A single
image uses the existing `image` block shape carried forward into v3. The
normative shape is
[`schemas/gallery-block.schema.json`](schemas/gallery-block.schema.json).

The `items` order is editorial source order. Each item supplies a `mediaId` and
may add a plain-text caption; the optional top-level caption describes the group
as a whole. Every referenced ID must resolve to an image in the same release's
media manifest. Each gallery image is informative, so its manifest record's
`alt` value must contain at least one non-whitespace character. Credit, license,
and integrity data remain on the media record; a gallery caption does not
replace per-image alt text.

A missing media reference fails with `REFERENCE_INVALID`; whitespace-only alt
text fails with `CONTRACT_INVALID`. Themes may choose the visual presentation,
but static output must preserve item order and expose every referenced image and
any supplied caption. Layout, carousel, crop, and loading choices are not
gallery contract fields.

## 3. Code and command blocks

A `code` block publishes an inert source example, while a `command` block
publishes inert command input for a reader. Their normative shapes share
[`schemas/code-command-block.schema.json`](schemas/code-command-block.schema.json)
but retain separate discriminators and value fields.

Code requires a stable lowercase `language` label and literal `code`. Command
requires a stable lowercase `shell` label and literal `command`. Unknown labels
fall back to plain preformatted text; they never select or load an executable
runtime. Optional captions are plain text.

Consumers preserve spaces, tabs, and line breaks while escaping every value.
They must not parse these values as Markdown, HTML, templates, or scripts, and
must never evaluate, interpolate, or execute them during build or in a browser.
The public-only projection rule continues to prohibit credentials, tokens,
private object-store URLs, and other secrets in either value.

A command value contains only the copyable input, without a prompt glyph or
captured output. The block does not certify that input is safe; risk and
privilege warnings belong in surrounding structured content and editorial
review. Syntax colors, copy controls, prompts, line numbers, wrapping, and
scrolling are presentation concerns, not contract fields. Static output must
preserve the complete value and communicate code versus command without
depending only on color or client-side JavaScript.

## 4. Action-link block

An `action-link` is a prominent, descriptive navigation link. Its visible label
identifies both the destination and the reader's purpose. The normative shape
is
[`schemas/action-link-block.schema.json`](schemas/action-link-block.schema.json).

`internal` actions use a canonical root-relative path. The path must resolve
directly to a generated, non-gone route in the same release; a missing or
retired target fails with `REFERENCE_INVALID`. Query strings, fragments,
protocol-relative paths, and redirect-wrapper destinations are not internal
action-link fields.

External actions are classified as `official` or `affiliate` and use an
absolute URL with a lowercase `https://` scheme. Official classification
requires editorial verification; affiliate classification requires a visible
placement disclosure. Consumers must not infer or change the classification
from a hostname or query string. Normal external references remain
ordinary/source links rather than actions.

External URLs must contain a host and no credentials. An absolute URL matching
the site's own origin is invalid and must use an `internal` path instead.
External reachability is an operational link check, not schema validation, and
the public-only rule still prohibits private object-store URLs.

Consumers render a direct static link and derive disclosure, safe link
attributes, and consent-gated analytics classification from `kind`. Producer
data cannot select a new browsing context, inject tracking/event fields, or
control icon, style, or button variants. Link meaning and classification remain
available without JavaScript and never depend only on color or an icon.

## 5. Niche-component block

A `niche-component` references a pre-registered, self-contained site
enhancement. The normative shape is
[`schemas/niche-component-block.schema.json`](schemas/niche-component-block.schema.json).

`componentId` is an opaque lowercase key in the source-controlled registry for
the release's `siteId`. Consumers resolve it through an exact registry lookup;
they must not treat it as a module name, import specifier, or file path. A
missing or wrong-site registration fails with `REFERENCE_INVALID`. The static
fallback does not turn an unresolved registry reference into a successful
build.

A component ID is publishable only when ContentOps publication policy enables
it for the release's `siteId` and the target Public Sites deployment registers
the same ID. Producer and consumer perform those exact `(siteId, componentId)`
checks independently.

`label` is the visible plain-text name of the enhancement. `fallbackText` is
public plain text, not Markdown, HTML, a template, or code. Consumers escape
both values and include their complete content in the initial static output.
The fallback must convey the component's purpose, indispensable editorial
meaning, and a useful non-JavaScript next step; merely asking the reader to
enable JavaScript is not a fallback. Optional client-side behavior may enhance
or replace the presentation after load, but must not change or contradict the
meaning available in the static output.

This v3 block is reference-only and carries no component-specific data or
configuration. Registered implementations may provide fixed local behavior and
use transient reader input. Publishable facts, dates, calculator rates or
parameters, comparison rows, timeline events, and checklist items must remain
in `fallbackText` or surrounding ordinary blocks; registry code cannot be their
sole source. Consequently, this block does not define reusable data-driven
comparison, calculator, timeline, or checklist payloads. A later contract may
add a closed component-specific shape. An incompatible component meaning
requires a new `componentId`; consumers retain old registry entries while
corresponding immutable releases remain rollback candidates.

Producer data cannot name a module or import path, configure an endpoint or
request, or select a script, raw-markup mode, execution mode, persistence
behavior, style, theme, or analytics event. A registered component must not
query ContentOps, require a request-time backend, or turn the public site into
an authenticated or personalized application.

## 6. Aggregate content schemas

The closed v3 content-block union is
[`schemas/content-block.schema.json`](schemas/content-block.schema.json), and
[`schemas/content.schema.json`](schemas/content.schema.json) applies that union
to document content arrays. The union carries forward all eight `2.0.0` block
shapes unchanged and adds the five v3 discriminators through their focused
schemas.

Article and page projections must reference this aggregate. Consumers must
apply the reference, semantic, static-fallback, and security requirements above
after strict schema validation.

## 7. Conformance fixtures

Focused fixtures, the complete immutable bundle, external test context, and the
exact invalid-bundle mutation recipes are defined in
[`06-validation-and-fixtures.md`](06-validation-and-fixtures.md).
