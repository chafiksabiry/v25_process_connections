import { describe, expect, it } from 'vitest';
import {
  isLangTelephonyPath,
  langTelephonyRedirect,
  rememberLangFromPath,
  mapLangTelephonyPath,
  rememberSiteLang,
} from './langTelephonyRedirect';

describe('mapLangTelephonyPath', () => {
  it('retire le préfixe de langue des chemins /:lang/telephony*', () => {
    expect(mapLangTelephonyPath('/en/telephony')).toEqual({ lang: 'en', pathname: '/telephony' });
    expect(mapLangTelephonyPath('/en/telephony/')).toEqual({ lang: 'en', pathname: '/telephony' });
    expect(mapLangTelephonyPath('/en/telephony/nomad')).toEqual({ lang: 'en', pathname: '/telephony/nomad' });
    expect(mapLangTelephonyPath('/fr/telephony')).toEqual({ lang: 'fr', pathname: '/telephony' });
    expect(mapLangTelephonyPath('/es/telephony/start')).toEqual({ lang: 'es', pathname: '/telephony/start' });
    expect(mapLangTelephonyPath('/ar/telephony/app/dashboard')).toEqual({ lang: 'ar', pathname: '/telephony/app/dashboard' });
  });

  it('ne touche à aucune autre adresse', () => {
    for (const p of ['/telephony', '/telephony/nomad', '/en', '/en/taas', '/en/auth/signin', '/de/telephony', '/en/telephonyx', '/english/telephony', '/']) {
      expect(mapLangTelephonyPath(p)).toBeNull();
      expect(isLangTelephonyPath(p)).toBe(false);
    }
  });
});

describe('langTelephonyRedirect', () => {
  it('garde la requête et l’ancre', () => {
    expect(langTelephonyRedirect({ pathname: '/en/telephony', search: '?situation=tpe', hash: '#prix' })).toEqual({
      lang: 'en',
      url: '/telephony?situation=tpe#prix',
    });
  });

  it('aucune cible ne garde de préfixe de langue (pas de boucle)', () => {
    const r = langTelephonyRedirect({ pathname: '/fr/telephony/nomad' });
    expect(r?.url).toBe('/telephony/nomad');
    expect(isLangTelephonyPath(r!.url)).toBe(false);
  });
});

describe('rememberSiteLang', () => {
  it('enregistre la langue comme choix explicite, avec les clés lues par l’application Téléphonie', () => {
    const store = new Map<string, string>();
    rememberSiteLang('en', { setItem: (k, v) => void store.set(k, v) });
    expect(Object.fromEntries(store)).toEqual({ harxSiteLang: 'en', i18nextLng: 'en', harxLangExplicit: '1' });
  });

  it('ne casse rien si le stockage est indisponible', () => {
    expect(() =>
      rememberSiteLang('fr', {
        setItem: () => {
          throw new Error('quota');
        },
      }),
    ).not.toThrow();
    expect(() => rememberSiteLang('fr', null)).not.toThrow();
  });
});

describe('rememberLangFromPath (constat du 21/11 : la langue de /en doit suivre vers /telephony)', () => {
  const memStore = (init: Record<string, string> = {}) => {
    const m = new Map(Object.entries(init));
    let writes = 0;
    return { m, get writes() { return writes; }, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { writes += 1; m.set(k, v); } };
  };

  it.each([
    ['/en', 'en'], ['/en/', 'en'], ['/en/taas', 'en'], ['/es/auth/choice', 'es'], ['/ar/privacy', 'ar'], ['/fr', 'fr'],
  ] as const)('%s : « %s » mémorisée comme choix explicite', (path, lang) => {
    const s = memStore({ harxSiteLang: 'fr', i18nextLng: 'fr', harxLangExplicit: '1' });
    expect(rememberLangFromPath(path, s)).toBe(lang);
    expect(Object.fromEntries(s.m)).toEqual({ harxSiteLang: lang, i18nextLng: lang, harxLangExplicit: '1' });
  });

  it.each(['/', '/telephony', '/telephony/nomad', '/auth/signin', '/english', '/de/taas'])('%s (sans préfixe géré) : rien n’est écrit', (path) => {
    const s = memStore({ harxSiteLang: 'fr', harxLangExplicit: '1' });
    expect(rememberLangFromPath(path, s)).toBeNull();
    expect(s.writes).toBe(0);
    expect(s.m.get('harxSiteLang')).toBe('fr');
  });

  it('langue déjà mémorisée : aucune écriture', () => {
    const s = memStore({ harxSiteLang: 'en', i18nextLng: 'en', harxLangExplicit: '1' });
    rememberLangFromPath('/en/taas', s);
    expect(s.writes).toBe(0);
  });

  it('stockage indisponible : la langue est renvoyée, rien ne casse', () => {
    expect(rememberLangFromPath('/en', null)).toBe('en');
  });
});
