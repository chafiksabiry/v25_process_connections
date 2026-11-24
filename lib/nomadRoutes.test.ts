import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  NOMAD_PORTAL_SCREENS,
  isLangNomadPath,
  isNomadAuthPath,
  isNomadPortalPath,
  nomadLegacyRedirect,
} from './nomadRoutes';
import { isRegisterPath } from './redirectHop';
import { isNoindexPath, resolvePageMeta, NOMAD_TITLE } from './tracking/pageMeta';

// Adresses NOMAD validées par le fondateur (24/11/2026) : tout le parcours NOMAD sous /nomad, jamais sous /telephony.

describe('répartition des adresses /nomad entre les applications', () => {
  it('connexion et inscription NOMAD : module d’inscription', () => {
    for (const p of ['/nomad/connexion', '/nomad/inscription', '/nomad/connexion/', '/nomad/inscription/']) {
      expect(isNomadAuthPath(p), p).toBe(true);
      expect(isNomadPortalPath(p), p).toBe(false);
    }
  });

  it('page de l’offre et écrans du portail NOMAD : application Téléphonie', () => {
    for (const p of ['/nomad', '/nomad/', ...NOMAD_PORTAL_SCREENS.map((s) => `/nomad/${s}`), '/nomad/appels/42']) {
      expect(isNomadPortalPath(p), p).toBe(true);
      expect(isNomadAuthPath(p), p).toBe(false);
    }
  });

  it('les autres adresses ne sont pas des adresses NOMAD (CLOUD, TAAS inchangés)', () => {
    for (const p of ['/', '/telephony', '/telephony/nomad', '/telephony/app/poste', '/nomadx', '/auth/signin', '/en/nomad', '/taas']) {
      expect(isNomadPortalPath(p), p).toBe(false);
      expect(isNomadAuthPath(p), p).toBe(false);
    }
  });

  it('/:lang/nomad* est reconnu comme adresse NOMAD préfixée', () => {
    for (const p of ['/en/nomad', '/fr/nomad/connexion', '/ar/nomad/poste']) expect(isLangNomadPath(p), p).toBe(true);
    for (const p of ['/nomad', '/en', '/en/telephony/nomad', '/en/nomadx', '/de/nomad']) expect(isLangNomadPath(p), p).toBe(false);
  });
});

describe('nomadLegacyRedirect (anciennes adresses → adresses NOMAD)', () => {
  it('/telephony/nomad → /nomad (requête et ancre gardées)', () => {
    expect(nomadLegacyRedirect({ pathname: '/telephony/nomad' })).toEqual({ url: '/nomad', lang: null });
    expect(nomadLegacyRedirect({ pathname: '/telephony/nomad/', search: '?pays=CA', hash: '#forfaits' })).toEqual({ url: '/nomad?pays=CA#forfaits', lang: null });
  });

  it('/:lang/telephony/nomad → /nomad, langue à mémoriser', () => {
    expect(nomadLegacyRedirect({ pathname: '/en/telephony/nomad' })).toEqual({ url: '/nomad', lang: 'en' });
    expect(nomadLegacyRedirect({ pathname: '/ar/telephony/nomad', search: '?pays=MA' })).toEqual({ url: '/nomad?pays=MA', lang: 'ar' });
  });

  it('/:lang/nomad* → /nomad*, langue à mémoriser', () => {
    expect(nomadLegacyRedirect({ pathname: '/en/nomad' })).toEqual({ url: '/nomad', lang: 'en' });
    expect(nomadLegacyRedirect({ pathname: '/es/nomad/connexion', search: '?next=x' })).toEqual({ url: '/nomad/connexion?next=x', lang: 'es' });
    expect(nomadLegacyRedirect({ pathname: '/fr/nomad/poste/' })).toEqual({ url: '/nomad/poste', lang: 'fr' });
  });

  it('/auth/signin?product=nomad → /nomad/connexion (avec ou sans préfixe), autres paramètres gardés', () => {
    expect(nomadLegacyRedirect({ pathname: '/auth/signin', search: '?product=nomad' })).toEqual({ url: '/nomad/connexion', lang: null });
    expect(nomadLegacyRedirect({ pathname: '/en/auth/signin', search: '?product=nomad&utm_source=ads', hash: '#x' })).toEqual({
      url: '/nomad/connexion?utm_source=ads#x',
      lang: 'en',
    });
  });

  it('/auth/register-nomad(?product=nomad) → /nomad/inscription, étape et autres paramètres gardés', () => {
    expect(nomadLegacyRedirect({ pathname: '/auth/register-nomad' })).toEqual({ url: '/nomad/inscription', lang: null });
    expect(nomadLegacyRedirect({ pathname: '/auth/register-nomad', search: '?product=nomad&step=email' })).toEqual({ url: '/nomad/inscription?step=email', lang: null });
    expect(nomadLegacyRedirect({ pathname: '/fr/auth/register-nomad', search: '?product=nomad' })).toEqual({ url: '/nomad/inscription', lang: 'fr' });
  });

  it('/telephony/start?profil=solo… → /nomad/inscription (utm et prix gardés)', () => {
    expect(nomadLegacyRedirect({ pathname: '/telephony/start', search: '?profil=solo&plan=nomad_solo' })).toEqual({ url: '/nomad/inscription', lang: null });
    expect(nomadLegacyRedirect({ pathname: '/telephony/start', search: '?profil=solo&plan=nomad_solo&utm_source=fb&price=price_1' })).toEqual({
      url: '/nomad/inscription?utm_source=fb&price=price_1',
      lang: null,
    });
  });

  it('CLOUD et TAAS inchangés : aucune redirection', () => {
    for (const loc of [
      { pathname: '/telephony' },
      { pathname: '/telephony/start', search: '?plan=accueil' },
      { pathname: '/telephony/start' },
      { pathname: '/telephony/app/poste' },
      { pathname: '/auth/signin' },
      { pathname: '/auth/signin', search: '?product=callcentre' },
      { pathname: '/auth/register-call-center', search: '?product=callcentre' },
      { pathname: '/en/telephony' },
      { pathname: '/en/taas' },
      { pathname: '/nomad' },
      { pathname: '/nomad/connexion' },
      { pathname: '/nomad/inscription' },
      { pathname: '/nomad/poste' },
      { pathname: '/' },
    ]) {
      expect(nomadLegacyRedirect(loc), `${loc.pathname}${loc.search ?? ''}`).toBeNull();
    }
  });

  it('aucune cible n’est elle-même redirigée (pas de boucle) ni sous /telephony', () => {
    const samples = [
      { pathname: '/telephony/nomad' },
      { pathname: '/en/telephony/nomad' },
      { pathname: '/en/nomad/poste' },
      { pathname: '/auth/signin', search: '?product=nomad' },
      { pathname: '/auth/register-nomad', search: '?product=nomad' },
      { pathname: '/telephony/start', search: '?profil=solo&plan=nomad_solo' },
    ];
    for (const loc of samples) {
      const t = nomadLegacyRedirect(loc)!;
      const u = new URL(t.url, 'https://harx.invalid');
      expect(u.pathname.startsWith('/nomad')).toBe(true);
      expect(nomadLegacyRedirect({ pathname: u.pathname, search: u.search, hash: u.hash })).toBeNull();
    }
  });
});

