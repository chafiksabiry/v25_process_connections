import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decide, detectPlatform, excludedCountries, linksForCountry, pickLang, renderPage, storeLinks, withLogo } from './nomadApp';
import { APP_QR_SVG } from './nomadAppArt';

const IOS = 'https://apps.apple.com/app/id1234567890';
const PLAY = 'https://play.google.com/store/apps/details?id=ai.harx.nomad';
const APK = 'https://harx.ai/downloads/harx-nomad.apk';
const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
};

describe('harx.ai/app : lien court de l’app HARX Nomad', () => {
  const both = storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY });
  const none = storeLinks({});
  it('appareil', () => {
    expect(detectPlatform(UA.iphone)).toBe('ios');
    expect(detectPlatform(UA.ipad)).toBe('ios');
    expect(detectPlatform(UA.android)).toBe('android');
    expect(detectPlatform(UA.mac)).toBe('desktop');
    expect(detectPlatform(null)).toBe('desktop');
  });
  it('iPhone → App Store, Android → page (Google Play ou APK), ordinateur → page', () => {
    expect(decide('ios', both)).toEqual({ kind: 'redirect', location: IOS });
    expect(decide('android', both)).toEqual({ kind: 'page', platform: 'android' });
    expect(decide('desktop', both)).toEqual({ kind: 'page', platform: 'desktop' });
  });
  it('store non configuré : page, jamais de redirection ni de lien cassé', () => {
    expect(storeLinks({ NOMAD_APP_STORE_URL: '', NOMAD_PLAY_STORE_URL: 'pas-un-lien' })).toEqual({ ios: null, android: null, apk: null });
    expect(decide('ios', none)).toEqual({ kind: 'page', platform: 'ios' });
    expect(decide('ios', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }))).toEqual({ kind: 'page', platform: 'ios' });
    const html = renderPage('fr', 'ios', none);
    expect(html).toContain(withLogo('L’app HARX Nomad n’est pas encore disponible pour votre téléphone.'));
    expect(html).not.toMatch(/class="badge"/);
  });
  it('page ordinateur : les boutons configurés, échappés', () => {
    const html = renderPage('fr', 'desktop', both);
    expect(html).toContain(`href="${IOS}"`);
    expect(html).toContain(`href="${PLAY}"`);
    expect(html).toContain('harx.ai/app');
    const onlyPlay = renderPage('en', 'desktop', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }));
    expect(onlyPlay).not.toContain('data-store="ios"');
    expect(onlyPlay).not.toMatch(/[Ss]oon/);
    expect(renderPage('fr', 'desktop', { ios: 'https://x/"><script>', android: null, apk: null })).not.toContain('"><script>');
  });
  it('un seul store renseigné : le téléphone ne voit que le sien (iPhone avec seul Google Play : « pas encore disponible », jamais « bientôt »)', () => {
    const onlyPlay = storeLinks({ NOMAD_PLAY_STORE_URL: PLAY });
    expect(decide('android', onlyPlay)).toEqual({ kind: 'page', platform: 'android' });
    const iphone = renderPage('fr', 'ios', onlyPlay);
    expect(iphone).toContain(withLogo('L’app HARX Nomad n’est pas encore disponible pour votre téléphone.'));
    expect(iphone).not.toMatch(/[Bb]ientôt/);
    expect(iphone).not.toContain('data-store="android"');
    expect(iphone).not.toContain(PLAY);
    const android = renderPage('en', 'android', storeLinks({ NOMAD_APP_STORE_URL: IOS }));
    expect(android).toContain(withLogo('The HARX Nomad app is not yet available for your phone.'));
    expect(android).not.toMatch(/[Ss]oon/);
    expect(android).not.toContain('data-store="ios"');
  });
  it('iPadOS (UA de Mac) : script maxTouchPoints vers l’App Store, ou « pas encore disponible »', () => {
    const desk = renderPage('fr', 'desktop', storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY }));
    expect(desk).toMatch(/navigator\.maxTouchPoints>1/);
    expect(desk).toContain(`data-ios="${IOS}"`);
    const deskPlay = renderPage('fr', 'desktop', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }));
    expect(deskPlay).toContain('data-ios=""');
    expect(deskPlay).toContain(`<div data-ipad hidden><p class="lead">${withLogo('L’app HARX Nomad n’est pas encore disponible pour votre téléphone.')}</p></div>`);
    expect(renderPage('fr', 'ios', storeLinks({}))).not.toMatch(/maxTouchPoints/);
  });
  it('langues fr / en / es / ar (arabe de droite à gauche), français par défaut', () => {
    expect(pickLang('en-US,en;q=0.9')).toBe('en');
    expect(pickLang('de-DE,es;q=0.8')).toBe('es');
    expect(pickLang('')).toBe('fr');
    expect(renderPage('ar', 'desktop', none)).toContain('dir="rtl"');
  });
  it('aucun lien de store écrit en dur ; la fonction de bord sert /app', () => {
    expect(readFileSync(join(__dirname, 'nomadApp.ts'), 'utf8')).not.toMatch(/apps\.apple\.com|play\.google\.com/);
    const fn = readFileSync(join(__dirname, '..', 'netlify', 'edge-functions', 'nomad-app.ts'), 'utf8');
    expect(fn).toMatch(/path: \['\/app', '\/app\/'\]/);
    expect(fn).toMatch(/NOMAD_APP_STORE_URL/);
    expect(fn).toMatch(/NOMAD_PLAY_STORE_URL/);
  });
  it('Android : Google Play et « Télécharger directement (APK) » avec sa mention ; un choix sans lien est masqué', () => {
    const all = storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY, NOMAD_APK_URL: APK });
    const html = renderPage('fr', 'android', all);
    expect(html).toContain(`data-store="android" href="${PLAY}"`);
    expect(html).toContain(`data-store="apk" href="${APK}"`);
    expect(html).toContain('Télécharger directement (APK)');
    expect(html).toContain('Autorisez l’installation d’apps hors Play Store sur votre téléphone.');
    expect(html).not.toContain('data-store="ios"');
    expect(html).toContain('data-stores="android,apk"');
    const apkOnly = renderPage('en', 'android', storeLinks({ NOMAD_APK_URL: APK }));
    expect(apkOnly).not.toContain('data-store="android"');
    expect(apkOnly).toContain('Download directly (APK)');
    const playOnly = renderPage('es', 'android', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }));
    expect(playOnly).not.toContain('data-store="apk"');
    expect(storeLinks({ NOMAD_APK_URL: 'http://harx.ai/x.apk' }).apk).toBeNull();
  });
  it('ordinateur : QR code de harx.ai/app et les trois choix ; logo NOMAD ; textes traduits', () => {
    const all = storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY, NOMAD_APK_URL: APK });
    const html = renderPage('fr', 'desktop', all);
    expect(html).toContain('data-qr="https://harx.ai/app"');
    expect(html).toContain(APP_QR_SVG);
    expect(html).toContain('data-stores="ios,android,apk"');
    expect(html).toContain('class="nomad"');
    expect(html).not.toContain('Bientôt');
    for (const [l, apk] of [['en', 'Download directly (APK)'], ['es', 'Descargar directamente (APK)'], ['ar', 'التنزيل المباشر (APK)']] as const) expect(renderPage(l, 'desktop', all)).toContain(apk);
    expect(renderPage('fr', 'desktop', none)).not.toContain('data-qr');
  });
  it('la fonction de bord lit NOMAD_APK_URL', () => {
    expect(readFileSync(join(__dirname, '..', 'netlify', 'edge-functions', 'nomad-app.ts'), 'utf8')).toMatch(/NOMAD_APK_URL/);
  });
  it('App Store pas encore disponible dans l’UE : pays exclus (Netlify geo), ni redirection ni bouton App Store ; Google Play et l’APK restent', () => {
    const all = storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY, NOMAD_APK_URL: APK });
    const EU = excludedCountries('FR, de ,IT,zz9');
    expect(EU).toEqual(['FR', 'DE', 'IT']);
    expect(linksForCountry(all, EU, 'US')).toEqual(all);
    const fr = linksForCountry(all, EU, 'FR');
    expect(fr.ios).toBeNull();
    expect(linksForCountry(all, EU, undefined).ios).toBeNull();
    expect(linksForCountry(all, [], undefined)).toEqual(all);
    expect(decide('ios', fr)).toEqual({ kind: 'page', platform: 'ios' });
    const desk = renderPage('fr', 'desktop', fr);
    expect(desk).not.toContain('data-store="ios"');
    expect(desk).toContain('data-stores="android,apk"');
    expect(desk).toContain('data-ios=""');
    expect(renderPage('fr', 'ios', fr)).not.toContain('apps.apple.com');
    const fn = readFileSync(join(__dirname, '..', 'netlify', 'edge-functions', 'nomad-app.ts'), 'utf8');
    expect(fn).toMatch(/NOMAD_APP_STORE_EXCLUDED_COUNTRIES/);
    expect(fn).toMatch(/context\?\.geo\?\.country\?\.code/);
  });
  it('jamais « bientôt » (4 langues, toutes les combinaisons)', () => {
    const combos = [{}, { NOMAD_APP_STORE_URL: IOS }, { NOMAD_PLAY_STORE_URL: PLAY }, { NOMAD_APK_URL: APK }];
    for (const l of ['fr', 'en', 'es', 'ar'] as const) for (const p of ['ios', 'android', 'desktop'] as const) for (const c of combos) {
      expect(renderPage(l, p, storeLinks(c))).not.toMatch(/[Bb]ientôt|[Ss]oon|[Pp]róximamente|قريب/);
    }
  });
  it('NOMAD toujours en logo : aucun « Nomad » écrit dans la page (hors titre de l’onglet et texte pour lecteur d’écran), 4 langues', () => {
    const all = storeLinks({ NOMAD_APP_STORE_URL: IOS, NOMAD_PLAY_STORE_URL: PLAY, NOMAD_APK_URL: APK });
    for (const l of ['fr', 'en', 'es', 'ar'] as const) for (const p of ['ios', 'android', 'desktop'] as const) for (const links of [all, storeLinks({})]) {
      const html = renderPage(l, p, links);
      const body = html.slice(html.indexOf('<body>')).replace(/<span class="sr">Nomad<\/span>/g, '').replace(/<[^>]+>/g, ' ');
      expect(body).not.toMatch(/Nomad/i);
      expect(html).toContain('class="nomadi"');
    }
  });
});
