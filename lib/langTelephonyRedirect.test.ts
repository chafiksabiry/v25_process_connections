import { describe, expect, it } from 'vitest';
import {
  isLangTelephonyPath,
  langTelephonyRedirect,
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