describe('relais et retour : /nomad/inscription est un écran d’inscription', () => {
  it('isRegisterPath reconnaît /nomad/inscription (CLOUD et TAAS inchangés)', () => {
    expect(isRegisterPath('/nomad/inscription')).toBe(true);
    expect(isRegisterPath('/nomad/inscription/')).toBe(true);
    expect(isRegisterPath('/auth/register-call-center')).toBe(true);
    for (const p of ['/nomad', '/nomad/connexion', '/nomad/poste']) expect(isRegisterPath(p)).toBe(false);
  });
});

describe('méta et indexation des adresses NOMAD', () => {
  it('/nomad : titre et canonique propres ; indexable', () => {
    const meta = resolvePageMeta('/nomad');
    expect(meta.title).toBe(NOMAD_TITLE);
    expect(meta.canonical).toBe('https://harx.ai/nomad');
    expect(isNoindexPath('/nomad')).toBe(false);
    expect(isNoindexPath('/nomad?pays=CA')).toBe(false);
  });

  it('/nomad/inscription indexable ; connexion et écrans du portail en noindex', () => {
    expect(isNoindexPath('/nomad/inscription')).toBe(false);
    for (const p of ['/nomad/connexion', '/nomad/mise-en-route', '/nomad/poste', ...NOMAD_PORTAL_SCREENS.map((s) => `/nomad/${s}`)]) {
      expect(isNoindexPath(p), p).toBe(true);
    }
  });

  it('CLOUD inchangé : /telephony indexable, /telephony/app en noindex', () => {
    expect(isNoindexPath('/telephony')).toBe(false);
    expect(isNoindexPath('/telephony/app/poste')).toBe(true);
    expect(isNoindexPath('/telephony/start')).toBe(true);
  });
});

describe('netlify.toml : redirections NOMAD côté serveur', () => {
  const toml = readFileSync(fileURLToPath(new URL('../netlify.toml', import.meta.url)), 'utf8');
  const block = toml.split('# BEGIN nomad-redirects')[1]?.split('# END nomad-redirects')[0] ?? '';
  const rules = block
    .split('[[redirects]]')
    .slice(1)
    .map((chunk) => ({
      from: /from = "([^"]+)"/.exec(chunk)![1],
      to: /to = "([^"]+)"/.exec(chunk)![1],
      status: Number(/status = (\d+)/.exec(chunk)![1]),
      force: /force = true/.test(chunk),
    }));

  it('301 forcées, mêmes cibles que la redirection côté navigateur', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      expect(r.status).toBe(301);
      expect(r.force).toBe(true);
      expect(r.to).toBe(nomadLegacyRedirect({ pathname: r.from })!.url);
    }
    expect(rules.map((r) => r.from)).toEqual(expect.arrayContaining(['/telephony/nomad', '/auth/register-nomad']));
  });

  it('les règles NOMAD passent avant les réécritures générales, et /nomad sert la page pré-rendue', () => {
    expect(toml.indexOf('# BEGIN nomad-redirects')).toBeLessThan(toml.indexOf('from = "/*"'));
    expect(toml).toMatch(/from = "\/nomad"\s+to = "\/nomad\/index\.html"\s+status = 200/);
    expect(toml.indexOf('to = "/nomad/index.html"')).toBeLessThan(toml.indexOf('from = "/*"'));
  });
});
