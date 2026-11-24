import { getLangFromPath, stripLangPrefix, type SiteLang } from './langRoutes';

/**
 * Adresses CLOUD Receptionist validées par le fondateur (24/11/2026, « ok ») : l'adresse porte l'offre ET le produit, jamais « telephony ».
 *
 * - `/cloud` : page CLOUD (les trois offres ; ancienne adresse `/telephony/`) — application Téléphonie (v25_callcenter_front) ;
 * - `/cloud/receptionist` : page de l'offre Receptionist — application Téléphonie ;
 * - `/cloud/receptionist/inscription` : étape 1 « Nommez votre entreprise » — application Téléphonie ;
 * - `/cloud/receptionist/inscription/compte` : étape 2 « Compte HARX » — module d'inscription (v25_registration_front) ;
 * - `/cloud/receptionist/connexion` : connexion Receptionist — module d'inscription ;
 * - `/cloud/receptionist/<écran>` (mise-en-route, tableau-de-bord, appels…) : écrans du portail — application Téléphonie.
 *
 * Entreprise et Contact Centre gardent `/telephony/...` (non traités) ; NOMAD garde `/nomad` (ses règles passent d'abord, voir nomadRoutes.ts).
 *
 * Anciennes adresses : celles reconnues à leur seul chemin ont une 301 dans netlify.toml (`/telephony`, `/telephony/`,
 * `/telephony/cloud/receptionist`) ; celles reconnues à un paramètre ou à un préfixe de langue sont remplacées par l'hôte avant tout montage
 * (`cloudLegacyRedirect`). `/telephony/app/<écran>` ne dit pas l'offre : c'est le portail qui le renvoie, une fois le compte connu.
 * Aucune cible n'est une ancienne adresse : pas de boucle.
 */

export const CLOUD_HOME = '/cloud';
export const CLOUD_RECEPTIONIST = '/cloud/receptionist';
export const CLOUD_RECEPTIONIST_SIGNUP = '/cloud/receptionist/inscription';
export const CLOUD_RECEPTIONIST_ACCOUNT = '/cloud/receptionist/inscription/compte';
export const CLOUD_RECEPTIONIST_SIGNIN = '/cloud/receptionist/connexion';

/** Écrans CLOUD servis par le module d'inscription (connexion, étape 2 de l'inscription). */
export const CLOUD_AUTH_PATHS: readonly string[] = [CLOUD_RECEPTIONIST_SIGNIN, CLOUD_RECEPTIONIST_ACCOUNT];

/**
 * Écrans du portail d'un compte Receptionist, montés sous `/cloud/receptionist/<écran>` (même table que v25_callcenter_front,
 * src/domain/cloudPaths.ts) : bouton WhatsApp compact, référencement (noindex).
 */
export const CLOUD_RECEPTIONIST_SCREENS = [
  'mise-en-route',
  'tableau-de-bord',
  'accueil',
  'a-traiter',
  'appels',
  'appeler',
  'messages',
  'accueil-repondeur',
  'annuaire',
  'prendre-un-message',
  'consignes',
  'reponses',
  'agenda',
  'e-mails',
  'numeros',
  'repartition',
  'secretaires',
  'equipe',
  'planning',
  'outils',
  'facturation',
  'profil',
] as const;

/** Offre Receptionist dans les anciens paramètres d'adresse (`?plan=accueil`). */
const RECEPTIONIST_PLAN = 'accueil';

