import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decide, detectPlatform, pickLang, renderPage, storeLinks } from './nomadApp';

const IOS = 'https://apps.apple.com/app/id1234567890';
const PLAY = 'https://play.google.com/store/apps/details?id=ai.harx.nomad';
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
  it('iPhone → App Store, Android → Google Play, ordinateur → page', () => {
    expect(decide('ios', both)).toEqual({ kind: 'redirect', location: IOS });
    expect(decide('android', both)).toEqual({ kind: 'redirect', location: PLAY });
    expect(decide('desktop', both)).toEqual({ kind: 'page', platform: 'desktop' });
  });
  it('store non configuré : page, jamais de redirection ni de lien cassé', () => {
    expect(storeLinks({ NOMAD_APP_STORE_URL: '', NOMAD_PLAY_STORE_URL: 'pas-un-lien' })).toEqual({ ios: null, android: null });
    expect(decide('ios', none)).toEqual({ kind: 'page', platform: 'ios' });
    expect(decide('ios', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }))).toEqual({ kind: 'page', platform: 'ios' });
    const html = renderPage('fr', 'ios', none);
    expect(html).toContain('L’application arrive bientôt sur l’App Store et Google Play.');
    expect(html).not.toMatch(/class="badge"/);
  });
  it('page ordinateur : les boutons configurés, échappés', () => {
    const html = renderPage('fr', 'desktop', both);
    expect(html).toContain(`href="${IOS}"`);
    expect(html).toContain(`href="${PLAY}"`);
    expect(html).toContain('harx.ai/app');
    const onlyPlay = renderPage('en', 'desktop', storeLinks({ NOMAD_PLAY_STORE_URL: PLAY }));
    expect(onlyPlay).not.toContain('data-store="ios"');
    expect(onlyPlay).toContain('Coming soon to the App Store.');
    expect(renderPage('fr', 'desktop', { ios: 'https://x/"><script>', android: null })).not.toContain('"><script>');
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
});
