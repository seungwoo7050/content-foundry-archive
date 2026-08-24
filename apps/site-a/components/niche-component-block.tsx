import type { PublishedNicheComponentBlockV3 } from "@content-foundry/content-contract";
import type { ReactElement } from "react";

export type RegisteredNicheComponent = ReactElement<
  Record<string, never>
>;
export type NicheComponentRegistry = ReadonlyMap<
  string,
  ReadonlyMap<string, RegisteredNicheComponent>
>;

interface NicheComponentBlockProps {
  readonly block: PublishedNicheComponentBlockV3;
  readonly registry: NicheComponentRegistry;
  readonly siteId: string;
}

export class UnregisteredNicheComponentError extends Error {
  readonly code = "NICHE_COMPONENT_UNREGISTERED";

  constructor() {
    super("Niche component is not registered for this site");
    this.name = "UnregisteredNicheComponentError";
  }
}

export function NicheComponentBlock({
  block,
  registry,
  siteId,
}: NicheComponentBlockProps) {
  const implementation = registry.get(siteId)?.get(block.componentId);
  if (implementation === undefined) {
    throw new UnregisteredNicheComponentError();
  }

  return (
    <figure className="content-niche-component">
      <figcaption>{block.label}</figcaption>
      <p>{block.fallbackText}</p>
      {implementation}
    </figure>
  );
}
