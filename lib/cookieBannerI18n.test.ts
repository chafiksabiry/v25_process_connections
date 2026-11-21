import { describe, expect, it } from 'vitest';
import {
  COOKIE_BANNER_TEXTS,
  cookieBannerDir,
  cookiePolicyHref,
  resolveCookieBannerLang,
  type StoredLangHints,
} from './cookieBannerI18n';
import { SITE_LANGS } from './langRoutes';

const NONE: StoredLangHints = { explicit: false, siteLang: null, sharedLang: null, countryLang: null };

describe('resolveCookieBannerLang', () => {
  it.each([
    ['/fr', 'fr'],
    ['/en', 'en'],
    ['/es', 'es'],
    ['/ar', 'ar'],
    ['/en/telephony', 'en'],
    ['/es/cookies', 'es'],
    ['/ar/auth/signin', 'ar'],
  ] as const)('suit le préfixe de langue de %s', (pathname, lang) => {
    // Le préfixe prime sur un choix mémorisé différent et sur le navigateur.
    const stored: StoredLangHints = { explicit: true, siteLang: 'fr', sharedLang: 'fr', countryLang: 'fr' };
    expect(resolveCookieBannerLang({ pathname, stored, browser: ['de-DE'] })).toBe(lang);
  });

  it('sans préfixe, suit le choix explicite mémorisé par le site (harxSiteLang, sinon i18nextLng)', () => {
    expect(resolveCookieBannerLang({ pathname: '/telephony', stored: { ...NONE, explicit: true, siteLang: 'en' }, browser: ['fr-FR'] })).toBe('en');
    expect(resolveCookieBannerLang({ pathname: '/telephony/start', stored: { ...NONE, explicit: true, siteLang: 'ar' }, browser: [] })).toBe('ar');
    expect(resolveCookieBannerLang({ pathname: '/reps', stored: { ...NONE, explicit: true, sharedLang: 'es-ES' }, browser: [] })).toBe('es');
  });

  it('ignore une langue mémorisée non explicite', () => {
    expect(resolveCookieBannerLang({ pathname: '/reps', stored: { ...NONE, siteLang: 'fr' }, browser: ['en-GB'] })).toBe('en');
  });

  it('sans préfixe ni choix, partout : navigateur fr / es / ar, sinon français pour un pays francophone, sinon anglais', () => {
    expect(resolveCookieBannerLang({ pathname: '/telephony', stored: { ...NONE, countryLang: 'fr' }, browser: ['en-GB'] })).toBe('fr');
    expect(resolveCookieBannerLang({ pathname: '/telephony', stored: { ...NONE, countryLang: 'es' }, browser: ['en-GB'] })).toBe('en');
    expect(resolveCookieBannerLang({ pathname: '/telephony/', stored: NONE, browser: ['de-DE', 'en-GB'] })).toBe('en');
    expect(resolveCookieBannerLang({ pathname: '/telephony', stored: NONE, browser: ['ar-MA'] })).toBe('ar');
    expect(resolveCookieBannerLang({ pathname: '/company', stored: NONE, browser: ['en-GB'] })).toBe('en');
    expect(resolveCookieBannerLang({ pathname: '/company', stored: NONE, browser: ['en-GB'], timeZone: 'Europe/Paris' })).toBe('fr');
    expect(resolveCookieBannerLang({ pathname: '/company', stored: NONE, browser: ['fr-FR'] })).toBe('fr');
  });
});

describe('COOKIE_BANNER_TEXTS', () => {
  it('a les mêmes libellés, tous renseignés, dans les quatre langues', () => {
    const keys = Object.keys(COOKIE_BANNER_TEXTS.fr).sort();
    for (const lang of SITE_LANGS) {
      expect(Object.keys(COOKIE_BANNER_TEXTS[lang]).sort()).toEqual(keys);
      for (const value of Object.values(COOKIE_BANNER_TEXTS[lang])) expect(value.trim()).not.toBe('');
    }
  });

  it('affiche la bannière dans la langue de la page', () => {
    expect(COOKIE_BANNER_TEXTS.fr.title).toBe('Vos préférences de cookies');
    expect(COOKIE_BANNER_TEXTS.en.title).toBe('Your cookie preferences');
    expect(COOKIE_BANNER_TEXTS.en.refuse).toBe('Reject all');
    expect(COOKIE_BANNER_TEXTS.es.title).toBe('Sus preferencias de cookies');
    expect(COOKIE_BANNER_TEXTS.ar.accept).toBe('قبول الكل');
    // Aucun texte français ne subsiste dans les autres langues.
    for (const lang of ['en', 'es', 'ar'] as const) {
      for (const [key, value] of Object.entries(COOKIE_BANNER_TEXTS[lang])) {
        expect(value).not.toBe(COOKIE_BANNER_TEXTS.fr[key as keyof typeof COOKIE_BANNER_TEXTS.fr]);
      }
    }
  });

  it('écrit l\'arabe de droite à gauche et pointe vers la politique cookies de la même langue', () => {
    expect(cookieBannerDir('ar')).toBe('rtl');
    expect(cookieBannerDir('en')).toBe('ltr');
    expect(cookiePolicyHref('es')).toBe('/es/cookies');
    expect(cookiePolicyHref('fr')).toBe('/fr/cookies');
  });
});
