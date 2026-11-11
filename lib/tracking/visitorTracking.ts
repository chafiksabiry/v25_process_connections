import { GA_MEASUREMENT_ID } from './constants';
import { trackAdPlatformsPageView } from './conversions';
import { buildTrackingPath, isNoindexPath, resolvePageMeta, type PageMeta } from './pageMeta';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Mouseflow records the full session automatically on SPAs (History API).
 * Manual newPageView() fragments replays into short clips — do not call it.
 */

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

function upsertAlternates(alternates: Array<{ hreflang: string; href: string }>) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const { hreflang, href } of alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  }
}

export function updatePageHead(meta: PageMeta): void {
  // Host + child MFEs both stamp titles — collapse duplicated "HARX - HARX …"
  let title = (meta.title || 'HARX').trim();
  title = title.replace(/^(HARX\s*[—\-–|:]\s*)+/i, 'HARX — ');
  if (/^HARX\s+HARX\b/i.test(title)) {
    title = title.replace(/^HARX\s+/i, '');
  }
  document.title = title;
  upsertMeta('description', meta.description);
  upsertMeta('og:title', title, 'property');
  upsertMeta('og:description', meta.description, 'property');
  upsertMeta('robots', meta.noindex ? 'noindex,nofollow' : 'index,follow');
  if (meta.canonical) {
    upsertMeta('og:url', meta.canonical, 'property');
    upsertCanonical(meta.canonical);
  }
  if (meta.lang) document.documentElement.lang = meta.lang;
  if (meta.alternates) upsertAlternates(meta.alternates);
  else if (meta.canonical) upsertAlternates([]);
}

/** Update document title + meta tags only (safe in qiankun child MFEs). */
export function syncPageHead(path?: string): void {
  const pagePath = path ?? buildTrackingPath();
  updatePageHead({ ...resolvePageMeta(pagePath), noindex: isNoindexPath(pagePath) });
}

/**
 * Le shell est la seule source des page_view GA4 (les micro-apps ne les émettent plus
 * quand elles tournent sous qiankun). Léger délai pour lire le titre posé par la micro-app.
 */
const PAGE_VIEW_DELAY_MS = 400;
let pageViewTimer: ReturnType<typeof setTimeout> | undefined;

export function trackPageView(path?: string): void {
  const pagePath = path ?? buildTrackingPath();

  if (pageViewTimer) clearTimeout(pageViewTimer);
  pageViewTimer = setTimeout(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: document.title,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  }, PAGE_VIEW_DELAY_MS);
}

export function syncVisitorTracking(path?: string): void {
  syncPageHead(path);
  trackPageView(path);
  trackAdPlatformsPageView();
}
