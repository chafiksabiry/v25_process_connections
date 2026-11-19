/**
 * Arbitrage 12 (18/11/2026) : l'ancienne application `/call-center` est retirée.
 * Toute adresse `/call-center` ou `/call-center/*` part vers l'application `/telephony`.
 *
 * - `/call-center` → `/telephony`
 * - `/call-center/<rubrique>[/suite]` → `/telephony/app/<rubrique>[/suite]` quand la rubrique existe dans `/telephony`
 * - `/call-center/onboarding` → `/telephony/onboarding`
 * - toute autre adresse → `/telephony/app/dashboard`
 *
 * La même table est appliquée côté serveur par netlify.toml (redirections 301) ;
 * le test `callCenterRedirect.test.ts` vérifie que les deux restent alignés.
 * Aucune cible ne commence par `/call-center` : pas de boucle possible.
 */

export const LEGACY_CALL_CENTER_PREFIX = '/call-center';
export const TELEPHONY_HOME = '/telephony';
export const TELEPHONY_FALLBACK = '/telephony/app/dashboard';

/** Rubriques de l'espace connecté `/telephony/app/*` (v25_callcenter_front, src/App.tsx). */
export const TELEPHONY_APP_SECTIONS = [
  'home',
  'poste',
  'install',
  'dashboard',
  'operations',
  'leads',
  'clients',
  'knowledge',
  'training',
  'integrations',
  'profile',
  'calls',
  'agents',
  'team',
  'queues',
  'greeting',
  'voicemails',
  'appeler',
  'followups',
  'annuaire',
  'message',
  'consignes',
  'reponses',
  'agenda',
  'emails',
  'tools',
  'planning',
  'numbers',
  'scripts',
  'quality',
  'billing',
  'academie',
] as const;

/** Rubriques de `/telephony` hors de l'espace `/app`. */
export const TELEPHONY_TOP_SECTIONS = ['onboarding'] as const;

const APP_SET = new Set<string>(TELEPHONY_APP_SECTIONS);
const TOP_SET = new Set<string>(TELEPHONY_TOP_SECTIONS);

export function isLegacyCallCenterPath(pathname: string): boolean {
  return pathname === LEGACY_CALL_CENTER_PREFIX || pathname.startsWith(`${LEGACY_CALL_CENTER_PREFIX}/`);
}

/** Chemin `/telephony…` équivalent, ou `null` si l'adresse n'est pas sous `/call-center`. */
export function mapLegacyCallCenterPath(pathname: string): string | null {
  if (!isLegacyCallCenterPath(pathname)) return null;
  const rest = pathname.slice(LEGACY_CALL_CENTER_PREFIX.length).replace(/^\/+/, '').replace(/\/+$/, '');
  if (!rest) return TELEPHONY_HOME;
  const parts = rest.split('/').filter(Boolean);
  if (TOP_SET.has(parts[0])) return `${TELEPHONY_HOME}/${parts.join('/')}`;
  if (APP_SET.has(parts[0])) return `${TELEPHONY_HOME}/app/${parts.join('/')}`;
  return TELEPHONY_FALLBACK;
}

/** Adresse complète de destination (requête et ancre conservées), ou `null`. */
export function legacyCallCenterRedirect(loc: { pathname: string; search?: string; hash?: string }): string | null {
  const target = mapLegacyCallCenterPath(loc.pathname);
  if (!target) return null;
  return `${target}${loc.search || ''}${loc.hash || ''}`;
}
