import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FRENCH_TIME_ZONES, resolveDefaultLang } from './defaultLang';

describe('langue par défaut du site (règle du fondateur : anglais, français pour les pays francophones)', () => {
  it('navigateur en-US → anglais ; fr-FR → français ; pays MA + navigateur ar → arabe', () => {
    expect(resolveDefaultLang({ browser: ['en-US'], timeZone: 'America/New_York' })).toBe('en');
    expect(resolveDefaultLang({ browser: ['fr-FR'], timeZone: 'America/New_York' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['ar-MA'], timeZone: 'Africa/Casablanca' })).toBe('ar');
  });
  it('pays francophone (société ou fuseau) : français si le navigateur n’est ni fr, ni es, ni ar', () => {
    expect(resolveDefaultLang({ browser: ['en-US'], timeZone: 'Africa/Casablanca' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['de-DE'], timeZone: 'Europe/Brussels' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['en-US'], countryLang: 'fr' })).toBe('fr');
    expect(resolveDefaultLang({ browser: ['es-ES'], timeZone: 'Europe/Paris' })).toBe('es');
  });
  it('espagnol et arabe seulement par l’appareil ; Canada et pays non francophones : anglais', () => {
    expect(resolveDefaultLang({ browser: ['en-GB'], timeZone: 'Europe/Madrid', countryLang: 'es' })).toBe('en');
    expect(resolveDefaultLang({ browser: ['en-CA'], timeZone: 'America/Toronto' })).toBe('en');
    expect(resolveDefaultLang({ browser: [] })).toBe('en');
  });
  it('index.html : redirection en anglais par défaut, même liste de fuseaux francophones, page en anglais', () => {
    const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
    expect(html).toContain("(lang || 'en')");
    expect(html).not.toContain("(lang || 'fr')");
    expect(html).toContain('<html lang="en">');
    const m = /var FRENCH_TIME_ZONES = (\[[^\]]*\]);/.exec(html);
    expect(m).not.toBeNull();
    expect(JSON.parse(m![1]!.replace(/'/g, '"'))).toEqual([...FRENCH_TIME_ZONES]);
  });
});
