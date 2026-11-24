import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// Adresses NOMAD validées par le fondateur (24/11/2026) : tout le parcours NOMAD sous /nomad, jamais sous /telephony.
// /nomad et /nomad/<écran> montent l'application Téléphonie ; /nomad/connexion et /nomad/inscription, le module d'inscription.
// Les anciennes adresses sont remplacées avant tout montage. CLOUD (/telephony) inchangé.
// Micro-applications remplacées par des modules témoins (comme e2e/call-center-redirect.spec.ts).

const MF = ['auth', 'company', 'reps', 'home', 'callcenter'] as const;
const CORS = { 'access-control-allow-origin': '*' };

function stubEntry(name: string): string {
  return `<!doctype html><html><head></head><body><script>
    window[${JSON.stringify(name)}] = {
      bootstrap: async () => {},
      mount: async (props) => {
        var lang = localStorage.getItem('harxLangExplicit') === '1' ? localStorage.getItem('harxSiteLang') : null;
        window.top.__mounted = (window.top.__mounted || []).concat(${JSON.stringify(name)});
        props.container.innerHTML = '<div data-stub=${name} data-lang="' + lang + '">module ${name}</div>';
      },
      unmount: async (props) => { props.container.innerHTML = ''; },
    };
  </script></body></html>`;
}

async function setup(ctx: BrowserContext) {
  const requested: string[] = [];
  await ctx.route(/^http:\/\/mf-([a-z]+)\.test\//, (route) => {
    const name = /^http:\/\/mf-([a-z]+)\.test\//.exec(route.request().url())![1];
    requested.push(name);
    if (!MF.includes(name as (typeof MF)[number])) return route.abort();
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'text/html' }, body: stubEntry(name) });
  });
  await ctx.route(/(railway\.app|harx\.ai|googletagmanager|mouseflow|zohopublic|clarity\.ms|jsdelivr|netlify\.app)/, (route) => route.abort());
  return requested;
}

const path = (page: Page) => {
  const u = new URL(page.url());
  return u.pathname + u.search;
};
const portal = (page: Page) => page.locator('#container-callcenter [data-stub=callcenter]');
const auth = (page: Page) => page.locator('#container-auth [data-stub=auth]');

