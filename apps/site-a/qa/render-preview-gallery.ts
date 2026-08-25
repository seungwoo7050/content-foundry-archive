export interface QaPreviewGalleryCard {
  readonly command: string;
  readonly origin: string;
  readonly outputLocator: string;
  readonly skin: string;
  readonly theme: string;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function renderQaPreviewGallery(cards: readonly QaPreviewGalleryCard[]): string {
  const items = cards.map((card) => `<li><article>`
    + `<p class="status">QA ONLY · PROVIDERS OFF · ANALYTICS OFF · ADS OFF</p>`
    + `<h2>${escapeHtml(card.theme)}</h2><p>Skin: <code>${escapeHtml(card.skin)}</code></p>`
    + `<p class="origin">Reserved QA origin: ${escapeHtml(card.origin)}</p>`
    + `<p>Verified output: <code>${escapeHtml(card.outputLocator)}</code></p>`
    + `<p>저장소 루트에서 한 번에 한 변형씩 실행:</p>`
    + `<pre><code>${escapeHtml(card.command)}</code></pre>`
    + `<p>실행 후 <code>http://127.0.0.1:4173/</code>에서 검토합니다.</p>`
    + `</article></li>`);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<meta name="robots" content="noindex,nofollow,noarchive">`
    + `<meta name="referrer" content="no-referrer">`
    + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">`
    + `<title>QA 비운영 Public Sites 프리뷰 갤러리</title><style>`
    + `*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#172033;font:16px/1.55 system-ui,sans-serif}`
    + `header,main{width:min(1180px,calc(100% - 32px));margin:auto}header{padding:48px 0 24px}`
    + `.warning{border-left:6px solid #b42318;background:#fff1f0;padding:16px 20px;font-weight:700}`
    + `ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;padding:0;list-style:none}`
    + `article{height:100%;padding:22px;border:1px solid #ccd3df;border-radius:14px;background:#fff;box-shadow:0 8px 24px #17203312}`
    + `h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.08}h2{overflow-wrap:anywhere}`
    + `.status{color:#8a1c14;font-size:.78rem;font-weight:800;letter-spacing:.06em}.origin{overflow-wrap:anywhere}`
    + `pre{overflow:auto;padding:12px;border-radius:8px;background:#eef2f6;font-size:.8rem}code{overflow-wrap:anywhere}`
    + `</style></head><body><header><p>PUBLIC SITES QUALITY RELEASE</p>`
    + `<h1>QA 비운영 프리뷰 갤러리</h1>`
    + `<p class="warning">운영 사이트가 아닙니다. 합성 콘텐츠이며 분석·광고 provider는 꺼져 있고 검색 노출이 금지됩니다.</p>`
    + `<p>Contract 4 실제 loader로 생성한 정확히 ${items.length}개의 theme×skin 정적 변형입니다.</p>`
    + `</header><main><ol>${items.join("")}</ol></main></body></html>\n`;
}
