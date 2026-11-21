import { SITE_LANGS, type SiteLang } from './langRoutes';

/**
 * Langue par défaut d'un visiteur sans préfixe d'URL ni choix mémorisé. Décisions du fondateur (21/11/2026) : « English must be the native
 * language and French only for French-speaking countries », « langue de l'appareil d'abord », « harx.ai dans la langue du navigateur » :
 *   1. langue PRINCIPALE du navigateur / de l'appareil si c'est l'anglais, le français, l'espagnol ou l'arabe (un navigateur anglais en
 *      France reste en anglais) ;
 *   2. navigateur sans aucune langue lisible (robots) : anglais ;
 *   3. navigateur dans une autre langue : français si le pays est francophone (pays de la société connu de l'application Téléphonie,
 *      `harxCountryLang` = « fr », sinon fuseau horaire `FRENCH_TIME_ZONES` ; Maghreb : français ; Canada : anglais), sinon anglais.
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
  const primary = String(input.browser[0] ?? '').trim();
  const browser = toSiteLang(primary);
  if (browser) return browser;
  if (!primary) return 'en';
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
