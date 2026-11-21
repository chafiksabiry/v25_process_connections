/**
 * Langue et textes de la bannière de consentement aux cookies (fr, en, es, ar).
 *
 * Langue retenue, dans l'ordre :
 *   1. le préfixe de l'URL (/fr, /en, /es, /ar), comme le reste du site ;
 *   2. sans préfixe, le choix explicite mémorisé par le site (sélecteur de langue) : `harxSiteLang`, sinon `i18nextLng`,
 *      seulement si `harxLangExplicit` vaut « 1 » (mêmes clés que le site d'accueil et HARX Téléphonie) ;
 *   3. sinon la langue par défaut du site, partout (décision du fondateur, voir `lib/defaultLang.ts`) : première langue du navigateur parmi
 *      en, fr, es, ar, sinon anglais.
 */
import { getLangFromPath, SITE_LANGS, type SiteLang } from './langRoutes';
import { resolveDefaultLang } from './defaultLang';

export type CookieBannerTexts = {
  title: string;
  body: string;
  refuse: string;
  accept: string;
  customize: string;
  save: string;
  analytics: string;
  marketing: string;
  more: string;
};

export const COOKIE_BANNER_TEXTS: Record<SiteLang, CookieBannerTexts> = {
  fr: {
    title: 'Vos préférences de cookies',
    body:
      "Nous utilisons des cookies pour mesurer l'audience du site et, avec votre accord, l'efficacité de nos publicités. Les cookies strictement nécessaires (connexion, sécurité) sont toujours actifs.",
    refuse: 'Tout refuser',
    accept: 'Tout accepter',
    customize: 'Personnaliser',
    save: 'Enregistrer mes choix',
    analytics: "Mesure d'audience (Google Analytics, enregistrement de sessions Mouseflow)",
    marketing: 'Publicité (Google Ads, Meta, LinkedIn)',
    more: 'En savoir plus',
  },
  en: {
    title: 'Your cookie preferences',
    body:
      'We use cookies to measure site traffic and, with your consent, the effectiveness of our advertising. Strictly necessary cookies (login, security) are always active.',
    refuse: 'Reject all',
    accept: 'Accept all',
    customize: 'Customise',
    save: 'Save my choices',
    analytics: 'Audience measurement (Google Analytics, Mouseflow session recording)',
    marketing: 'Advertising (Google Ads, Meta, LinkedIn)',
    more: 'Learn more',
  },
  es: {
    title: 'Sus preferencias de cookies',
    body:
      'Utilizamos cookies para medir la audiencia del sitio y, con su consentimiento, la eficacia de nuestra publicidad. Las cookies estrictamente necesarias (inicio de sesión, seguridad) están siempre activas.',
    refuse: 'Rechazar todo',
    accept: 'Aceptar todo',
    customize: 'Personalizar',
    save: 'Guardar mis preferencias',
    analytics: 'Medición de audiencia (Google Analytics, grabación de sesiones de Mouseflow)',
    marketing: 'Publicidad (Google Ads, Meta, LinkedIn)',
    more: 'Más información',
  },
  ar: {
    title: 'تفضيلاتك بشأن ملفات تعريف الارتباط',
    body:
      'نستخدم ملفات تعريف الارتباط لقياس جمهور الموقع، وبموافقتك، لقياس فعالية إعلاناتنا. ملفات تعريف الارتباط الضرورية للغاية (تسجيل الدخول، الأمان) مفعّلة دائمًا.',
    refuse: 'رفض الكل',
    accept: 'قبول الكل',
    customize: 'تخصيص',
    save: 'حفظ اختياراتي',
    analytics: 'قياس الجمهور (Google Analytics، تسجيل الجلسات عبر Mouseflow)',
    marketing: 'الإعلانات (Google Ads، Meta، LinkedIn)',
    more: 'اعرف المزيد',
  },
};

/** L'arabe s'écrit de droite à gauche. */
export function cookieBannerDir(lang: SiteLang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Lien « En savoir plus » : la politique cookies existe en /fr, /en, /es et /ar. */
export function cookiePolicyHref(lang: SiteLang): string {
  return `/${lang}/cookies`;
}

export type StoredLangHints = {
  explicit: boolean;
  siteLang: string | null;
  sharedLang: string | null;
};

function toSiteLang(raw: string | null | undefined): SiteLang | null {
  const code = (raw || '').toLowerCase().slice(0, 2);
  return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : null;
}

/** Règle pure (testable) : voir l'ordre de priorité en tête de fichier. */
export function resolveCookieBannerLang(input: { pathname: string; stored: StoredLangHints; browser: readonly string[] }): SiteLang {
  const urlLang = getLangFromPath(input.pathname);
  if (urlLang) return urlLang;
  const { stored } = input;
  const explicit = stored.explicit ? toSiteLang(stored.siteLang) ?? toSiteLang(stored.sharedLang) : null;
  if (explicit) return explicit;
  return resolveDefaultLang({ browser: input.browser });
}

function readStoredHints(): StoredLangHints {
  try {
    return {
      explicit: localStorage.getItem('harxLangExplicit') === '1',
      siteLang: localStorage.getItem('harxSiteLang'),
      sharedLang: localStorage.getItem('i18nextLng'),
    };
  } catch {
    return { explicit: false, siteLang: null, sharedLang: null };
  }
}

function readBrowserLangs(): string[] {
  if (typeof navigator === 'undefined') return [];
  // `navigator.languages`, puis `navigator.language`.
  return [...(navigator.languages ?? []), ...(navigator.language ? [navigator.language] : [])];
}

/** Langue de la bannière pour l'adresse courante, à partir du stockage et du navigateur. */
export function readCookieBannerLang(pathname: string): SiteLang {
  return resolveCookieBannerLang({ pathname, stored: readStoredHints(), browser: readBrowserLangs() });
}