function clean(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/** `/cloud` ou `/cloud/…` (sans préfixe de langue). */
export function isCloudPath(pathname: string): boolean {
  const p = clean(pathname);
  return p === CLOUD_HOME || p.startsWith(`${CLOUD_HOME}/`);
}

/** Connexion ou étape 2 de l'inscription Receptionist (barre finale tolérée) : module d'inscription. */
export function isCloudAuthPath(pathname: string): boolean {
  return CLOUD_AUTH_PATHS.includes(clean(pathname));
}

/** `/cloud` et `/cloud/*` hors connexion et étape 2 : application Téléphonie (page CLOUD, page de l'offre, étape 1, portail). */
export function isCloudPortalPath(pathname: string): boolean {
  return isCloudPath(pathname) && !isCloudAuthPath(pathname);
}

/** `/:lang/cloud*` (ex. `/en/cloud`, `/fr/cloud/receptionist/connexion`) : adresse CLOUD avec un préfixe de langue, à retirer. */
export function isLangCloudPath(pathname: string): boolean {
  return getLangFromPath(pathname) !== null && isCloudPath(stripLangPrefix(pathname));
}

/** Écran du portail Receptionist (`/cloud/receptionist/<écran>[/…]`), hors pages publiques, connexion et inscription. */
export function isCloudReceptionistScreen(pathname: string): boolean {
  const p = clean(pathname);
  if (!p.startsWith(`${CLOUD_RECEPTIONIST}/`)) return false;
  const first = p.slice(CLOUD_RECEPTIONIST.length + 1).split('/')[0];
  return (CLOUD_RECEPTIONIST_SCREENS as readonly string[]).includes(first);
}

function withoutParams(search: string | undefined, names: readonly string[]): string {
  const params = new URLSearchParams(search || '');
  for (const n of names) params.delete(n);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export interface CloudRedirect {
  /** Adresse CLOUD complète (requête utile et ancre gardées). */
  url: string;
  /** Langue du préfixe de l'ancienne adresse, à mémoriser comme choix explicite (les adresses CLOUD n'ont pas de préfixe). */
  lang: SiteLang | null;
}

/**
 * Ancienne adresse d'entrée du parcours CLOUD Receptionist → adresse CLOUD ; `null` pour toute autre adresse (NOMAD, TAAS, Entreprise,
 * Contact Centre, écrans connectés `/telephony/app/...` : inchangés ici). À appliquer APRÈS les règles NOMAD (`nomadLegacyRedirect`).
 * - `/telephony`, `/telephony/` (et `/:lang/telephony`) → `/cloud` ; `/telephony/cloud/receptionist` → `/cloud/receptionist` ;
 * - `/telephony/start?plan=accueil[&price=…]` → `/cloud/receptionist/inscription[?price=…]` ;
 * - `/telephony/start` sans offre ni profil (entrée commune « Créer mon compte ») → `/cloud` (choisir une offre) ;
 * - `/auth/signin?product=callcentre&plan=accueil` → `/cloud/receptionist/connexion` (venue de Receptionist) ;
 * - `/auth/register-call-center?product=callcentre&plan=accueil` → `/cloud/receptionist/inscription/compte` ;
 * - `/:lang/cloud*` → `/cloud*` (langue mémorisée par l'appelant).
 * `/auth/signin?product=callcentre` SANS offre reste la connexion commune des offres CLOUD : c'est la seule connexion des comptes
 * Entreprise et Contact Centre (non traités), la renvoyer vers `/cloud` la rendrait inaccessible.
 */
export function cloudLegacyRedirect(loc: { pathname: string; search?: string; hash?: string }): CloudRedirect | null {
  const lang = getLangFromPath(loc.pathname);
  const rest = clean(stripLangPrefix(loc.pathname));
  const hash = loc.hash || '';
  const params = new URLSearchParams(loc.search || '');
  const plan = (params.get('plan') || '').toLowerCase();
  let target: string | null = null;
  let search = loc.search || '';
  if (rest === '/telephony') {
    target = CLOUD_HOME;
  } else if (rest === '/telephony/cloud/receptionist') {
    target = CLOUD_RECEPTIONIST;
  } else if (rest === '/telephony/start' && !params.get('profil')) {
    if (plan === RECEPTIONIST_PLAN) {
      target = CLOUD_RECEPTIONIST_SIGNUP;
      search = withoutParams(loc.search, ['plan']);
    } else if (!plan) {
      target = CLOUD_HOME;
    }
  } else if (rest === '/auth/signin' && params.get('product') === 'callcentre' && plan === RECEPTIONIST_PLAN) {
    target = CLOUD_RECEPTIONIST_SIGNIN;
    search = withoutParams(loc.search, ['product', 'plan']);
  } else if (rest === '/auth/register-call-center' && plan === RECEPTIONIST_PLAN) {
    target = CLOUD_RECEPTIONIST_ACCOUNT;
    search = withoutParams(loc.search, ['product', 'plan']);
  } else if (lang && isCloudPath(rest)) {
    target = rest;
  }
  if (!target) return null;
  return { url: `${target}${search}${hash}`, lang };
}
