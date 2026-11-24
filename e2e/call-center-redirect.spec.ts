import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// Arbitrage 12 : /call-center est retiré et redirigé vers /telephony.
// Les micro-applications sont remplacées par des modules témoins : on vérifie l'adresse finale,
// le module monté, et que l'ancien module `company` n'est jamais chargé depuis /call-center.

const MF = ['auth', 'company', 'reps', 'home', 'callcenter'] as const;
const CORS = { 'access-control-allow-origin': '*' };

function stubEntry(name: string): string {
  return `<!doctype html><html><head></head><body><script>
    window[${JSON.stringify(name)}] = {
      bootstrap: async () => {},
      mount: async (props) => {
        window.top.__mounted = (window.top.__mounted || []).concat(${JSON.stringify(name)});
        props.container.innerHTML = '<div data-stub=${name}>module ${name}</div>';
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
  // Aucun appel vers un vrai serveur HARX ni vers des scripts tiers pendant le test.
  await ctx.route(/(railway\.app|harx\.ai|googletagmanager|mouseflow|zohopublic|clarity\.ms|jsdelivr|netlify\.app)/, (route) => route.abort());
  return requested;
}

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /Maximum update depth/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

const path = (page: Page) => {
  const u = new URL(page.url());
  return u.pathname + u.search;
};

test('/call-center sans session : redirigé vers la page CLOUD /cloud (24/11/2026), sans boucle', async ({ context, page }) => {
  const requested = await setup(context);
  const errors = watchErrors(page);
  await page.goto('/call-center');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/cloud');
  expect(requested).not.toContain('company');
  expect(errors.filter((e) => /Maximum update depth/i.test(e))).toEqual([]);
  // L'adresse reste stable (pas de va-et-vient entre deux routes).
  await page.waitForTimeout(1500);
  expect(path(page)).toBe('/cloud');
});

test('/call-center avec une session simulée : sous-chemin gardé sous /telephony/app', async ({ context, page, baseURL }) => {
  await context.addCookies([
    { name: 'userId', value: 'a1b2c3d4e5f6a1b2c3d4e5f6', url: baseURL! },
    { name: 'companyId', value: 'c1c2c3c4c5c6c1c2c3c4c5c6', url: baseURL! },
  ]);
  await context.addInitScript(() => {
    try {
      localStorage.setItem('token', 'aaa.bbb.ccc');
      localStorage.setItem('userId', 'a1b2c3d4e5f6a1b2c3d4e5f6');
      localStorage.setItem('userType', 'call-center');
    } catch {
      /* ignore */
    }
  });
  const requested = await setup(context);
  const errors = watchErrors(page);

  await page.goto('/call-center/agents?from=mail');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/telephony/app/agents?from=mail');

  await page.goto('/call-center/rubrique-inconnue');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/telephony/app/dashboard');

  // Navigation interne (pushState) vers l'ancienne adresse : même redirection.
  await page.goto('/');
  await page.evaluate(() => {
    window.history.pushState({}, '', '/call-center/billing');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL('**/telephony/app/billing', { timeout: 10_000 });

  expect(requested).not.toContain('company');
  expect(errors.filter((e) => /Maximum update depth/i.test(e))).toEqual([]);
});

test('REPS, TAAS et entreprise ne sont pas touchés', async ({ context, page }) => {
  await setup(context);
  await page.goto('/reps');
  await expect(page.locator('#container-reps [data-stub=reps]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/reps');

  await page.goto('/taas');
  await expect(page.locator('#container-auth [data-stub=auth]')).toBeVisible({ timeout: 20_000 });
  // Le site ajoute le préfixe de langue (/fr, /en…) : comportement existant, inchangé.
  expect(path(page)).toMatch(/^(\/[a-z]{2})?\/taas$/);

  await page.goto('/company');
  await expect(page.locator('#container-company [data-stub=company]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/company');
});
