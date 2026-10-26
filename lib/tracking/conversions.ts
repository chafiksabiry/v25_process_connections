/**
 * Balises publicitaires (Google Ads, Meta, LinkedIn) et évènement de conversion.
 *
 * Chaque plateforme n'est chargée que si son identifiant est défini à la build
 * (variables Netlify) : sans identifiant, aucun script tiers n'est ajouté.
 *   VITE_GADS_ID                       ex. AW-XXXXXXXXX
 *   VITE_GADS_SIGNUP_LABEL             étiquette de conversion « inscription »
 *   VITE_META_PIXEL_ID                 identifiant du pixel Meta
 *   VITE_LINKEDIN_PARTNER_ID           identifiant partenaire de l'Insight Tag
 *   VITE_LINKEDIN_SIGNUP_CONVERSION_ID identifiant de conversion « inscription »
 *
 * Les micro-apps déclenchent la conversion par un évènement DOM :
 *   window.dispatchEvent(new CustomEvent('harx:conversion', { detail: { name: 'sign_up', userType } }))
 */
import { GA_MEASUREMENT_ID } from './constants';

type ConversionDetail = { name?: string; userType?: string };

type AdWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: (...a: unknown[]) => void };
  _fbq?: unknown;
  lintrk?: ((...args: unknown[]) => void) & { q?: unknown[] };
  _linkedin_data_partner_ids?: string[];
};

const env = import.meta.env as Record<string, string | undefined>;
const GADS_ID = env.VITE_GADS_ID;
const GADS_SIGNUP_LABEL = env.VITE_GADS_SIGNUP_LABEL;
const META_PIXEL_ID = env.VITE_META_PIXEL_ID;
const LINKEDIN_PARTNER_ID = env.VITE_LINKEDIN_PARTNER_ID;
const LINKEDIN_SIGNUP_CONVERSION_ID = env.VITE_LINKEDIN_SIGNUP_CONVERSION_ID;

const w = window as AdWindow;

function loadScript(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initGoogleAds(): void {
  if (!GADS_ID || typeof w.gtag !== 'function') return;
  w.gtag('config', GADS_ID, { send_page_view: false });
}

function initMetaPixel(): void {
  if (!META_PIXEL_ID || w.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else (fbq.queue as unknown[]).push(args);
  } as NonNullable<AdWindow['fbq']>;
  fbq.queue = [];
  fbq.loaded = true;
  w.fbq = fbq;
  w._fbq = fbq;
  loadScript('https://connect.facebook.net/en_US/fbevents.js');
  w.fbq('init', META_PIXEL_ID);
}

function initLinkedIn(): void {
  if (!LINKEDIN_PARTNER_ID || w.lintrk) return;
  w._linkedin_data_partner_ids = [...(w._linkedin_data_partner_ids ?? []), LINKEDIN_PARTNER_ID];
  const lintrk = function (...args: unknown[]) {
    (lintrk.q as unknown[]).push(args);
  } as NonNullable<AdWindow['lintrk']>;
  lintrk.q = [];
  w.lintrk = lintrk;
  loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
}

/** Page vue côté plateformes publicitaires (appelée avec le page_view GA4). */
export function trackAdPlatformsPageView(): void {
  if (META_PIXEL_ID && typeof w.fbq === 'function') w.fbq('track', 'PageView');
}

function onConversion(event: Event): void {
  const detail = ((event as CustomEvent<ConversionDetail>).detail ?? {}) as ConversionDetail;
  if (detail.name !== 'sign_up') return;
  const userType = detail.userType ?? 'unknown';

  if (typeof w.gtag === 'function') {
    w.gtag('event', 'sign_up', { method: 'email', user_type: userType, send_to: GA_MEASUREMENT_ID });
    if (GADS_ID && GADS_SIGNUP_LABEL) {
      w.gtag('event', 'conversion', { send_to: `${GADS_ID}/${GADS_SIGNUP_LABEL}` });
    }
  }
  if (META_PIXEL_ID && typeof w.fbq === 'function') {
    w.fbq('track', 'CompleteRegistration', { content_name: userType });
  }
  if (LINKEDIN_PARTNER_ID && LINKEDIN_SIGNUP_CONVERSION_ID && typeof w.lintrk === 'function') {
    w.lintrk('track', { conversion_id: Number(LINKEDIN_SIGNUP_CONVERSION_ID) });
  }
}

export function initConversionTracking(): void {
  initGoogleAds();
  initMetaPixel();
  initLinkedIn();
  window.addEventListener('harx:conversion', onConversion);
}
