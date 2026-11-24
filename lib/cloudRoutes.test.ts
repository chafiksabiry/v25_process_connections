import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CLOUD_RECEPTIONIST_SCREENS,
  cloudLegacyRedirect,
  isCloudAuthPath,
  isCloudPortalPath,
  isCloudReceptionistScreen,
  isLangCloudPath,
} from './cloudRoutes';
import { nomadLegacyRedirect } from './nomadRoutes';
import { langTelephonyRedirect } from './langTelephonyRedirect';
import { compactWhatsAppFor } from './whatsappPlacement';
import { CLOUD_META, CLOUD_RECEPTIONIST_META, isNoindexPath, resolvePageMeta } from './tracking/pageMeta';

// Adresses CLOUD Receptionist validées par le fondateur (24/11/2026, « ok ») : offre et produit dans l'adresse, jamais « telephony ».

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

/** Ordre de main.tsx : NOMAD d'abord, puis CLOUD, puis /:lang/telephony*. */
const hostRewrite = (pathname: string, search = '', hash = ''): string | null => {
  const loc = { pathname, search, hash };
  return nomadLegacyRedirect(loc)?.url ?? cloudLegacyRedirect(loc)?.url ?? langTelephonyRedirect(loc)?.url ?? null;
};

describe('répartition des adresses /cloud entre les applications', () => {
  it('connexion et étape 2 de l’inscription Receptionist : module d’inscription', () => {
    for (const p of ['/cloud/receptionist/connexion', '/cloud/receptionist/inscription/compte', '/cloud/receptionist/connexion/']) {
      expect(isCloudAuthPath(p), p).toBe(true);
      expect(isCloudPortalPath(p), p).toBe(false);
    }
  });
  it('page CLOUD, page de l’offre, étape 1 et écrans du portail : application Téléphonie', () => {
    for (const p of ['/cloud', '/cloud/', '/cloud/receptionist', '/cloud/receptionist/inscription', ...CLOUD_RECEPTIONIST_SCREENS.map((s) => `/cloud/receptionist/${s}`), '/cloud/receptionist/appels/rapport']) {
      expect(isCloudPortalPath(p), p).toBe(true);
      expect(isCloudAuthPath(p), p).toBe(false);
    }
  });
  it('hors /cloud : rien (NOMAD, /telephony, /cloudy)', () => {
    for (const p of ['/nomad', '/telephony', '/telephony/app/dashboard', '/cloudy', '/auth/signin']) expect(isCloudPortalPath(p) || isCloudAuthPath(p), p).toBe(false);
    expect(isLangCloudPath('/en/cloud')).toBe(true);
    expect(isLangCloudPath('/en/cloud/receptionist/connexion')).toBe(true);
    expect(isLangCloudPath('/en/telephony')).toBe(false);
  });
  it('main.tsx et App.tsx montent l’application Téléphonie sur /cloud*, le module d’inscription sur la connexion et l’étape 2', () => {
    const main = read('../main.tsx');
    expect(main).toMatch(/isNomadPortalPath\(location\.pathname\) \|\| isCloudPortalPath\(location\.pathname\)/);
    expect(main).toMatch(/isCloudAuthPath\(p\) \|\|/);
    expect(main.indexOf('nomadLegacyRedirect(window.location)')).toBeLessThan(main.indexOf('cloudLegacyRedirect(window.location)'));
    expect(main.indexOf('cloudLegacyRedirect(window.location)')).toBeLessThan(main.indexOf('langTelephonyRedirect(window.location)'));
    const app = read('../App.tsx');
    expect(app).toMatch(/isCloudPortalPath\(pathname\)/);
    expect(app).toMatch(/isCloudAuthPath\(pathname\)/);
    expect(app).toMatch(/<CloudLegacyRedirect \/>/);
  });
});

