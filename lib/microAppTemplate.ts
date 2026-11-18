/**
 * qiankun recopie le <head> de chaque micro-front dans son conteneur (balise <qiankun-head>, dans le <body>).
 * Ses balises og:* / twitter:* s'ajoutaient alors à celles de la coquille (par exemple un second og:title
 * « HARX — Accueil » et un og:url /auth/choice). Seules celles de la coquille, tenues à jour par
 * updatePageHead, doivent rester : on retire celles du micro-front avant son montage.
 */
const SOCIAL_META = /<meta\b[^>]*\b(?:property|name)\s*=\s*["']?(?:og|twitter):[^>]*>\s*/gi;

export function stripSocialMeta(template: string): string {
  return template.replace(SOCIAL_META, '');
}
