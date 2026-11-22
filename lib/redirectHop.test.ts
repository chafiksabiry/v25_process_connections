import { describe, expect, it } from 'vitest';
import {
  BEFORE_HOP_KEY,
  HOP_SKIP_KEY,
  OFFER_RETURN_KEY,
  applyRedirectHopRule,
  isRedirectHop,
  isRegisterPath,
  sameOriginPath,
} from './redirectHop';

const ORIGIN = 'https://harx.test';

function storage(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial));
  return {
    map: m,
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

/** Chargement d'un document de l'hôte à l'adresse `url`, venu de `referrer`. */
function load(url: string, referrer: string, navigationType: string, s: ReturnType<typeof storage>) {
  const u = new URL(url, ORIGIN);
  return applyRedirectHopRule(
    { location: { pathname: u.pathname, search: u.search, hash: u.hash, origin: ORIGIN }, referrer: referrer ? new URL(referrer, ORIGIN).href : '', navigationType },
    s,
  );
}

describe('règles du relais', () => {
  it('reconnaît le relais Téléphonie (avec ou sans préfixe de langue, barre finale)', () => {
    expect(isRedirectHop('/telephony/start')).toBe(true);
    expect(isRedirectHop('/telephony/start/')).toBe(true);
    expect(isRedirectHop('/fr/telephony/start')).toBe(true);
    expect(isRedirectHop('/telephony/nomad')).toBe(false);
    expect(isRedirectHop('/telephony/starter')).toBe(false);
  });

  it('écrans d’inscription', () => {
    for (const p of ['/auth/register', '/auth/register-nomad', '/auth/register-call-center', '/fr/auth/register-company', '/auth/register-rep/']) {
      expect(isRegisterPath(p)).toBe(true);
    }
    for (const p of ['/auth/choice', '/auth/signin', '/telephony/nomad', '/']) expect(isRegisterPath(p)).toBe(false);
  });

  it('referrer de même origine seulement', () => {
    expect(sameOriginPath(`${ORIGIN}/telephony/nomad?pays=CA#forfaits`, ORIGIN)).toBe('/telephony/nomad?pays=CA#forfaits');
    expect(sameOriginPath('https://evil.test/telephony/nomad', ORIGIN)).toBeNull();
    expect(sameOriginPath('', ORIGIN)).toBeNull();
    expect(sameOriginPath('pas une url', ORIGIN)).toBeNull();
  });
});

describe('parcours Nomad : page Nomad → relais → inscription → retour', () => {
  it('la flèche retour saute le relais (plus de boucle) et la page d’origine est notée pour le bouton Retour', () => {
    const s = storage();
    expect(load('/telephony/nomad?pays=CA', '', 'navigate', s)).toEqual({ skip: false });
    expect(load('/telephony/start?profil=solo&plan=nomad_solo', '/telephony/nomad?pays=CA', 'navigate', s)).toEqual({ skip: false });
    expect(s.map.get(BEFORE_HOP_KEY)).toBe('/telephony/nomad?pays=CA');
    expect(load('/auth/register-call-center?product=callcentre', '/telephony/start?profil=solo&plan=nomad_solo', 'navigate', s)).toEqual({ skip: false });
    expect(JSON.parse(s.map.get(OFFER_RETURN_KEY)!)).toEqual({ url: '/telephony/nomad?pays=CA' });
    expect(s.map.get(HOP_SKIP_KEY)).toBe('/telephony/start?profil=solo&plan=nomad_solo');
    expect(s.map.has(BEFORE_HOP_KEY)).toBe(false);
    // Retour : le relais est sauté (une seule fois).
    expect(load('/telephony/start?profil=solo&plan=nomad_solo', '', 'back_forward', s)).toEqual({ skip: true });
    expect(s.map.has(HOP_SKIP_KEY)).toBe(false);
    // Arrivée sur la page Nomad : les notes sont retirées.
    expect(load('/telephony/nomad?pays=CA', '', 'back_forward', s)).toEqual({ skip: false });
    expect(s.map.has(OFFER_RETURN_KEY)).toBe(false);
    // Vers l'avant : le relais fait son travail normalement.
    expect(load('/telephony/start?profil=solo&plan=nomad_solo', '', 'back_forward', s)).toEqual({ skip: false });
  });

  it('rechargement de l’inscription : notes gardées', () => {
    const s = storage({ [OFFER_RETURN_KEY]: JSON.stringify({ url: '/telephony/nomad' }), [HOP_SKIP_KEY]: '/telephony/start?plan=nomad_solo' });
    load('/auth/register-nomad?product=nomad', '', 'reload', s);
    expect(s.map.get(OFFER_RETURN_KEY)).toBe(JSON.stringify({ url: '/telephony/nomad' }));
    expect(s.map.get(HOP_SKIP_KEY)).toBe('/telephony/start?plan=nomad_solo');
  });

  it('relais ouvert directement (sans page d’origine) : rien de noté', () => {
    const s = storage({ [OFFER_RETURN_KEY]: JSON.stringify({ url: '/telephony/nomad' }) });
    load('/telephony/start?plan=accueil', 'https://ailleurs.test/', 'navigate', s);
    load('/auth/register-call-center?product=callcentre', '/telephony/start?plan=accueil', 'navigate', s);
    expect(s.map.has(OFFER_RETURN_KEY)).toBe(false);
  });

  it('autre relais que celui noté, ou relais atteint vers l’avant : pas de saut', () => {
    const s = storage({ [HOP_SKIP_KEY]: '/telephony/start?plan=nomad_solo' });
    expect(load('/telephony/start?plan=accueil', '', 'back_forward', s)).toEqual({ skip: false });
    const s2 = storage({ [HOP_SKIP_KEY]: '/telephony/start?plan=nomad_solo' });
    expect(load('/telephony/start?plan=nomad_solo', '/telephony/nomad', 'navigate', s2)).toEqual({ skip: false });
  });
});

describe('aucun changement hors relais (TAAS, CLOUD, connexion)', () => {
  it('inscription TAAS depuis /auth/choice : ni saut ni note', () => {
    const s = storage();
    load('/fr/auth/choice', '', 'navigate', s);
    load('/fr/auth/register-company', '/fr/auth/choice', 'navigate', s);
    load('/telephony', '/fr/auth/register-company', 'navigate', s);
    expect(s.map.size).toBe(0);
  });

  it('stockage indisponible : aucun saut, aucune erreur', () => {
    expect(load('/telephony/start?plan=nomad_solo', '', 'back_forward', null as never)).toEqual({ skip: false });
  });
});
