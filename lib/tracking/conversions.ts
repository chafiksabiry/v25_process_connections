/**
 * Balises publicitaires (Google Ads, Meta, LinkedIn) et évènements de conversion.
 *
 * Chaque plateforme n'est chargée que si son identifiant est défini à la build
 * (variables Netlify) : sans identifiant, aucun script tiers n'est ajouté.
 *
 * Conversions distinctes par type de compte (rep, entreprise, call center) :
 *   VITE_GADS_SEND_TO_REP / _COMPANY / _CALLCENTER   valeur `send_to` complète, ex. AW-123456789/AbCdEf
 *   VITE_LINKEDIN_CONVERSION_ID_REP / _COMPANY / _CALLCENTER
 * Repli (une seule conversion pour tous les profils), si la variable du type est absente :
 *   VITE_GADS_ID + VITE_GADS_SIGNUP_LABEL, VITE_LINKEDIN_SIGNUP_CONVERSION_ID
 * Identifiants communs :
 *   VITE_GADS_ID (sinon déduit du premier send_to), VITE_META_PIXEL_ID, VITE_LINKEDIN_PARTNER_ID
 * Meta : évènement standard CompleteRegistration + évènement personnalisé par type
 *   (SignUpRep, SignUpCompany, SignUpCallCenter).
 *
 * Les micro-apps déclenchent la conversion par un évènement DOM :
 *   window.dispatchEvent(new CustomEvent('harx:conversion', { detail: { name: 'sign_up', userType } }))
 *   avec userType = 'rep' | 'company' | 'call-center'.
 */
import { GA_MEASUREMENT_ID } from './constants';
import { CONSENT_EVENT, readConsent, type ConsentChoice } from '../consent';

type ConversionDetail = { name?: string; userType?: string };

type AdWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: (...a: unknown[]) => void };
  _fbq?: unknown;
  lintrk?: ((...args: unknown[]) => void) & { q?: unknown[] };
  _linkedin_data_partner_ids?: string[];
};

const env = import.meta.env as Record<string, string | undefined>;

type UserKind = 'rep' | 'company' | 'callcenter';

const GADS_SEND_TO: Record<UserKind, string | undefined> = {
  rep: env.VITE_GADS_SEND_TO_REP,
  company: env.VITE_GADS_SEND_TO_COMPANY,
  callcenter: env.VITE_GADS_SEND_TO_CALLCENTER,
};
const GADS_FALLBACK_SEND_TO =
  env.VITE_GADS_ID && env.VITE_GADS_SIGNUP_LABEL ? `${env.VITE_GADS_ID}/${env.VITE_GADS_SIGNUP_LABEL}` : undefined;
const GADS_ID =
  env.VITE_GADS_ID || Object.values(GADS_SEND_TO).find((v) => v && v.includes('/'))?.split('/')[0];

const LINKEDIN_CONVERSION_IDS: Record<UserKind, string | undefined> = {
  rep: env.VITE_LINKEDIN_CONVERSION_ID_REP,
  company: env.VITE_LINKEDIN_CONVERSION_ID_COMPANY,
  callcenter: env.VITE_LINKEDIN_CONVERSION_ID_CALLCENTER,
};
const LINKEDIN_FALLBACK_CONVERSION_ID = env.VITE_LINKEDIN_SIGNUP_CONVERSION_ID;

const META_PIXEL_ID = env.VITE_META_PIXEL_ID;
const LINKEDIN_PARTNER_ID = env.VITE_LINKEDIN_PARTNER_ID;

const META_CUSTOM_EVENTS: Record<UserKind, string> = {
  rep: 'SignUpRep',
  company: 'SignUpCompany',
  callcenter: 'SignUpCallCenter',
};

function toUserKind(userType: string): UserKind | null {
  if (userType === 'rep') return 'rep';
  if (userType === 'company') return 'company';
  if (userType === 'call-center' || userType === 'callcenter') return 'callcenter';
  return null;
}

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
  const kind = toUserKind(userType);

  if (typeof w.gtag === 'function') {
    w.gtag('event', 'sign_up', { method: 'email', user_type: userType, send_to: GA_MEASUREMENT_ID });
    const sendTo = (kind && GADS_SEND_TO[kind]) || GADS_FALLBACK_SEND_TO;
    if (sendTo) w.gtag('event', 'conversion', { send_to: sendTo });
  }
  if (META_PIXEL_ID && typeof w.fbq === 'function') {
    w.fbq('track', 'CompleteRegistration', { content_name: userType });
    if (kind) w.fbq('trackCustom', META_CUSTOM_EVENTS[kind]);
  }
  if (LINKEDIN_PARTNER_ID && typeof w.lintrk === 'function') {
    const conversionId = (kind && LINKEDIN_CONVERSION_IDS[kind]) || LINKEDIN_FALLBACK_CONVERSION_ID;
    if (conversionId) w.lintrk('track', { conversion_id: Number(conversionId) });
  }
}

function initMarketingTags(): void {
  initMetaPixel();
  initLinkedIn();
}

export function initConversionTracking(): void {
  initGoogleAds();
  // Meta et LinkedIn déposent des cookies publicitaires : uniquement avec le consentement « publicité ».
  if (readConsent()?.marketing) initMarketingTags();
  window.addEventListener(CONSENT_EVENT, (event) => {
    if ((event as CustomEvent<ConsentChoice>).detail?.marketing) initMarketingTags();
  });
  window.addEventListener('harx:conversion', onConversion);
}
