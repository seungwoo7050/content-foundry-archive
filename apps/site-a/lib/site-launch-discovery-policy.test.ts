import { describe, expect, it } from "vitest";

import {
  SITE_A_LAUNCH_CATEGORIES,
  SITE_A_PRIMARY_NAVIGATION_PATHS,
  validateSiteLaunchDiscovery,
} from "./site-launch-discovery-policy";

const completeSource = {
  site: { search: { enabled: true } },
  taxonomy: {
    categories: SITE_A_LAUNCH_CATEGORIES.map((category) => ({
      ...category,
      description: `${category.label} 실용 안내`,
    })),
  },
  navigation: {
    items: SITE_A_PRIMARY_NAVIGATION_PATHS.map((path, index) => {
      const category = SITE_A_LAUNCH_CATEGORIES[index - 1];
      return {
        id: category?.id ?? (path === "/" ? "home" : path.slice(1)),
        label: category?.label ?? path,
        path,
        children: [],
      };
    }),
  },
  articles: SITE_A_LAUNCH_CATEGORIES.map(({ id }, index) => ({
    id: `ART-LAUNCH-${index}`,
    categoryId: id,
    content: [{ type: "paragraph", markdown: `${id} 실용 안내` }],
  })),
};

describe("Site A launch discovery policy", () => {
  it("accepts the exact production discovery surface", () => {
    expect(() => validateSiteLaunchDiscovery("production", completeSource))
      .not.toThrow();
  });

  it.each(["template", "preview"] as const)(
    "does not apply production discovery policy in %s",
    (mode) => expect(() => validateSiteLaunchDiscovery(mode, {
      site: { search: { enabled: false } },
      taxonomy: { categories: [] },
      navigation: { items: [] },
      articles: [],
    })).not.toThrow(),
  );

  it("reports empty taxonomy, discovery, and published content together", () => {
    expect(() => validateSiteLaunchDiscovery("production", {
      site: { search: { enabled: false } },
      taxonomy: { categories: [] },
      navigation: { items: [] },
      articles: [{
        id: "ART-EMPTY",
        categoryId: "daily-admin",
        content: [{ type: "paragraph", markdown: "  " }],
      }],
    })).toThrow(expect.objectContaining({
      issues: [
        "production taxonomy must match the five Site A launch categories in charter order",
        "production static search must be enabled",
        "production primary navigation must expose home, five categories, search, and about in charter order",
        "production navigation must identify the five Site A categories once in charter order",
        "published article ART-EMPTY content is empty",
        ...SITE_A_LAUNCH_CATEGORIES.map(({ id }) => (
          `${id} category requires a non-empty published article`
        )),
      ],
    }));
  });

  it("rejects a duplicate category path even when all five identities exist", () => {
    const items = [...completeSource.navigation.items];
    items.splice(2, 0, items[1]!);

    expect(() => validateSiteLaunchDiscovery("production", {
      ...completeSource,
      navigation: { items },
    })).toThrow(expect.objectContaining({
      issues: expect.arrayContaining([
        "production primary navigation must expose home, five categories, search, and about in charter order",
        "production navigation must identify the five Site A categories once in charter order",
      ]),
    }));
  });

  it("rejects a launch category without a public description", () => {
    const categories = completeSource.taxonomy.categories.map((category, index) => (
      index === 0 ? { ...category, description: "   " } : category
    ));

    expect(() => validateSiteLaunchDiscovery("production", {
      ...completeSource,
      taxonomy: { categories },
    })).toThrow(expect.objectContaining({
      issues: ["category daily-admin requires a non-empty description"],
    }));
  });
});
