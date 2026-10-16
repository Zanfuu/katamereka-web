/**
 * Human-readable HTML view of the sitemap, served to browsers instead of
 * raw XML (see lib/sitemap-handlers.ts). Replaces the old XSLT stylesheet.
 * Plain string templates on purpose: no React/client JS for a static table.
 */

import { escapeXml as esc, SITEMAP_VARY, type SitemapUrl } from "@/lib/sitemap";

export interface SitemapIndexRow {
  loc: string;
  urlCount: number;
  lastmod?: string;
}

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #1f2937; background: #fff; }
  .hero { background: #0f1b33; color: #fff; padding: 36px 0 28px; }
  .wrap { max-width: 1280px; margin: 0 auto; padding: 0 36px; }
  .hero h1 { margin: 0 0 14px; font-size: 26px; font-weight: 700; }
  .hero p { margin: 0 0 8px; line-height: 1.5; color: #cbd5e1; }
  .hero p.meta { color: #fff; }
  .hero a { color: #60a5fa; text-decoration: none; }
  .hero a:hover { text-decoration: underline; }
  .crumbs { padding: 22px 0 0; color: #6b7280; }
  .crumbs a { color: #2563eb; text-decoration: none; }
  .crumbs a:hover { text-decoration: underline; }
  .crumbs strong { color: #111827; }
  .table-wrap { overflow-x: auto; padding: 8px 0 60px; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th { text-align: left; padding: 12px 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #d1d5db; white-space: nowrap; }
  td { padding: 13px 14px; border-bottom: 1px solid #eef0f3; vertical-align: top; }
  tbody tr:nth-child(odd) { background: #f9fafb; }
  td a { color: #2563eb; text-decoration: underline; word-break: break-all; }
  td.num, td.date { white-space: nowrap; }
  .muted { color: #9ca3af; }
  @media (max-width: 640px) { .wrap { padding: 0 16px; } .hero h1 { font-size: 22px; } }
`;

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

function formatGenerated(date: Date): string {
  return `${DATE_FORMAT.format(date)} pukul ${TIME_FORMAT.format(date)} WIB`;
}

/** "2026-10-16T08:00:00.000Z" -> "2026-10-16"; anything unparseable -> em dash. */
function formatLastmod(value?: string): string {
  const day = value?.slice(0, 10);
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? esc(day) : '<span class="muted">—</span>';
}

function layout(opts: {
  title: string;
  heading: string;
  intro: string[];
  meta: string;
  crumbs: string;
  table: string;
}): string {
  const intro = opts.intro.map((line) => `<p>${line}</p>`).join("\n    ");
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <title>${esc(opts.title)}</title>
  <style>${STYLES}</style>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <h1>${esc(opts.heading)}</h1>
      ${intro}
      <p class="meta">${opts.meta}</p>
    </div>
  </header>
  <main class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${opts.crumbs}</nav>
    <div class="table-wrap">${opts.table}</div>
  </main>
</body>
</html>`;
}

const INTRO = [
  "Dibuat secara otomatis, ini adalah Sitemap XML yang dimaksudkan untuk dikonsumsi oleh mesin pencari seperti Google atau Bing.",
  'Anda dapat menemukan informasi lebih lanjut tentang sitemap XML di <a href="https://www.sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.',
];

export function renderSitemapIndexHtml(
  rows: SitemapIndexRow[],
  { siteName, generatedAt }: { siteName: string; generatedAt: Date },
): string {
  const body = rows
    .map(
      (r) => `<tr>
        <td><a href="${esc(r.loc)}">${esc(r.loc)}</a></td>
        <td class="num">${r.urlCount}</td>
        <td class="date">${formatLastmod(r.lastmod)}</td>
      </tr>`,
    )
    .join("\n      ");

  return layout({
    title: `Sitemap — ${siteName}`,
    heading: "Sitemap Index",
    intro: INTRO,
    meta: `Sitemap Index berisi ${rows.length} Sitemap utama dan dibuat pada ${formatGenerated(generatedAt)}`,
    crumbs: `<a href="/">Beranda</a> &raquo; <strong>Sitemap Index</strong>`,
    table: `<table>
    <thead><tr><th style="width:60%">URL</th><th>URL Count</th><th>Terakhir Diperbarui</th></tr></thead>
    <tbody>
      ${body}
    </tbody>
  </table>`,
  });
}

export function renderUrlsetHtml(
  urls: SitemapUrl[],
  { siteName, label, generatedAt }: { siteName: string; label: string; generatedAt: Date },
): string {
  const body = urls
    .map(
      (u) => `<tr>
        <td><a href="${esc(u.loc)}">${esc(u.loc)}</a></td>
        <td class="date">${formatLastmod(u.lastmod)}</td>
        <td>${u.changefreq ? esc(u.changefreq) : '<span class="muted">—</span>'}</td>
        <td class="num">${u.priority ? esc(u.priority) : '<span class="muted">—</span>'}</td>
      </tr>`,
    )
    .join("\n      ");

  return layout({
    title: `Sitemap ${label} — ${siteName}`,
    heading: `Sitemap ${label}`,
    intro: INTRO,
    meta: `Sitemap ini berisi ${urls.length} URL dan dibuat pada ${formatGenerated(generatedAt)}`,
    crumbs: `<a href="/">Beranda</a> &raquo; <a href="/sitemap.xml">Sitemap Index</a> &raquo; <strong>${esc(label)}</strong>`,
    table: `<table>
    <thead><tr><th style="width:55%">URL</th><th>Terakhir Diperbarui</th><th>Change Freq</th><th>Priority</th></tr></thead>
    <tbody>
      ${body}
    </tbody>
  </table>`,
  });
}

export function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Never stored by shared caches: a cache that ignores Vary could
      // otherwise hand this HTML to a crawler that asked for the XML.
      "Cache-Control": "private, no-cache",
      Vary: SITEMAP_VARY,
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
