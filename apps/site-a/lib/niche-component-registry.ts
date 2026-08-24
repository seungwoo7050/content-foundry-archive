import {
  type NicheComponentRegistry,
  type RegisteredNicheComponent,
} from "../components/niche-component-block";

function compareIds(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function createSiteNicheComponentRegistry(): NicheComponentRegistry {
  return new Map([["site-a", new Map<string, RegisteredNicheComponent>()]]);
}

export function projectNicheComponentIds(
  registry: NicheComponentRegistry,
): Readonly<Record<string, readonly string[]>> {
  return Object.fromEntries(
    [...registry.entries()]
      .sort(([left], [right]) => compareIds(left, right))
      .map(([siteId, components]) => [
        siteId,
        [...components.keys()].sort(compareIds),
      ]),
  );
}
