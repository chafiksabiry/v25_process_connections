import { SITE_LANGS, type SiteLang } from './langRoutes';

/**
 * Langue par défaut d'un visiteur sans préfixe d'URL ni choix mémorisé. Décision du fondateur (21/11/2026) : « on gère 4 langues et pour le
 * reste des langues c'est l'anglais » : la première langue de la liste du navigateur (`navigator.languages`, puis `navigator.language`) qui
 * fait partie de en, fr, es, ar ; sinon (aucune de ces langues, robot, navigateur sans langue lisible) l'anglais. Ni le pays ni le fuseau
 * horaire ne choisissent la langue.
 * Le même calcul est recopié en ES5 dans le script de redirection d'`index.html` (garde-fou : `defaultLang.test.ts`).
 */
const toSiteLang = (raw: string | null | undefined): SiteLang | null => {
  const code = String(raw ?? '').trim().toLowerCase().slice(0, 2);
  return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : null;
};

export function resolveDefaultLang(input: { browser: readonly (string | null | undefined)[] }): SiteLang {
  for (const candidate of input.browser) {
    const hit = toSiteLang(candidate);
    if (hit) return hit;
  }
  return 'en';
}
