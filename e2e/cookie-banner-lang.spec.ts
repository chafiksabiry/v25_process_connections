import { expect, test, type BrowserContext } from '@playwright/test';

// Bannière de consentement aux cookies : affichée dans la langue de la page (fr, en, es, ar).
// Les micro-applications sont remplacées par des modules témoins (comme dans call-center-redirect.spec.ts).

const CORS = { 'access-control-allow-origin': '*' };

function stubEntry(name: string): string {
  return `<!doctype html><html><head></head><body><script>
    window[${JSON.stringify(name)}] = {
      bootstrap: async () => {},
      mount: async (props) => { props.container.innerHTML = '<div data-stub=${name}>module ${name}</div>'; },
      unmount: async (props) => { props.container.innerHTML = ''; },
    };
  </script></body></html>`;
}

async function setup(ctx: BrowserContext, storage: Record<string, string> = {}) {
  await ctx.route(/^http:\/\/mf-([a-z]+)\.test\//, (route) => {
    const name = /^http:\/\/mf-([a-z]+)\.test\//.exec(route.request().url())![1];
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'text/html' }, body: stubEntry(name) });
  });
  await ctx.route(/(railway\.app|harx\.ai|googletagmanager|mouseflow|zohopublic|clarity\.ms|jsdelivr|netlify\.app|facebook|linkedin)/, (route) => route.abort());
  await ctx.addInitScript((entries) => {
    try {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  }, storage);
}

const EXPECTED = {
  fr: { title: 'Vos préférences de cookies', refuse: 'Tout refuser', customize: 'Personnaliser', accept: 'Tout accepter', save: 'Enregistrer mes choix', more: 'En savoir plus', dir: 'ltr' },
  en: { title: 'Your cookie preferences', refuse: 'Reject all', customize: 'Customise', accept: 'Accept all', save: 'Save my choices', more: 'Learn more', dir: 'ltr' },
  es: { title: 'Sus preferencias de cookies', refuse: 'Rechazar todo', customize: 'Personalizar', accept: 'Aceptar todo', save: 'Guardar mis preferencias', more: 'Más información', dir: 'ltr' },
  ar: { title: 'تفضيلاتك بشأن ملفات تعريف الارتباط', refuse: 'رفض الكل', customize: 'تخصيص', accept: 'قبول الكل', save: 'حفظ اختياراتي', more: 'اعرف المزيد', dir: 'rtl' },
} as const;

for (const lang of ['fr', 'en', 'es', 'ar'] as const) {
  test(`/${lang} : bannière et panneau « Personnaliser » en ${lang}`, async ({ context, page }) => {
    await setup(context);
    await page.goto(`/${lang}`);
    const e = EXPECTED[lang];
    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible({ timeout: 20_000 });
    await expect(banner).toHaveAttribute('aria-label', e.title);
    await expect(banner).toHaveAttribute('lang', lang);
    await expect(banner).toHaveAttribute('dir', e.dir);
    await expect(banner.getByRole('link', { name: e.more })).toHaveAttribute('href', `/${lang}/cookies`);
    await expect(banner.getByRole('button', { name: e.refuse })).toBeVisible();
    await expect(banner.getByRole('button', { name: e.accept })).toBeVisible();
    await banner.getByRole('button', { name: e.customize }).click();
    await expect(banner.getByRole('button', { name: e.save })).toBeVisible();
    await expect(banner.getByRole('checkbox')).toHaveCount(2);
    if (lang !== 'fr') await expect(banner).not.toContainText('Tout refuser');
  });
}

test('/telephony sans préfixe : suit la langue choisie sur le site, et un changement sans rechargement', async ({ context, page }) => {
  await setup(context, { harxLangExplicit: '1', harxSiteLang: 'en', i18nextLng: 'en' });
  await page.goto('/telephony');
  const banner = page.getByTestId('cookie-banner');
  await expect(banner).toHaveAttribute('aria-label', EXPECTED.en.title, { timeout: 20_000 });
  await expect(banner.getByRole('link', { name: EXPECTED.en.more })).toHaveAttribute('href', '/en/cookies');

  // Le sélecteur de langue enregistre le choix puis applique <html lang/dir> (sans recharger la page).
  await page.evaluate(() => {
    localStorage.setItem('harxSiteLang', 'ar');
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  });
  await expect(banner).toHaveAttribute('aria-label', EXPECTED.ar.title);
  await expect(banner).toHaveAttribute('dir', 'rtl');
});

test('le choix « Tout refuser » est inchangé : bannière fermée, consentement refusé enregistré', async ({ context, page }) => {
  await setup(context);
  await page.goto('/es');
  const banner = page.getByTestId('cookie-banner');
  await banner.getByRole('button', { name: EXPECTED.es.refuse }).click();
  await expect(banner).toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harx_cookie_consent') || 'null'));
  expect(stored).toMatchObject({ analytics: false, marketing: false });
});
