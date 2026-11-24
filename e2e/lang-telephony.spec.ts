import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// /:lang/telephony* (audit du 19/11, constat n° 3) : ces adresses montaient le module d'inscription, qui affichait
// sa page 404 de développeur. Elles doivent ouvrir l'application Téléphonie, sous /telephony*, dans la langue de l'adresse.
// Micro-applications remplacées par des modules témoins (comme e2e/call-center-redirect.spec.ts).

const MF = ['auth', 'company', 'reps', 'home', 'callcenter'] as const;
const CORS = { 'access-control-allow-origin': '*' };

function stubEntry(name: string): string {
  return `<!doctype html><html><head></head><body><script>
    window[${JSON.stringify(name)}] = {
      bootstrap: async () => {},
      mount: async (props) => {
        // Langue telle que l'application la lit au montage (src/i18n/lang.ts de v25_callcenter_front).
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

for (const [from, to, lang] of [
  // Page CLOUD : adresse /cloud (adresses CLOUD Receptionist du 24/11/2026), en un seul saut.
  ['/en/telephony', '/cloud', 'en'],
  // Page NOMAD : adresse NOMAD /nomad (24/11/2026).
  ['/en/telephony/nomad', '/nomad', 'en'],
  ['/fr/telephony', '/cloud', 'fr'],
  ['/es/telephony?situation=tpe', '/cloud?situation=tpe', 'es'],
  // Écrans connectés : toujours sous /telephony (l'offre n'est pas dans l'adresse ; le portail renvoie un compte Receptionist).
  ['/en/telephony/app/dashboard', '/telephony/app/dashboard', 'en'],
] as const) {
  test(`${from} : application Téléphonie sous ${to}, en « ${lang} », sans module d'inscription`, async ({ context, page }) => {
    const requested = await setup(context);
    await page.goto(from);
    const stub = page.locator('#container-callcenter [data-stub=callcenter]');
    await expect(stub).toBeVisible({ timeout: 20_000 });
    await expect(stub).toHaveAttribute('data-lang', lang);
    expect(path(page)).toBe(to);
    await expect(page.locator('#container-auth')).not.toHaveClass(/harx-mf-active/);
    expect(requested).not.toContain('company');
    await page.waitForTimeout(1000);
    expect(path(page)).toBe(to);
  });
}

test('navigation interne vers /en/telephony : même redirection', async ({ context, page }) => {
  await setup(context);
  await page.goto('/reps');
  await expect(page.locator('#container-reps [data-stub=reps]')).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => {
    window.history.pushState({}, '', '/en/telephony/nomad');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 10_000 });
  expect(path(page)).toBe('/nomad');
  expect(await page.evaluate(() => localStorage.getItem('harxSiteLang'))).toBe('en');
});

test('les autres pages préfixées restent servies par le module d’inscription', async ({ context, page }) => {
  await setup(context);
  await page.goto('/en/taas');
  await expect(page.locator('#container-auth [data-stub=auth]')).toBeVisible({ timeout: 20_000 });
  expect(path(page)).toBe('/en/taas');
});
