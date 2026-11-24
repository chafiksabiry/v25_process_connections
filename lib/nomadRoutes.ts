import { getLangFromPath, stripLangPrefix, type SiteLang } from './langRoutes';

/**
 * Adresses NOMAD validées par le fondateur (24/11/2026) : tout le parcours NOMAD vit sous `/nomad`, jamais sous `/telephony`
 * (CLOUD garde `/telephony`, inchangé).
 *
 * - `/nomad` : page de l'offre NOMAD (application Téléphonie, v25_callcenter_front) ;
 * - `/nomad/connexion`, `/nomad/inscription` : connexion et inscription NOMAD (module d'inscription, v25_registration_front) ;
 * - `/nomad/<écran>` (mise-en-route, poste, appels…) : écrans du portail (application Téléphonie).
 *
 * Les anciennes adresses restent valables (liens déjà envoyés, publicités, référencement) et sont remplacées avant tout montage :
 * - `/telephony/nomad` et `/:lang/telephony/nomad` → `/nomad` ; `/:lang/nomad*` → `/nomad*` (langue mémorisée par l'appelant) ;
 * - `/auth/signin?product=nomad` → `/nomad/connexion` ; `/auth/register-nomad` → `/nomad/inscription` ;
 * - `/telephony/start?profil=solo…` → `/nomad/inscription` (l'offre et le profil Solo sont mémorisés par le module d'inscription
 *   à l'arrivée sur `/nomad/inscription`, comme le faisait le relais) ;
 * - `/call-center/poste` → `/nomad/poste` (voir callCenterRedirect.ts).
 * Aucune cible n'est une ancienne adresse : pas de boucle.
 */

export const NOMAD_HOME = '/nomad';
export const NOMAD_SIGNIN = '/nomad/connexion';
export const NOMAD_REGISTER = '/nomad/inscription';

/** Écrans NOMAD servis par le module d'inscription. */
export const NOMAD_AUTH_PATHS: readonly string[] = [NOMAD_SIGNIN, NOMAD_REGISTER];

/** Écrans du portail NOMAD (application Téléphonie), montés par l'hôte sous `/nomad/<écran>`. */
export const NOMAD_PORTAL_SCREENS = [
  'mise-en-route',
  'poste',
  'appels',
  'messages',
  'repondeur',
  'annonce',
  'numero',
  'contacts',
  'facturation',
  'profil',
  'application',
  'identite',
  'faq',
] as const;

function clean(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/** `/nomad` ou `/nomad/…` (sans préfixe de langue). */
export function isNomadPath(pathname: string): boolean {
  return pathname === NOMAD_HOME || pathname.startsWith(`${NOMAD_HOME}/`);
}

/** `/nomad/connexion` ou `/nomad/inscription` (barre finale tolérée) : module d'inscription. */
export function isNomadAuthPath(pathname: string): boolean {
  return NOMAD_AUTH_PATHS.includes(clean(pathname));
}

/** `/nomad` et `/nomad/*` hors connexion et inscription : application Téléphonie (page de l'offre et portail NOMAD). */
export function isNomadPortalPath(pathname: string): boolean {
  return isNomadPath(pathname) && !isNomadAuthPath(pathname);
}

/** `/:lang/nomad*` (ex. `/en/nomad`, `/fr/nomad/connexion`) : adresse NOMAD avec un préfixe de langue, à retirer. */
export function isLangNomadPath(pathname: string): boolean {
  return getLangFromPath(pathname) !== null && isNomadPath(stripLangPrefix(pathname));
}

function withoutParams(search: string | undefined, names: readonly string[]): string {
  const params = new URLSearchParams(search || '');
  for (const n of names) params.delete(n);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export interface NomadRedirect {
  /** Adresse NOMAD complète (requête utile et ancre gardées). */
  url: string;
  /** Langue du préfixe de l'ancienne adresse, à mémoriser comme choix explicite (les adresses NOMAD n'ont pas de préfixe). */
  lang: SiteLang | null;
}

/** Ancienne adresse du parcours NOMAD → adresse NOMAD ; `null` pour toute autre adresse (CLOUD, TAAS… inchangés). */
export function nomadLegacyRedirect(loc: { pathname: string; search?: string; hash?: string }): NomadRedirect | null {
  const lang = getLangFromPath(loc.pathname);
  const rest = clean(stripLangPrefix(loc.pathname));
  const hash = loc.hash || '';
  const params = new URLSearchParams(loc.search || '');
  let target: string | null = null;
  let search = loc.search || '';
  if (rest === '/telephony/nomad') {
    target = NOMAD_HOME;
  } else if (lang && isNomadPath(rest)) {
    target = rest;
  } else if (rest === '/auth/register-nomad') {
    target = NOMAD_REGISTER;
    search = withoutParams(loc.search, ['product']);
  } else if (rest === '/auth/signin' && params.get('product') === 'nomad') {
    target = NOMAD_SIGNIN;
    search = withoutParams(loc.search, ['product']);
  } else if (rest === '/telephony/start' && params.get('profil') === 'solo') {
    // Relais « Je travaille seul » : l'offre NOMAD n'a qu'un plan (nomad_solo) ; les autres paramètres (utm_…, price) suivent.
    target = NOMAD_REGISTER;
    search = withoutParams(loc.search, ['profil', 'plan']);
  }
  if (!target) return null;
  return { url: `${target}${search}${hash}`, lang };
}
