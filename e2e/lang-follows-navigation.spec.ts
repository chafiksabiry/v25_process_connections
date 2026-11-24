import { expect, test } from '@playwright/test';

// Constat du fondateur (21/11, production) : sur harx.ai/en, un clic sur CLOUD (/telephony) ou NOMAD (/telephony/nomad) ouvrait la
// Téléphonie en français sur un navigateur fr-FR. Les liens n'ont pas de préfixe de langue : c'est la langue mémorisée qui doit suivre.
// L'hôte la mémorise désormais lui-même depuis le préfixe de l'adresse ; ici, le module d'accueil témoin n'écrit RIEN (pire cas : clic
// avant son montage, ou module en échec), et la Téléphonie témoin lit la langue comme src/i18n/lang.ts de v25_callcenter_front.

test.use({ locale: 'fr-FR' });

const CORS = { 'access-control-allow-origin': '*' };
const stub = (name: string) => `<!doctype html><html><head></head><body><script>
  window[${JSON.stringify(name)}] = {
    bootstrap: async () => {},
    mount: async (props) => {
      var explicit = localStorage.getItem('harxLangExplicit') === '1' ? localStorage.getItem('harxSiteLang') : null;
      var device = (navigator.languages || [navigator.language])[0].slice(0, 2);
      props.container.innerHTML = '<div data-stub=${name} data-lang="' + (explicit || device) + '">module ${name}</div>';
    },
    unmount: async (props) => { props.container.innerHTML = ''; },
  };
</script></body></html>`;

test.beforeEach(async ({ context }) => {
  await context.route(/^http:\/\/mf-([a-z]+)\.test\//, (route) => {
    const name = /^http:\/\/mf-([a-z]+)\.test\//.exec(route.request().url())![1];
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'text/html' }, body: stub(name) });
  });
  await context.route(/(railway\.app|harx\.ai|googletagmanager|mouseflow|zohopublic|clarity\.ms|jsdelivr|netlify\.app)/, (route) => route.abort());
});

const go = (page: import('@playwright/test').Page, url: string) =>
  page.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate')); }, url);

test('/en → /telephony → /nomad (navigateur fr-FR) : la Téléphonie reste en anglais', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('#container-auth [data-stub=auth]')).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => [localStorage.getItem('harxSiteLang'), localStorage.getItem('harxLangExplicit')])).toEqual(['en', '1']);
  await go(page, '/telephony');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toHaveAttribute('data-lang', 'en', { timeout: 20_000 });
  await page.goto('/nomad');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toHaveAttribute('data-lang', 'en', { timeout: 20_000 });
  // Ancienne adresse de la page NOMAD : remplacée par /nomad, langue gardée.
  await page.goto('/telephony/nomad');
  await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 10_000 });
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toHaveAttribute('data-lang', 'en', { timeout: 20_000 });
});

test('drapeau de l’accueil (/fr → /en en navigation interne) : le choix suit vers /telephony', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.locator('#container-auth [data-stub=auth]')).toBeVisible({ timeout: 20_000 });
  await go(page, '/en');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('harxSiteLang'))).toBe('en');
  await page.goto('/telephony');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toHaveAttribute('data-lang', 'en', { timeout: 20_000 });
});

test('sans préfixe ni choix : la langue de l’appareil (fr) reste la règle', async ({ page }) => {
  await page.goto('/telephony');
  await expect(page.locator('#container-callcenter [data-stub=callcenter]')).toHaveAttribute('data-lang', 'fr', { timeout: 20_000 });
});
