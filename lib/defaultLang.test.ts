import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveDefaultLang } from './defaultLang';

describe('langue par défaut du site : 4 langues gérées, l’anglais pour les autres (décision du fondateur)', () => {
  const r = (...browser: string[]) => resolveDefaultLang({ browser });
  it('cas de référence (le pays et le fuseau ne comptent pas)', () => {
    expect(r('en-US')).toBe('en'); // en-US en France
    expect(r('fr-FR')).toBe('fr');
    expect(r('ar')).toBe('ar'); // ar au Maroc
    expect(r('de-DE')).toBe('en'); // de-DE en France
    expect(r('de-DE', 'fr-FR')).toBe('fr');
    expect(r('de-DE', 'en')).toBe('en');
    expect(r('es-MX')).toBe('es');
    expect(r()).toBe('en'); // liste vide (robot)
    expect(r('', 'zz')).toBe('en');
  });
  it('index.html : même règle en ES5 (sans pays ni fuseau), anglais par défaut, page en anglais', () => {
    const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
    expect(html).toContain("(lang || 'en')");
    expect(html).not.toContain("(lang || 'fr')");
    expect(html).toContain('<html lang="en">');
    expect(html).not.toMatch(/FRENCH_TIME_ZONES|harxCountryLang|timeZone/);
    expect(html).toContain('if (SUPPORTED.indexOf(code) >= 0) { lang = code; break; }');
  });
  it('sitemap : x-default en anglais', () => {
    const xml = readFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), 'utf8');
    expect(xml).not.toMatch(/hreflang="x-default" href="https:\/\/harx\.ai\/fr/);
    expect(xml).toMatch(/hreflang="x-default" href="https:\/\/harx\.ai\/en"/);
  });
});
