/**
 * harx.ai/app : lien court de l'application mobile HARX Nomad (QR code du portail, SMS « lien de l'app », FAQ).
 *
 * - iPhone / iPad → App Store (redirection 302, dès que le lien est configuré) ;
 * - téléphone Android → page HARX avec deux choix : Google Play, et le téléchargement direct de l'APK (avec la mention « autorisez
 *   l'installation d'apps hors Play Store ») ; un choix sans lien est masqué ;
 * - ordinateur → page avec le QR code de harx.ai/app et les trois choix configurés ;
 * - aucun lien pour l'appareil → page « pas encore disponible pour votre téléphone » (jamais de lien cassé, jamais « bientôt »).
 *
 * Liens lus dans les variables d'environnement Netlify NOMAD_APP_STORE_URL, NOMAD_PLAY_STORE_URL et NOMAD_APK_URL (fonction de bord
 * netlify/edge-functions/nomad-app.ts) : vide = non configuré. NOMAD_APP_STORE_EXCLUDED_COUNTRIES (ISO-2, virgules) : pays où l'app iOS
 * n'est pas encore sur l'App Store (UE) ; pour un visiteur de ces pays (pays donné par Netlify), ou de pays inconnu alors qu'une exclusion
 * existe, la fiche App Store n'est ni ouverte ni montrée. Module pur (testé par vitest), sans dépendance à Deno.
 */
import { APP_QR_SVG, NOMAD_LOGO_SVG } from './nomadAppArt.ts';

export type Platform = 'ios' | 'android' | 'desktop';
export type Lang = 'fr' | 'en' | 'es' | 'ar';
export interface StoreLinks { ios: string | null; android: string | null; apk: string | null }

/** Adresse https valide, sinon null. */
export function httpsUrl(v: string | undefined | null): string | null {
  const s = (v ?? '').trim();
  if (!/^https:\/\//i.test(s)) return null;
  try { new URL(s); return s; } catch { return null; }
}

export function storeLinks(env: { NOMAD_APP_STORE_URL?: string | null; NOMAD_PLAY_STORE_URL?: string | null; NOMAD_APK_URL?: string | null }): StoreLinks {
  return { ios: httpsUrl(env.NOMAD_APP_STORE_URL), android: httpsUrl(env.NOMAD_PLAY_STORE_URL), apk: httpsUrl(env.NOMAD_APK_URL) };
}

/** Pays exclus de l'App Store (liste ISO-2 séparée par des virgules) ; vide = aucune exclusion. */
export function excludedCountries(v: string | undefined | null): string[] {
  return (v ?? '').split(',').map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c));
}

/** Liens pour ce visiteur : la fiche App Store est retirée dans un pays exclu (ou pays inconnu alors qu'une exclusion existe). */
export function linksForCountry(links: StoreLinks, excluded: string[], country: string | undefined | null): StoreLinks {
  if (!links.ios || excluded.length === 0) return links;
  const c = (country ?? '').toUpperCase();
  return /^[A-Z]{2}$/.test(c) && !excluded.includes(c) ? links : { ...links, ios: null };
}