for (const p of ['/nomad', '/nomad/mise-en-route', '/nomad/poste', '/nomad/appels', '/nomad/faq']) {
  test(`${p} : application Téléphonie (portail NOMAD), sans module d'inscription`, async ({ context, page }) => {
    await setup(context);
    await page.goto(p);
    await expect(portal(page)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#container-callcenter')).toHaveClass(/harx-mf-active/);
    await expect(page.locator('#container-auth')).not.toHaveClass(/harx-mf-active/);
    expect(path(page)).toBe(p);
  });
}

for (const p of ['/nomad/connexion', '/nomad/inscription']) {
  test(`${p} : module d'inscription, sans application Téléphonie`, async ({ context, page }) => {
    await setup(context);
    await page.goto(p);
    await expect(auth(page)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#container-auth')).toHaveClass(/harx-mf-active/);
    await expect(page.locator('#container-callcenter')).not.toHaveClass(/harx-mf-active/);
    expect(await page.evaluate(() => (window as unknown as { __mounted?: string[] }).__mounted ?? [])).not.toContain('callcenter');
    await page.waitForTimeout(800);
    expect(path(page)).toBe(p);
  });
}

for (const [from, to, app] of [
  ['/telephony/nomad?pays=CA', '/nomad?pays=CA', 'callcenter'],
  ['/auth/signin?product=nomad', '/nomad/connexion', 'auth'],
  ['/auth/register-nomad?product=nomad', '/nomad/inscription', 'auth'],
  ['/auth/register-nomad', '/nomad/inscription', 'auth'],
  ['/telephony/start?profil=solo&plan=nomad_solo&utm_source=ads', '/nomad/inscription?utm_source=ads', 'auth'],
  ['/call-center/poste', '/nomad/poste', 'callcenter'],
] as const) {
  test(`ancienne adresse ${from} → ${to}`, async ({ context, page }) => {
    await setup(context);
    await page.goto(from);
    await expect(page.locator(`#container-${app} [data-stub=${app}]`)).toBeVisible({ timeout: 20_000 });
    expect(path(page)).toBe(to);
    await page.waitForTimeout(800);
    expect(path(page)).toBe(to);
  });
}

test('/en/nomad → /nomad, langue « en » mémorisée pour la page NOMAD', async ({ context, page }) => {
  await setup(context);
  await page.goto('/en/nomad');
  await expect(portal(page)).toHaveAttribute('data-lang', 'en', { timeout: 20_000 });
  expect(path(page)).toBe('/nomad');
  await expect(page.locator('#container-auth')).not.toHaveClass(/harx-mf-active/);
});

test('/fr/nomad/connexion → /nomad/connexion (module d’inscription), langue « fr » mémorisée', async ({ context, page }) => {
  await setup(context);
  await page.goto('/fr/nomad/connexion');
  await expect(auth(page)).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/nomad/connexion');
  expect(await page.evaluate(() => localStorage.getItem('harxSiteLang'))).toBe('fr');
});

test('navigation interne vers une ancienne adresse NOMAD : même redirection', async ({ context, page }) => {
  await setup(context);
  await page.goto('/reps');
  await expect(page.locator('#container-reps [data-stub=reps]')).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => {
    window.history.pushState({}, '', '/telephony/nomad');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 10_000 });
  await expect(portal(page)).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => {
    window.history.pushState({}, '', '/auth/signin?product=nomad');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL((u) => u.pathname === '/nomad/connexion', { timeout: 10_000 });
  await expect(auth(page)).toBeVisible({ timeout: 20_000 });
});

test('CLOUD inchangé : /telephony, /telephony/start?plan=accueil et /auth/signin?product=callcentre restent tels quels', async ({ context, page }) => {
  await setup(context);
  for (const [p, app] of [
    ['/telephony', 'callcenter'],
    ['/telephony/start?plan=accueil', 'callcenter'],
    ['/telephony/app/poste', 'callcenter'],
    ['/auth/signin?product=callcentre', 'auth'],
  ] as const) {
    await page.goto(p);
    await expect(page.locator(`#container-${app} [data-stub=${app}]`)).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(500);
    expect(path(page)).toBe(p);
  }
});

test('/nomad pré-rendu (robots) : méta anglaises, canonique, JSON-LD SoftwareApplication, indexable', async ({ request }) => {
  // Fichier servi pour /nomad par Netlify (réécriture 200 de netlify.toml) ; l'aperçu Vite ne connaît pas cette réécriture.
  const html = await (await request.get('/nomad/index.html')).text();
  expect(html).toContain('<title>HARX NOMAD: your phone number, voicemail and calls, anywhere in the world</title>');
  expect(html).toContain('<link rel="canonical" href="https://harx.ai/nomad" />');
  expect(html).toContain('<meta property="og:url" content="https://harx.ai/nomad" />');
  expect(html).toMatch(/<meta property="og:title" content="HARX NOMAD: your phone number/);
  expect(html).toContain('"@type":"SoftwareApplication"');
  expect(html).toContain('<meta name="robots" content="index,follow" />');
  expect(html).toContain('id="seo-snapshot-nomad" lang="en"');
});

for (const [locale, title, lang] of [
  ['en-US', 'HARX NOMAD: your phone number, voicemail and calls, anywhere in the world', 'en'],
  ['de-DE', 'HARX NOMAD: your phone number, voicemail and calls, anywhere in the world', 'en'],
  ['fr-FR', 'HARX NOMAD : votre numéro, votre répondeur et vos appels, partout dans le monde', 'fr'],
] as const) {
  test.describe(`/nomad pour un navigateur ${locale}`, () => {
    test.use({ locale });
    test(`titre « ${lang} », canonique /nomad, indexable`, async ({ context, page }) => {
      await setup(context);
      await page.goto('/nomad');
      await expect(portal(page)).toBeVisible({ timeout: 20_000 });
      await expect.poll(() => page.title()).toBe(title);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://harx.ai/nomad');
      expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe('index,follow');
      expect(await page.evaluate(() => document.documentElement.lang)).toBe(lang);
    });
  });
}

test('/nomad/inscription et /nomad/connexion : noindex', async ({ context, page }) => {
  await setup(context);
  for (const p of ['/nomad/inscription', '/nomad/connexion']) {
    await page.goto(p);
    await expect(auth(page)).toBeVisible({ timeout: 20_000 });
    await expect.poll(() => page.locator('meta[name="robots"]').getAttribute('content')).toBe('noindex,nofollow');
  }
});
