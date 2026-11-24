import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// Adresses CLOUD Receptionist validées par le fondateur (24/11/2026, « ok ») : /cloud, /cloud/receptionist, /cloud/receptionist/inscription
// et /cloud/receptionist/<écran> montent l'application Téléphonie ; /cloud/receptionist/connexion et /cloud/receptionist/inscription/compte,
// le module d'inscription. Les anciennes entrées sont remplacées avant tout montage (la 301 Netlify n'existe pas dans l'aperçu Vite).
// NOMAD d'abord ; Entreprise, Contact Centre et la connexion commune des offres CLOUD inchangés.
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

for (const p of ['/cloud', '/cloud/receptionist', '/cloud/receptionist/inscription', '/cloud/receptionist/mise-en-route', '/cloud/receptionist/tableau-de-bord', '/cloud/receptionist/facturation?payment=success']) {
  test(`${p} : application Téléphonie, sans module d'inscription`, async ({ context, page }) => {
    await setup(context);
    await page.goto(p);
    await expect(portal(page)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#container-callcenter')).toHaveClass(/harx-mf-active/);
    await expect(page.locator('#container-auth')).not.toHaveClass(/harx-mf-active/);
    expect(path(page)).toBe(p);
  });
}

for (const p of ['/cloud/receptionist/connexion', '/cloud/receptionist/inscription/compte']) {
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
  ['/telephony', '/cloud', 'callcenter'],
  ['/telephony/', '/cloud', 'callcenter'],
  ['/telephony/start?plan=accueil&price=price_abc&utm_source=ads', '/cloud/receptionist/inscription?price=price_abc&utm_source=ads', 'callcenter'],
  ['/telephony/start', '/cloud', 'callcenter'],
  ['/auth/signin?product=callcentre&plan=accueil', '/cloud/receptionist/connexion', 'auth'],
  ['/fr/telephony', '/cloud', 'callcenter'],
  ['/en/cloud/receptionist', '/cloud/receptionist', 'callcenter'],
  ['/call-center', '/cloud', 'callcenter'],
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

test('NOMAD d’abord : /telephony/start?profil=solo… reste /nomad/inscription, /telephony/nomad reste /nomad', async ({ context, page }) => {
  await setup(context);
  for (const [p, to, app] of [
    ['/telephony/start?profil=solo&plan=nomad_solo', '/nomad/inscription', 'auth'],
    ['/telephony/nomad', '/nomad', 'callcenter'],
  ] as const) {
    await page.goto(p);
    await expect(page.locator(`#container-${app} [data-stub=${app}]`)).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(500);
    expect(path(page)).toBe(to);
  }
});

test('Entreprise, Contact Centre, écrans /telephony/app et connexion commune des offres CLOUD : inchangés', async ({ context, page }) => {
  await setup(context);
  for (const [p, app] of [
    ['/telephony/start?plan=full_scope', 'callcenter'],
    ['/telephony/cloud/entreprise', 'callcenter'],
    ['/telephony/app/dashboard', 'callcenter'],
    ['/telephony/onboarding?session_id=cs_1', 'callcenter'],
    ['/auth/signin?product=callcentre', 'auth'],
  ] as const) {
    await page.goto(p);
    await expect(page.locator(`#container-${app} [data-stub=${app}]`)).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(500);
    expect(path(page)).toBe(p);
  }
});

test('navigation interne vers une ancienne entrée Receptionist : même redirection', async ({ context, page }) => {
  await setup(context);
  await page.goto('/reps');
  await expect(page.locator('#container-reps [data-stub=reps]')).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => {
    window.history.pushState({}, '', '/telephony');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL((u) => u.pathname === '/cloud', { timeout: 10_000 });
  await expect(portal(page)).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => {
    window.history.pushState({}, '', '/auth/signin?product=callcentre&plan=accueil');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL((u) => u.pathname === '/cloud/receptionist/connexion', { timeout: 10_000 });
  await expect(auth(page)).toBeVisible({ timeout: 20_000 });
});

for (const [file, title, canonical] of [
  ['/cloud/index.html', 'HARX CLOUD: Telephony In The Cloud for your company and your teams — Receptionist, Entreprise, Contact Centre', 'https://harx.ai/cloud'],
  ['/cloud/receptionist/index.html', 'HARX CLOUD Receptionist: every call answered, handled and called back, even when you’re away', 'https://harx.ai/cloud/receptionist'],
] as const) {
  test(`${file} pré-rendu (robots) : méta anglaises, canonique`, async ({ request }) => {
    // Fichier servi par Netlify (réécriture 200 de netlify.toml) ; l'aperçu Vite ne connaît pas cette réécriture.
    const html = await (await request.get(file)).text();
    expect(html).toContain(`<title>${title}</title>`);
    expect(html).toContain(`<link rel="canonical" href="${canonical}" />`);
    expect(html).toContain('lang="en"');
    expect(html).not.toMatch(/noindex/);
  });
}
