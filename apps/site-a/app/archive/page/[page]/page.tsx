import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createArchiveMetadata } from "../../../../lib/archive-metadata";
import {
  getArchiveAdditionalPageStaticParams,
  resolveArchiveAdditionalPage,
} from "../../../../lib/archive-page-route";
import { createArchiveThemeViewModel } from "../../../../lib/archive-theme-view-model";
import { getVersionedSiteReleaseContext } from "../../../../lib/site-release";
import { renderThemePage } from "../../../../lib/theme-page";

export const dynamicParams = false;

interface ArchiveAdditionalPageProps {
  readonly params: Promise<{ readonly page: string }>;
}

export function generateStaticParams() {
  return getArchiveAdditionalPageStaticParams(
    getVersionedSiteReleaseContext().bundle,
  );
}

export async function generateMetadata({
  params,
}: ArchiveAdditionalPageProps): Promise<Metadata> {
  const { page: value } = await params;
  const context = getVersionedSiteReleaseContext();
  const page = resolveArchiveAdditionalPage(context.bundle, value);
  if (page === null) notFound();
  return createArchiveMetadata(context, page);
}

export default async function ArchiveAdditionalPage({
  params,
}: ArchiveAdditionalPageProps) {
  const { page: value } = await params;
  const { bundle } = getVersionedSiteReleaseContext();
  const page = resolveArchiveAdditionalPage(bundle, value);
  if (page === null) notFound();
  return renderThemePage(
    bundle,
    createArchiveThemeViewModel(bundle, page),
  );
}
