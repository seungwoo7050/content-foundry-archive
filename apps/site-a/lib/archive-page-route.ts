import { getArchiveEntries, type ArchiveSource } from "./archive-view-model";
import {
  getStaticListAdditionalPages,
  resolveStaticListAdditionalPage,
} from "./static-list-pagination";

export function getArchiveAdditionalPageStaticParams(bundle: ArchiveSource) {
  return getStaticListAdditionalPages(getArchiveEntries(bundle).length).map(
    (page) => ({ page: String(page) }),
  );
}

export function resolveArchiveAdditionalPage(
  bundle: ArchiveSource,
  value: string,
): number | null {
  return resolveStaticListAdditionalPage(
    value,
    getArchiveEntries(bundle).length,
  );
}
