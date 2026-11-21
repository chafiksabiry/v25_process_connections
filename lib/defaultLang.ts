import { SITE_LANGS, type SiteLang } from './langRoutes';

/**
 * Langue par défaut d'un visiteur sans préfixe d'URL ni choix mémorisé. Règle du fondateur (21/11/2026) : « English must be the native
 * language and French only for French-speaking countries » :
 *   1. langue du navigateur / de l'appareil si c'est le français, l'espagnol ou l'arabe (première langue gérée de `navigator.languages`) ;
 *   2. français si le pays est francophone : pays de la société connu de l'application Téléphonie (`harxCountryLang` = « fr »), sinon pays
 *      déduit du fuseau horaire du navigateur (`FRENCH_TIME_ZONES`). Maroc, Tunisie, Algérie : français sauf appareil en arabe (cas 1) ;
 *      Canada : anglais (Québec non détectable) ;
 *   3. sinon l'anglais.
 * Le même calcul est recopié en ES5 dans le script de redirection d'`index.html` (garde-fou : `defaultLang.test.ts`).
 */
export const FRENCH_TIME_ZONES: readonly string[] = [
  'Europe/Paris', 'Europe/Brussels', 'Europe/Zurich', 'Europe/Luxembourg', 'Europe/Monaco',
  'Africa/Dakar', 'Africa/Abidjan', 'Africa/Douala', 'Africa/Bamako', 'Africa/Ouagadougou', 'Africa/Niamey', 'Africa/Lome', 'Africa/Porto-Novo',
  'Africa/Conakry', 'Africa/Kinshasa', 'Africa/Lubumbashi', 'Africa/Brazzaville', 'Africa/Libreville', 'Indian/Antananarivo',
  'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca', 'Africa/El_Aaiun',
  'Indian/Reunion', 'Indian/Mayotte', 'America/Guadeloupe', 'America/Martinique', 'America/Cayenne', 'America/Miquelon', 'Pacific/Noumea', 'Pacific/Tahiti',
];

const toSiteLang = (raw: string | null | undefined): SiteLang | null => {
  const code = (raw || '').toLowerCase().slice(0, 2);
  return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : null;
};

export function resolveDefaultLang(input: { browser: readonly string[]; timeZone?: string | null; countryLang?: string | null }): SiteLang {
  let browser: SiteLang | null = null;
  for (const candidate of input.browser) {
    browser = toSiteLang(candidate);
    if (browser) break;
  }
  if (browser && browser !== 'en') return browser;
  if (toSiteLang(input.countryLang) === 'fr') return 'fr';
  if (FRENCH_TIME_ZONES.includes(String(input.timeZone ?? '').trim())) return 'fr';
  return 'en';
}

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}
