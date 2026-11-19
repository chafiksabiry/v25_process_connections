import { SITE_LANGS, type SiteLang } from './langRoutes';

/**
 * `/:lang/telephony*` (ex. `/en/telephony`, `/en/telephony/nomad`, `/fr/telephony`) n'existe pas dans le module
 * d'inscription : avant ce correctif, ces adresses montaient ce module et affichaient sa page 404 de développeur.
 *
 * L'application Téléphonie n'a pas de préfixe de langue : elle lit la langue choisie dans le stockage local
 * partagé du site (même origine), voir `src/i18n/lang.ts` de v25_callcenter_front :
 * `harxSiteLang`, sinon `i18nextLng`, pris en compte seulement si `harxLangExplicit` vaut « 1 ».
 *
 * On enregistre donc la langue de l'adresse comme choix explicite, puis on remplace l'adresse par
 * `/telephony*` (requête et ancre conservées) avant tout montage de micro-application.
 */

const LANG_TELEPHONY_RE = new RegExp(`^/(${SITE_LANGS.join('|')})(/telephony(?:/.*)?)$`);

export const SITE_LANG_KEY = 'harxSiteLang';
export const SHARED_LANG_KEY = 'i18nextLng';
export const LANG_EXPLICIT_KEY = 'harxLangExplicit';

export interface LangTelephonyTarget {
  lang: SiteLang;
  /** Chemin sans préfixe de langue, barre finale retirée (`/telephony`, `/telephony/nomad`). */
  pathname: string;
}

/** `/en/telephony/nomad` → `{ lang: 'en', pathname: '/telephony/nomad' }` ; `null` pour toute autre adresse. */
export function mapLangTelephonyPath(pathname: string): LangTelephonyTarget | null {
  const match = LANG_TELEPHONY_RE.exec(pathname);
  if (!match) return null;
  const rest = match[2].replace(/\/+$/, '') || '/telephony';
  return { lang: match[1] as SiteLang, pathname: rest };
}

export function isLangTelephonyPath(pathname: string): boolean {
  return mapLangTelephonyPath(pathname) !== null;
}

/** Adresse de destination complète (requête et ancre conservées) et langue à mémoriser, ou `null`. */
export function langTelephonyRedirect(loc: {
  pathname: string;
  search?: string;
  hash?: string;
}): { lang: SiteLang; url: string } | null {
  const target = mapLangTelephonyPath(loc.pathname);
  if (!target) return null;
  return { lang: target.lang, url: `${target.pathname}${loc.search || ''}${loc.hash || ''}` };
}

/** Mémorise la langue comme choix explicite (mêmes clés que le site d'accueil et l'application Téléphonie). */
export function rememberSiteLang(lang: SiteLang, storage: Pick<Storage, 'setItem'> | null = safeLocalStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(SITE_LANG_KEY, lang);
    storage.setItem(SHARED_LANG_KEY, lang);
    storage.setItem(LANG_EXPLICIT_KEY, '1');
  } catch {
    /* stockage indisponible (navigation privée stricte) : la page reste servie, dans la langue par défaut */
  }
}

function safeLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
