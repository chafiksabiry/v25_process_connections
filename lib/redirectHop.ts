import { stripLangPrefix } from './langRoutes';

/**
 * Adresses « relais » : une page qui n'affiche rien et renvoie aussitôt ailleurs. `/telephony/start?…&plan=…` (application
 * Téléphonie) mémorise l'offre choisie puis ouvre l'inscription (`/auth/register-…`) par un chargement complet.
 *
 * Constat du fondateur (22/11/2026, parcours Nomad) : depuis l'inscription, la flèche « retour » du navigateur revenait sur ce
 * relais, qui renvoyait aussitôt sur l'inscription : impossible de revenir à la page Nomad. L'hôte :
 * - à l'arrivée sur l'inscription depuis un relais (document.referrer), note qu'un retour sur ce relais doit être sauté, et note
 *   la page de l'offre quittée juste avant le relais (lue par le bouton « Retour » du module d'inscription) ;
 * - au retour sur le relais (historique), revient encore d'un cran au lieu de monter l'application : page Nomad.
 * Sans note (relais ouvert directement, aller vers l'avant), rien ne change.
 */
export const REDIRECT_HOP_PATHS: readonly string[] = ['/telephony/start'];

/** Clé partagée avec v25_registration_front (src/lib/offerRegister.ts) : `{ "url": "/nomad?…" }`. */
export const OFFER_RETURN_KEY = 'harx_offer_return';
/** Relais à sauter au prochain retour (adresse du relais). */
export const HOP_SKIP_KEY = 'harx_hop_skip';
/** Page quittée pour entrer dans le relais (adresse), en attendant l'arrivée sur l'inscription. */
export const BEFORE_HOP_KEY = 'harx_before_hop';

function cleanPath(pathname: string): string {
  return stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
}

export function isRedirectHop(pathname: string): boolean {
  return REDIRECT_HOP_PATHS.includes(cleanPath(pathname));
}

/** Écrans d'inscription (avec ou sans préfixe de langue), dont l'inscription NOMAD `/nomad/inscription` : seuls endroits où la note de retour garde un sens. */
export function isRegisterPath(pathname: string): boolean {
  const p = cleanPath(pathname);
  return /^\/auth\/register(-[a-z-]+)?$/.test(p) || p === '/nomad/inscription';
}

/** Adresse locale (chemin + requête + ancre) d'un referrer de même origine, sinon `null`. */
export function sameOriginPath(referrer: string | null | undefined, origin: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface HopContext {
  location: Pick<Location, 'pathname' | 'search' | 'hash' | 'origin'>;
  referrer: string;
  /** Type de navigation du document : 'navigate', 'reload', 'back_forward'… */
  navigationType: string;
}

export type HopDecision = { skip: true } | { skip: false };

function read(storage: StorageLike | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function write(storage: StorageLike | null, key: string, value: string | null): void {
  if (!storage) return;
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* stockage indisponible : comportement d'avant (pas de saut, Retour par défaut) */
  }
}

/**
 * Règle appliquée au chargement de chaque document de l'hôte (avant tout montage de micro-application).
 * Renvoie `{ skip: true }` quand ce document est un relais atteint par la flèche « retour » juste après une inscription :
 * l'appelant revient alors encore d'un cran (history.back()) sans monter l'application.
 */
export function applyRedirectHopRule(ctx: HopContext, storage: StorageLike | null): HopDecision {
  const { location } = ctx;
  if (isRedirectHop(location.pathname)) {
    const here = `${location.pathname}${location.search}`;
    if (ctx.navigationType === 'back_forward' && read(storage, HOP_SKIP_KEY) === here) {
      write(storage, HOP_SKIP_KEY, null);
      return { skip: true };
    }
    // Entrée normale dans le relais : on note la page d'où l'on vient (même origine seulement).
    write(storage, HOP_SKIP_KEY, null);
    write(storage, BEFORE_HOP_KEY, sameOriginPath(ctx.referrer, location.origin));
    return { skip: false };
  }
  if (isRegisterPath(location.pathname)) {
    const from = sameOriginPath(ctx.referrer, location.origin);
    if (ctx.navigationType === 'navigate' && from && isRedirectHop(new URL(from, location.origin).pathname)) {
      const fromUrl = new URL(from, location.origin);
      write(storage, HOP_SKIP_KEY, `${fromUrl.pathname}${fromUrl.search}`);
      const before = read(storage, BEFORE_HOP_KEY);
      write(storage, OFFER_RETURN_KEY, before ? JSON.stringify({ url: before }) : null);
      write(storage, BEFORE_HOP_KEY, null);
    }
    return { skip: false };
  }
  // Hors relais et hors inscription : les notes n'ont plus de sens.
  write(storage, OFFER_RETURN_KEY, null);
  write(storage, BEFORE_HOP_KEY, null);
  return { skip: false };
}

function safeSessionStorage(): StorageLike | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

function navigationTypeOf(win: Window): string {
  try {
    const entry = win.performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
    return entry?.type ?? 'navigate';
  } catch {
    return 'navigate';
  }
}

/**
 * À appeler au tout début de main.tsx. Renvoie true quand la page est un relais à sauter : history.back() est déjà demandé et
 * l'appelant ne doit pas démarrer les micro-applications (sinon le relais renverrait encore vers l'inscription).
 */
export function installRedirectHopRule(win: Window = window, storage: StorageLike | null = safeSessionStorage()): boolean {
  const decision = applyRedirectHopRule(
    { location: win.location, referrer: win.document.referrer, navigationType: navigationTypeOf(win) },
    storage,
  );
  // Page du relais restaurée depuis le cache avant/arrière (scripts non rejoués) : même règle.
  win.addEventListener('pageshow', (event) => {
    if (!(event as PageTransitionEvent).persisted) return;
    const again = applyRedirectHopRule(
      { location: win.location, referrer: win.document.referrer, navigationType: 'back_forward' },
      storage,
    );
    if (again.skip) win.history.back();
  });
  // Navigation interne (pushState de React Router, retour arrière) hors inscription : la note de retour est retirée.
  win.addEventListener('popstate', () => {
    if (!isRegisterPath(win.location.pathname) && !isRedirectHop(win.location.pathname)) write(storage, OFFER_RETURN_KEY, null);
  });
  if (decision.skip) win.history.back();
  return decision.skip;
}