describe('anciennes adresses du parcours Receptionist (remplacées avant montage)', () => {
  it('page CLOUD et page de l’offre (aussi avec préfixe de langue, en un seul saut)', () => {
    expect(hostRewrite('/telephony')).toBe('/cloud');
    expect(hostRewrite('/telephony/')).toBe('/cloud');
    expect(hostRewrite('/telephony/', '?utm_source=x')).toBe('/cloud?utm_source=x');
    expect(hostRewrite('/fr/telephony')).toBe('/cloud');
    expect(cloudLegacyRedirect({ pathname: '/en/telephony' })).toEqual({ url: '/cloud', lang: 'en' });
    expect(hostRewrite('/telephony/cloud/receptionist')).toBe('/cloud/receptionist');
    expect(hostRewrite('/es/telephony/cloud/receptionist/')).toBe('/cloud/receptionist');
    expect(cloudLegacyRedirect({ pathname: '/ar/cloud/receptionist' })).toEqual({ url: '/cloud/receptionist', lang: 'ar' });
  });
  it('étape 1 : /telephony/start?plan=accueil[&price=…] -> /cloud/receptionist/inscription (prix, utm et ancre gardés)', () => {
    expect(hostRewrite('/telephony/start', '?plan=accueil')).toBe('/cloud/receptionist/inscription');
    expect(hostRewrite('/telephony/start', '?plan=accueil&price=price_abc&utm_source=g', '#x')).toBe('/cloud/receptionist/inscription?price=price_abc&utm_source=g#x');
  });
  it('entrée commune sans offre : /telephony/start -> /cloud (choisir une offre)', () => {
    expect(hostRewrite('/telephony/start')).toBe('/cloud');
    expect(hostRewrite('/telephony/start', '?utm_source=g')).toBe('/cloud?utm_source=g');
  });
  it('connexion venue de Receptionist -> /cloud/receptionist/connexion ; étape 2 -> /cloud/receptionist/inscription/compte', () => {
    expect(hostRewrite('/auth/signin', '?product=callcentre&plan=accueil')).toBe('/cloud/receptionist/connexion');
    expect(hostRewrite('/auth/signin', '?product=callcentre&plan=accueil&audience=team')).toBe('/cloud/receptionist/connexion?audience=team');
    expect(hostRewrite('/auth/register-call-center', '?product=callcentre&plan=accueil&utm_source=g')).toBe('/cloud/receptionist/inscription/compte?utm_source=g');
  });
  it('NOMAD d’abord : /telephony/nomad, /telephony/start?profil=solo… et /auth/signin?product=nomad restent des adresses NOMAD', () => {
    expect(hostRewrite('/telephony/nomad')).toBe('/nomad');
    expect(hostRewrite('/telephony/start', '?profil=solo&plan=nomad_solo')).toBe('/nomad/inscription');
    expect(hostRewrite('/telephony/start', '?profil=solo&plan=accueil')).toBe('/nomad/inscription');
    expect(hostRewrite('/auth/signin', '?product=nomad')).toBe('/nomad/connexion');
    expect(cloudLegacyRedirect({ pathname: '/telephony/start', search: '?profil=solo' })).toBeNull();
  });
  it('Entreprise, Contact Centre et la connexion commune des offres CLOUD : inchangés', () => {
    for (const [p, q] of [
      ['/telephony/start', '?plan=full_scope'],
      ['/telephony/start', '?plan=multi_clients'],
      ['/telephony/cloud/entreprise', ''],
      ['/telephony/cloud/contact-centre', ''],
      ['/telephony/app/dashboard', ''],
      ['/telephony/onboarding', '?session_id=cs_1'],
      ['/auth/signin', '?product=callcentre'],
      ['/auth/register-call-center', '?product=callcentre'],
      ['/telephony/faq', ''],
    ] as const) expect(cloudLegacyRedirect({ pathname: p, search: q }), `${p}${q}`).toBeNull();
    // /:lang/telephony/app/... : la règle de langue existante (vers /telephony/app/...), inchangée.
    expect(hostRewrite('/en/telephony/app/billing', '?x=1')).toBe('/telephony/app/billing?x=1');
  });
  it('aucune cible n’est une ancienne adresse : pas de boucle', () => {
    const samples: Array<[string, string]> = [['/telephony', ''], ['/telephony/cloud/receptionist', ''], ['/telephony/start', '?plan=accueil'], ['/telephony/start', ''], ['/auth/signin', '?product=callcentre&plan=accueil'], ['/fr/cloud', '']];
    for (const [p, q] of samples) {
      const url = new URL(cloudLegacyRedirect({ pathname: p, search: q })!.url, 'https://harx.ai');
      expect(cloudLegacyRedirect({ pathname: url.pathname, search: url.search }), p).toBeNull();
      expect(nomadLegacyRedirect({ pathname: url.pathname, search: url.search }), p).toBeNull();
    }
  });
});

describe('netlify.toml : 301 des anciennes adresses reconnues au chemin, pré-rendu de /cloud', () => {
  const toml = read('../netlify.toml');
  const block = toml.split('# BEGIN cloud-redirects')[1]?.split('# END cloud-redirects')[0] ?? '';
  const rules = block.split('[[redirects]]').slice(1).map((c) => ({ from: /from = "([^"]+)"/.exec(c)![1], to: /to = "([^"]+)"/.exec(c)![1], status: Number(/status = (\d+)/.exec(c)![1]), force: /force = true/.test(c) }));
  it('301 forcées : /telephony, /telephony/ -> /cloud ; /telephony/cloud/receptionist(/) -> /cloud/receptionist', () => {
    expect(rules).toEqual([
      { from: '/telephony', to: '/cloud', status: 301, force: true },
      { from: '/telephony/', to: '/cloud', status: 301, force: true },
      { from: '/telephony/cloud/receptionist', to: '/cloud/receptionist', status: 301, force: true },
      { from: '/telephony/cloud/receptionist/', to: '/cloud/receptionist', status: 301, force: true },
    ]);
  });
  it('après les règles NOMAD, avant la réécriture générale ; /cloud et /cloud/receptionist servent leur page pré-rendue', () => {
    expect(toml.indexOf('# END nomad-redirects')).toBeLessThan(toml.indexOf('# BEGIN cloud-redirects'));
    expect(toml.indexOf('# END cloud-redirects')).toBeLessThan(toml.indexOf('from = "/*"'));
    expect(toml).toMatch(/from = "\/cloud"\s+to = "\/cloud\/index\.html"\s+status = 200/);
    expect(toml).toMatch(/from = "\/cloud\/receptionist"\s+to = "\/cloud\/receptionist\/index\.html"\s+status = 200/);
    expect(toml).not.toMatch(/to = "\/telephony\/index\.html"/);
    // /callcentre et /call-center (racines) : directement /cloud, sans chaîne de 301.
    expect(toml).toMatch(/from = "\/callcentre"\s+to = "\/cloud"/);
    expect(toml).toMatch(/from = "\/call-center"\s+to = "\/cloud"/);
  });
});

