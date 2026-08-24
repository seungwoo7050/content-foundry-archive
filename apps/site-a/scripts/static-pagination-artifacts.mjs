function parsePaginationRoute(value, pattern) {
  const match = value.match(pattern);
  if (!match) return null;
  const [, base, pageValue] = match;
  const page = Number(pageValue);
  if (!/^[1-9]\d*$/.test(pageValue) || !Number.isSafeInteger(page) || page < 2) {
    throw new RangeError(`Invalid static pagination path: ${value}`);
  }
  return `/${base}/page/${pageValue}`;
}

export function getPaginationRouteFromArtifact(relativePath) {
  return parsePaginationRoute(
    relativePath,
    /^(archive|category\/[^/]+)\/page\/([^/]+)\.html$/,
  );
}

export function getPaginationRouteFromPathname(pathname) {
  return parsePaginationRoute(
    pathname,
    /^\/(archive|category\/[^/]+)\/page\/([^/]+)$/,
  );
}