export function detectPlatform(userAgent: string | null | undefined): Platform {
  const ua = userAgent ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** Langue de la page : celle du navigateur parmi fr / en / es / ar (français par défaut). */
export function pickLang(acceptLanguage: string | null | undefined): Lang {
  for (const part of (acceptLanguage ?? '').split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (code === 'fr' || code === 'en' || code === 'es' || code === 'ar') return code;
  }
  return 'fr';
}

export type Decision = { kind: 'redirect'; location: string } | { kind: 'page'; platform: Platform };

/** iPhone : redirection vers l'App Store. Android : toujours la page (Google Play OU téléchargement direct). Ordinateur : la page. */
export function decide(platform: Platform, links: StoreLinks): Decision {
  if (platform === 'ios' && links.ios) return { kind: 'redirect', location: links.ios };
  return { kind: 'page', platform };
}

const T: Record<Lang, { title: string; ready: string; phone: string; none: string; noneAll: string; ios: [string, string]; android: [string, string]; account: string; more: string; choose: string; apk: string; apkNote: string; scan: string }> = {
  fr: { choose: 'Choisissez comment installer l’app HARX Nomad sur votre téléphone Android.', apk: 'Télécharger directement (APK)', apkNote: 'Autorisez l’installation d’apps hors Play Store sur votre téléphone.', scan: 'Scannez avec l’appareil photo de votre téléphone', title: 'L’app mobile HARX Nomad', ready: 'Téléchargez l’app HARX Nomad sur votre téléphone.', phone: 'Sur votre téléphone, ouvrez harx.ai/app : le bon store s’ouvre directement.', none: 'L’app HARX Nomad n’est pas encore disponible pour votre téléphone.', noneAll: 'L’app HARX Nomad n’est pas encore disponible.', ios: ['Télécharger dans l’', 'App Store'], android: ['DISPONIBLE SUR', 'Google Play'], account: 'Connectez-vous avec l’e-mail et le mot de passe de votre compte HARX : votre numéro s’affiche dans l’app.', more: 'Découvrir HARX Nomad' },
  en: { choose: 'Choose how to install the HARX Nomad app on your Android phone.', apk: 'Download directly (APK)', apkNote: 'Allow installing apps from outside the Play Store on your phone.', scan: 'Scan with your phone camera', title: 'The HARX Nomad mobile app', ready: 'Download the HARX Nomad app on your phone.', phone: 'On your phone, open harx.ai/app: the right store opens directly.', none: 'The HARX Nomad app is not yet available for your phone.', noneAll: 'The HARX Nomad app is not yet available.', ios: ['Download on the', 'App Store'], android: ['GET IT ON', 'Google Play'], account: 'Sign in with the email and password of your HARX account: your number appears in the app.', more: 'Discover HARX Nomad' },
  es: { choose: 'Elija cómo instalar la app HARX Nomad en su teléfono Android.', apk: 'Descargar directamente (APK)', apkNote: 'Permita la instalación de apps fuera de Play Store en su teléfono.', scan: 'Escanee con la cámara de su teléfono', title: 'La app móvil HARX Nomad', ready: 'Descargue la app HARX Nomad en su teléfono.', phone: 'En su teléfono, abra harx.ai/app: se abre directamente la tienda adecuada.', none: 'La app HARX Nomad aún no está disponible para su teléfono.', noneAll: 'La app HARX Nomad aún no está disponible.', ios: ['Descárgalo en el', 'App Store'], android: ['DISPONIBLE EN', 'Google Play'], account: 'Inicie sesión con el correo y la contraseña de su cuenta HARX: su número aparece en la app.', more: 'Descubrir HARX Nomad' },
  ar: { choose: 'اختر طريقة تثبيت تطبيق HARX Nomad على هاتف أندرويد.', apk: 'التنزيل المباشر (APK)', apkNote: 'اسمح بتثبيت التطبيقات من خارج Play Store على هاتفك.', scan: 'امسحه بكاميرا هاتفك', title: 'تطبيق HARX Nomad للهاتف', ready: 'نزّل تطبيق HARX Nomad على هاتفك.', phone: 'على هاتفك، افتح harx.ai/app: يفتح المتجر المناسب مباشرة.', none: 'تطبيق HARX Nomad غير متاح بعد لهاتفك.', noneAll: 'تطبيق HARX Nomad غير متاح بعد.', ios: ['حمّله من', 'App Store'], android: ['احصل عليه من', 'Google Play'], account: 'سجّل الدخول بالبريد الإلكتروني وكلمة المرور لحسابك في HARX: يظهر رقمك في التطبيق.', more: 'اكتشف HARX Nomad' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** NOMAD toujours en logo (règle du fondateur du 22/11), même dans « HARX Nomad » : le mot est remplacé par le logo, lu « Nomad » par les lecteurs d'écran. */
const NOMAD_INLINE = `<span class="nl" dir="ltr"><span class="sr">Nomad</span>${NOMAD_LOGO_SVG.replace('class="nomad"', 'class="nomadi"')}</span>`;
export const withLogo = (s: string): string => esc(s).replace(/Nomad/g, NOMAD_INLINE);

const APPLE = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16.37 12.73c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.15-.95-3.53-.93-1.81.03-3.49 1.06-4.42 2.68-1.89 3.27-.48 8.1 1.36 10.75.9 1.3 1.97 2.76 3.37 2.7 1.35-.05 1.86-.87 3.5-.87 1.62 0 2.08.87 3.5.84 1.45-.03 2.37-1.32 3.25-2.62 1.03-1.5 1.45-2.96 1.47-3.04-.03-.01-2.8-1.08-2.82-4.32zM13.7 4.8c.74-.9 1.25-2.15 1.11-3.4-1.07.05-2.37.72-3.14 1.61-.69.79-1.29 2.07-1.13 3.29 1.2.09 2.42-.6 3.16-1.5z"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3.6 1.8 13.5 12l-9.9 10.2c-.36-.2-.6-.6-.6-1.1V2.9c0-.5.24-.9.6-1.1z" fill="#4285F4"/><path d="M3.6 1.8 16.9 9.4 13.5 12z" fill="#34A853"/><path d="M3.6 22.2 13.5 12l3.4 2.6z" fill="#EA4335"/><path d="m16.9 9.4 3.7 2.1c.6.4.6 1.1 0 1.5l-3.7 1.6-3.4-2.6z" fill="#FBBC04"/></svg>';

const DOWNLOAD = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>';

/**
 * Page affichée quand il n'y a pas de redirection :
 * - Android : Google Play (badge officiel) et « Télécharger directement (APK) » avec sa mention ; un choix sans lien est masqué ; aucun des
 *   deux → « pas encore disponible pour votre téléphone » ;
 * - iPhone sans App Store (non renseigné, ou pays exclu) : « pas encore disponible pour votre téléphone », sans les choix Android ;
 * - ordinateur : QR code de harx.ai/app et les choix configurés (App Store, Google Play, APK), sinon « pas encore disponible ». Un iPad en
 *   iPadOS se présente comme un Mac : un petit script (navigator.maxTouchPoints) le renvoie vers l'App Store, ou affiche « pas encore
 *   disponible ». Jamais de « bientôt ».
 */
export function renderPage(lang: Lang, platform: Platform, links: StoreLinks): string {
  const t = T[lang];
  const badge = (store: 'ios' | 'android', href: string) => {
    const [small, big] = t[store];
    return `<a class="badge" data-store="${store}" href="${esc(href)}" rel="noopener">${store === 'ios' ? APPLE : PLAY}<span><small>${esc(small)}</small><b>${esc(big)}</b></span></a>`;
  };
  const apkChoice = (href: string) => `<a class="apk" data-store="apk" href="${esc(href)}" rel="noopener">${DOWNLOAD}<span>${esc(t.apk)}</span></a><p class="apknote">${esc(t.apkNote)}</p>`;
  const any = Boolean(links.ios || links.android || links.apk);
  const androidAny = Boolean(links.android || links.apk);
  let body: string;
  let shown: string[] = [];
  if (platform === 'ios') {
    body = `<h1>${withLogo(t.title)}</h1>\n<p class="lead">${withLogo(t.none)}</p>`;
  } else if (platform === 'android') {
    shown = [links.android ? 'android' : '', links.apk ? 'apk' : ''].filter(Boolean);
    body = androidAny
      ? [`<h1>${withLogo(t.title)}</h1>`, `<p class="lead">${withLogo(t.choose)}</p>`, `<div class="choices">`, links.android ? badge('android', links.android) : '', links.apk ? apkChoice(links.apk) : '', `</div>`].join('\n')
      : `<h1>${withLogo(t.title)}</h1>\n<p class="lead">${withLogo(t.none)}</p>`;
  } else {
    shown = (['ios', 'android', 'apk'] as const).filter((s) => links[s]);
    body = [
      `<h1>${withLogo(t.title)}</h1>`,
      `<div data-desktop>`,
      `<p class="lead">${withLogo(any ? t.ready : t.noneAll)}</p>`,
      any ? `<div class="desk"><figure class="qr" data-qr="https://harx.ai/app">${APP_QR_SVG}<figcaption>${esc(t.scan)}</figcaption></figure><div class="choices">${links.ios ? badge('ios', links.ios) : ''}${links.android ? badge('android', links.android) : ''}${links.apk ? apkChoice(links.apk) : ''}</div></div>` : '',
      any ? `<p class="note">${esc(t.phone)}</p>` : '',
      `</div>`,
      `<div data-ipad hidden><p class="lead">${withLogo(links.ios ? t.ready : t.none)}</p></div>`,
    ].join('\n');
  }
  body += `\n<p class="account">${esc(t.account)}</p>\n<a class="more" href="/nomad">${withLogo(t.more)}</a>`;
  // iPadOS (UA de bureau) : détecté côté page par les points de contact tactiles.
  const ipadScript = platform === 'desktop'
    ? `<script>(function(){if(!/Macintosh/.test(navigator.userAgent)||!(navigator.maxTouchPoints>1))return;var m=document.querySelector('main'),u=m&&m.getAttribute('data-ios');if(u){location.replace(u);return;}document.querySelectorAll('[data-desktop]').forEach(function(e){e.hidden=true;});var i=document.querySelector('[data-ipad]');if(i)i.hidden=false;})();</script>`
    : '';
  return `<!doctype html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(t.title)} | HARX</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:#050914;background-image:radial-gradient(60% 50% at 20% 10%,rgba(230,24,141,.22),transparent 70%),radial-gradient(50% 40% at 90% 90%,rgba(247,148,30,.16),transparent 70%);color:#F8FAFC;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{width:100%;max-width:440px;text-align:center;border:1px solid rgba(130,148,255,.16);border-radius:24px;background:rgba(11,17,38,.6);padding:32px 24px}
main[data-platform="desktop"]{max-width:560px}
.brand{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px}
.brand small{font-weight:900;letter-spacing:.35em;font-size:12px;background:linear-gradient(90deg,#F7941E,#E6188D 55%,#ED1C24);-webkit-background-clip:text;background-clip:text;color:transparent}
.nomad{display:block;height:26px;width:auto;color:#fff;overflow:visible}
h1{font-size:26px;line-height:1.2;margin:0 0 8px;font-weight:900}
.lead{color:#D6DDF5;margin:0 0 20px}
.choices{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px}
.badge{display:inline-flex;align-items:center;gap:10px;min-width:220px;height:56px;padding:0 14px;border:1px solid #A6A6A6;border-radius:12px;background:#000;color:#fff;text-decoration:none;text-align:start}
.badge span{display:flex;flex-direction:column;line-height:1}
.badge small{font-size:10px;letter-spacing:.03em}
.badge b{font-size:19px;font-weight:600;margin-top:2px}
.apk{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-width:220px;height:56px;padding:0 16px;border:1px solid rgba(130,148,255,.35);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;font-weight:800;font-size:14px;text-decoration:none;white-space:nowrap}
.choices .badge,.choices .apk{width:280px;max-width:100%}
.apknote{color:#98A3CF;font-size:13px;margin:-4px 0 0;max-width:280px}
.desk{display:flex;gap:24px;align-items:center;justify-content:center;margin-bottom:12px;text-align:start}
.desk .choices{align-items:stretch;margin:0}
.desk .apknote{max-width:280px}
.qr{margin:0;display:flex;flex-direction:column;align-items:center;gap:8px}
.qrsvg{width:148px;height:148px;background:#fff;border-radius:16px;padding:8px}
.qr figcaption{color:#98A3CF;font-size:12px;font-weight:700;max-width:160px;text-align:center}
.note{color:#98A3CF;font-size:13px;margin:6px 0}
.account{color:#D6DDF5;font-size:14px;margin:20px 0 0}
.nl{display:inline-flex;align-items:baseline}
.nomadi{display:inline-block;height:.6em;width:auto;overflow:visible;margin-inline-start:.08em}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.more{display:inline-block;margin-top:24px;padding:12px 22px;border-radius:999px;background:linear-gradient(90deg,#F7941E,#E6188D 55%,#ED1C24);color:#fff;font-weight:800;text-decoration:none}
@media (max-width:520px){.desk{flex-direction:column}}
</style>
</head>
<body>
<main data-platform="${platform}" data-stores="${shown.join(',') || 'none'}" data-ios="${links.ios ? esc(links.ios) : ''}">
<div class="brand"><small aria-hidden="true">HARX</small><span role="img" aria-label="HARX Nomad">${NOMAD_LOGO_SVG}</span></div>
${body}
</main>
${ipadScript}
</body>
</html>`;
}
