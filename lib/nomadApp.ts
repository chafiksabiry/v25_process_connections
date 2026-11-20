/**
 * harx.ai/app : lien court de l'application mobile HARX Nomad (QR code du portail, FAQ). Seuls l'App Store et Google Play sont proposés.
 *
 * - iPhone / iPad → App Store ; téléphone Android → Google Play (redirection 302, dès que le lien du store est configuré) ;
 * - ordinateur → page avec les boutons des stores configurés ;
 * - store non configuré → page « bientôt disponible » (jamais de lien cassé).
 *
 * Liens lus dans les variables d'environnement Netlify NOMAD_APP_STORE_URL et NOMAD_PLAY_STORE_URL (fonction de bord
 * netlify/edge-functions/nomad-app.ts) : vide = store non configuré. Module pur (testé par vitest), sans dépendance à Deno.
 */

export type Platform = 'ios' | 'android' | 'desktop';
export type Lang = 'fr' | 'en' | 'es' | 'ar';
export interface StoreLinks { ios: string | null; android: string | null }

/** Adresse https valide, sinon null. */
export function httpsUrl(v: string | undefined | null): string | null {
  const s = (v ?? '').trim();
  if (!/^https:\/\//i.test(s)) return null;
  try { new URL(s); return s; } catch { return null; }
}

export function storeLinks(env: { NOMAD_APP_STORE_URL?: string | null; NOMAD_PLAY_STORE_URL?: string | null }): StoreLinks {
  return { ios: httpsUrl(env.NOMAD_APP_STORE_URL), android: httpsUrl(env.NOMAD_PLAY_STORE_URL) };
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

export function decide(platform: Platform, links: StoreLinks): Decision {
  if (platform === 'ios' && links.ios) return { kind: 'redirect', location: links.ios };
  if (platform === 'android' && links.android) return { kind: 'redirect', location: links.android };
  return { kind: 'page', platform };
}

const T: Record<Lang, { title: string; ready: string; phone: string; soon: string; soonIos: string; soonAndroid: string; ios: [string, string]; android: [string, string]; account: string; more: string }> = {
  fr: { title: 'L’app mobile HARX Nomad', ready: 'Téléchargez l’app HARX Nomad sur votre téléphone.', phone: 'Sur votre téléphone, ouvrez harx.ai/app : le bon store s’ouvre directement.', soon: 'L’application arrive bientôt sur l’App Store et Google Play.', soonIos: 'Bientôt sur l’App Store.', soonAndroid: 'Bientôt sur Google Play.', ios: ['Télécharger dans l’', 'App Store'], android: ['DISPONIBLE SUR', 'Google Play'], account: 'Connectez-vous avec l’e-mail et le mot de passe de votre compte HARX : votre numéro s’affiche dans l’app.', more: 'Découvrir HARX Nomad' },
  en: { title: 'The HARX Nomad mobile app', ready: 'Download the HARX Nomad app on your phone.', phone: 'On your phone, open harx.ai/app: the right store opens directly.', soon: 'The app is coming soon to the App Store and Google Play.', soonIos: 'Coming soon to the App Store.', soonAndroid: 'Coming soon to Google Play.', ios: ['Download on the', 'App Store'], android: ['GET IT ON', 'Google Play'], account: 'Sign in with the email and password of your HARX account: your number appears in the app.', more: 'Discover HARX Nomad' },
  es: { title: 'La app móvil HARX Nomad', ready: 'Descargue la app HARX Nomad en su teléfono.', phone: 'En su teléfono, abra harx.ai/app: se abre directamente la tienda adecuada.', soon: 'La aplicación llegará pronto a App Store y Google Play.', soonIos: 'Próximamente en App Store.', soonAndroid: 'Próximamente en Google Play.', ios: ['Descárgalo en el', 'App Store'], android: ['DISPONIBLE EN', 'Google Play'], account: 'Inicie sesión con el correo y la contraseña de su cuenta HARX: su número aparece en la app.', more: 'Descubrir HARX Nomad' },
  ar: { title: 'تطبيق HARX Nomad للهاتف', ready: 'نزّل تطبيق HARX Nomad على هاتفك.', phone: 'على هاتفك، افتح harx.ai/app: يفتح المتجر المناسب مباشرة.', soon: 'التطبيق متاح قريبًا على App Store وGoogle Play.', soonIos: 'قريبًا على App Store.', soonAndroid: 'قريبًا على Google Play.', ios: ['حمّله من', 'App Store'], android: ['احصل عليه من', 'Google Play'], account: 'سجّل الدخول بالبريد الإلكتروني وكلمة المرور لحسابك في HARX: يظهر رقمك في التطبيق.', more: 'اكتشف HARX Nomad' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const APPLE = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16.37 12.73c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.15-.95-3.53-.93-1.81.03-3.49 1.06-4.42 2.68-1.89 3.27-.48 8.1 1.36 10.75.9 1.3 1.97 2.76 3.37 2.7 1.35-.05 1.86-.87 3.5-.87 1.62 0 2.08.87 3.5.84 1.45-.03 2.37-1.32 3.25-2.62 1.03-1.5 1.45-2.96 1.47-3.04-.03-.01-2.8-1.08-2.82-4.32zM13.7 4.8c.74-.9 1.25-2.15 1.11-3.4-1.07.05-2.37.72-3.14 1.61-.69.79-1.29 2.07-1.13 3.29 1.2.09 2.42-.6 3.16-1.5z"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3.6 1.8 13.5 12l-9.9 10.2c-.36-.2-.6-.6-.6-1.1V2.9c0-.5.24-.9.6-1.1z" fill="#4285F4"/><path d="M3.6 1.8 16.9 9.4 13.5 12z" fill="#34A853"/><path d="M3.6 22.2 13.5 12l3.4 2.6z" fill="#EA4335"/><path d="m16.9 9.4 3.7 2.1c.6.4.6 1.1 0 1.5l-3.7 1.6-3.4-2.6z" fill="#FBBC04"/></svg>';

/** Page (ordinateur, ou store de l'appareil non configuré) : boutons des stores configurés, sinon « bientôt disponible ». */
export function renderPage(lang: Lang, platform: Platform, links: StoreLinks): string {
  const t = T[lang];
  const badge = (store: 'ios' | 'android', href: string) => {
    const [small, big] = t[store];
    return `<a class="badge" data-store="${store}" href="${esc(href)}" rel="noopener">${store === 'ios' ? APPLE : PLAY}<span><small>${esc(small)}</small><b>${esc(big)}</b></span></a>`;
  };
  const order: Array<'ios' | 'android'> = platform === 'android' ? ['android', 'ios'] : ['ios', 'android'];
  const badges = order.filter((s) => links[s]).map((s) => badge(s, links[s]!)).join('');
  const any = Boolean(links.ios || links.android);
  const notes: string[] = [];
  if (!any) notes.push(t.soon);
  else {
    if (!links.ios) notes.push(t.soonIos);
    if (!links.android) notes.push(t.soonAndroid);
  }
  const lead = any ? t.ready : t.soon;
  const body = [
    `<h1>${esc(t.title)}</h1>`,
    `<p class="lead">${esc(lead)}</p>`,
    badges ? `<div class="badges">${badges}</div>` : '',
    any ? notes.map((n) => `<p class="note">${esc(n)}</p>`).join('') : '',
    any && platform === 'desktop' ? `<p class="note">${esc(t.phone)}</p>` : '',
    `<p class="account">${esc(t.account)}</p>`,
    `<a class="more" href="/telephony/nomad">${esc(t.more)}</a>`,
  ].join('\n');
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
.logo{display:inline-block;font-weight:900;letter-spacing:.35em;font-size:22px;background:linear-gradient(90deg,#F7941E,#E6188D 55%,#ED1C24);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:12px}
h1{font-size:26px;line-height:1.2;margin:0 0 8px;font-weight:900}
.lead{color:#D6DDF5;margin:0 0 20px}
.badges{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:16px}
.badge{display:inline-flex;align-items:center;gap:10px;min-width:176px;height:56px;padding:0 14px;border:1px solid #A6A6A6;border-radius:12px;background:#000;color:#fff;text-decoration:none;text-align:start}
.badge span{display:flex;flex-direction:column;line-height:1}
.badge small{font-size:10px;letter-spacing:.03em}
.badge b{font-size:19px;font-weight:600;margin-top:2px}
.note{color:#98A3CF;font-size:13px;margin:6px 0}
.account{color:#D6DDF5;font-size:14px;margin:20px 0 0}
.more{display:inline-block;margin-top:24px;padding:12px 22px;border-radius:999px;background:linear-gradient(90deg,#F7941E,#E6188D 55%,#ED1C24);color:#fff;font-weight:800;text-decoration:none}
</style>
</head>
<body>
<main data-platform="${platform}" data-stores="${order.filter((s) => links[s]).join(',') || 'none'}">
<div class="logo" aria-hidden="true">HARX</div>
${body}
</main>
</body>
</html>`;
}