describe('référencement : /cloud et /cloud/receptionist (méta en anglais), le reste du parcours en noindex', () => {
  it('méta et adresse canonique', () => {
    expect(resolvePageMeta('/cloud')).toMatchObject({ title: CLOUD_META.title, canonical: 'https://harx.ai/cloud', lang: 'en' });
    expect(resolvePageMeta('/cloud/receptionist')).toMatchObject({ title: CLOUD_RECEPTIONIST_META.title, canonical: 'https://harx.ai/cloud/receptionist', lang: 'en' });
    expect(CLOUD_META.title.startsWith('HARX CLOUD')).toBe(true);
    expect(CLOUD_RECEPTIONIST_META.title.startsWith('HARX CLOUD Receptionist')).toBe(true);
  });
  it('indexables : /cloud et /cloud/receptionist seulement', () => {
    expect(isNoindexPath('/cloud')).toBe(false);
    expect(isNoindexPath('/cloud/receptionist')).toBe(false);
    for (const p of ['/cloud/receptionist/inscription', '/cloud/receptionist/inscription/compte', '/cloud/receptionist/connexion', ...CLOUD_RECEPTIONIST_SCREENS.map((s) => `/cloud/receptionist/${s}`)]) expect(isNoindexPath(p), p).toBe(true);
  });
  it('le pré-rendu (vite.config.ts) reprend les mêmes titres et descriptions anglais, sans prix', () => {
    const vite = read('../vite.config.ts');
    for (const m of [CLOUD_META, CLOUD_RECEPTIONIST_META]) {
      expect(vite).toContain(`'${m.title}'`);
      expect(vite).toContain(`'${m.description}'`);
    }
    expect(vite).toMatch(/page\('cloud', /);
    expect(vite).toMatch(/page\('cloud\/receptionist', /);
    expect(vite).not.toMatch(/page\('telephony'/);
    expect(vite).not.toMatch(/'@type': 'Offer'|price:/);
  });
  it('sitemap, robots.txt, llms.txt', () => {
    const xml = read('../public/sitemap.xml');
    expect(xml).toMatch(/<loc>https:\/\/harx\.ai\/cloud<\/loc>\s*<lastmod>/);
    expect(xml).toMatch(/<loc>https:\/\/harx\.ai\/cloud\/receptionist<\/loc>\s*<lastmod>/);
    expect(xml).not.toMatch(/harx\.ai\/telephony</);
    const lines = read('../public/robots.txt').split('\n').map((l) => l.trim());
    for (const p of ['/cloud/receptionist/connexion', '/cloud/receptionist/inscription/compte', ...CLOUD_RECEPTIONIST_SCREENS.map((s) => `/cloud/receptionist/${s}`)]) expect(lines, p).toContain(`Disallow: ${p}`);
    for (const p of ['/cloud', '/cloud/receptionist', '/cloud/receptionist/inscription']) expect(lines, p).not.toContain(`Disallow: ${p}`);
    const llms = read('../public/llms.txt');
    expect(llms).toContain('(https://harx.ai/cloud)');
    expect(llms).toContain('(https://harx.ai/cloud/receptionist)');
    expect(llms).not.toContain('harx.ai/telephony');
  });
});

describe('bouton WhatsApp compact dans les écrans du portail Receptionist', () => {
  it('pastille ronde sur /cloud/receptionist/<écran>', () => {
    for (const s of CLOUD_RECEPTIONIST_SCREENS) expect(compactWhatsAppFor(`/cloud/receptionist/${s}`), s).toBe(true);
    expect(compactWhatsAppFor('/cloud/receptionist/appels/rapport')).toBe(true);
    expect(isCloudReceptionistScreen('/cloud/receptionist/facturation')).toBe(true);
  });
  it('libellé visible sur la page CLOUD, la page de l’offre, l’inscription et la connexion', () => {
    for (const p of ['/cloud', '/cloud/receptionist', '/cloud/receptionist/inscription', '/cloud/receptionist/inscription/compte', '/cloud/receptionist/connexion']) expect(compactWhatsAppFor(p), p).toBe(false);
  });
});
