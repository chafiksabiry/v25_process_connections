import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FRENCH_TIME_ZONES, resolveDefaultLang } from './defaultLang';

describe('langue par défaut du site (règle du fondateur : anglais, français pour les pays francophones)', () => {
  it('langue de l’appareil d’abord : en-US + France → en ; fr-FR → fr ; ar + Maroc → ar ; de-DE + France → fr ; de-DE + Allemagne → en', () => {
    expect(resolveDefaultLang({ browser: ['en-US'], timeZone: 'Europe/Paris' })).toBe('en');
    expect(resolveDefaultLang({ browser: ['en-US'], countryLang: 'fr' })).toBe('en');
    expect(resolveDefaultLang({ browser: ['fr-FR'], timeZone: 'America/New_York' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['ar'], timeZone: 'Africa/Casablanca' })).toBe('ar');
    expect(resolveDefaultLang({ browser: ['de-DE'], timeZone: 'Europe/Paris' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['de-DE'], timeZone: 'Europe/Berlin' })).toBe('en');
  });
  it('autre langue : Maghreb et société francophone en français ; Canada et autres pays en anglais ; langue principale seulement', () => {
    expect(resolveDefaultLang({ browser: ['it-IT'], timeZone: 'Africa/Tunis' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['de-DE'], countryLang: 'fr' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['de-CA'], timeZone: 'America/Toronto' })).toBe('en');
    expect(resolveDefaultLang({ browser: ['de-DE', 'es-ES'], timeZone: 'Europe/Madrid', countryLang: 'es' })).toBe('en');
  });
  it('aucune langue lisible (robots) : anglais, même avec un fuseau francophone', () => {
    expect(resolveDefaultLang({ browser: [] })).toBe('en');
    expect(resolveDefaultLang({ browser: [''], timeZone: 'Europe/Paris' })).toBe('en');
  });
  it('index.html : redirection en anglais par défaut, même liste de fuseaux francophones, page en anglais', () => {
    const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
    expect(html).toContain("(lang || 'en')");
    expect(html).not.toContain("(lang || 'fr')");
    expect(html).toContain('<html lang="en">');
    const m = /var FRENCH_TIME_ZONES = (\[[^\]]*\]);/.exec(html);
    expect(m).not.toBeNull();
    expect(JSON.parse(m![1]!.replace(/'/g, '"'))).toEqual([...FRENCH_TIME_ZONES]);
    expect(html).toContain("if (SUPPORTED.indexOf(primary.slice(0, 2)) >= 0) lang = primary.slice(0, 2);");
    expect(html).toContain("else if (!primary) lang = 'en';");
  });
  it('sitemap : x-default en anglais', () => {
    const xml = readFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), 'utf8');
    expect(xml).not.toMatch(/hreflang="x-default" href="https:\/\/harx\.ai\/fr/);
    expect(xml).toMatch(/hreflang="x-default" href="https:\/\/harx\.ai\/en"/);
  });
});
