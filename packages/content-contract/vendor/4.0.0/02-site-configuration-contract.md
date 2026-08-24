# 02. Site Configuration Contract

## 1. Purpose

`site.json` describes public behavior that ContentOps and Public Sites must agree on. It is not a replacement for source-controlled theme implementation.

## 2. Stable site identity

Every logical site has a stable `siteId` such as `site-a`. The ID must not be derived from the domain because domains may change.

A site owns:

- one production origin at a time;
- locale and timezone;
- public brand identity;
- navigation and taxonomy configuration;
- default theme and skin selection;
- analytics and advertising public identifiers/configuration;
- legal/public pages;
- feature flags that affect public rendering.

## 3. SiteConfig shape

Normative schema: `schemas/site.schema.json`.

Representative data:

```json
{
  "id": "site-a",
  "origin": "https://example.com",
  "locale": "ko-KR",
  "timeZone": "Asia/Seoul",
  "name": "생활메모",
  "shortName": "생활메모",
  "description": "실생활에 도움이 되는 정보를 정리하는 1인 운영 블로그",
  "defaultTheme": "friendly-mobile-utility",
  "defaultSkin": "calm-blue",
  "author": {
    "displayName": "생활메모",
    "profileId": "owner"
  },
  "analytics": {
    "provider": "ga4",
    "publicMeasurementId": null
  },
  "ads": {
    "provider": "adsense",
    "enabled": false,
    "publicClientId": null
  },
  "search": {"enabled": true},
  "featureFlags": {}
}
```

## 4. Secrets

`site.json` must contain public identifiers only. Secrets are never transported in the bundle.

Examples of data that remain deployment secrets:

- private API keys;
- service-account credentials;
- deploy tokens;
- object-store write credentials;
- ContentOps authentication tokens.

Public values such as a GA4 measurement ID or AdSense publisher/client identifier may be represented only when they are intentionally browser-visible.

## 5. Themes and skins

Theme IDs frozen for the first implementation:

- `editorial-utility`
- `clean-personal-blog`
- `information-portal`
- `minimal-knowledge-base`
- `friendly-mobile-utility`

A theme controls layout and UI patterns. A skin controls brand/color tokens without changing content semantics.

`defaultTheme` and `defaultSkin` are release inputs. Preview environments may expose protected theme selection. Production must not create multiple indexable copies of identical content merely to expose themes.

## 6. Site A scope

Site A begins as a single-owner general practical-information blog. Its initial taxonomy may cover broad categories such as:

- life/administration;
- digital/apps/web services;
- broadcasting/events;
- consumption/products/services;
- timely practical information.

This taxonomy is configuration, not a permanent limitation of the platform.

## 7. Site isolation

A production build fails when:

- release `siteId` and `site.json.id` differ;
- the configured origin is not approved for that site/environment;
- canonical URLs resolve to another owned site without an explicit rule;
- another site's analytics or advertising public IDs are accidentally reused where isolation is required;
- placeholder brand/legal/contact values remain in production.

## 8. Site B/C/D expansion

Adding another site must not require changes to ContentOps' public contract unless the new site needs a genuinely new public data capability.

A normal new-site operation should be expressible through:

- new `siteId`;
- new site configuration;
- taxonomy/navigation configuration;
- theme/skin selection or site-specific presentation code;
- deployment target and domain configuration.
