/** Pages légales servies par le micro-frontend `auth` (routes à la racine). */
export const LEGAL_PATHS = ['/privacy', '/terms', '/cookies', '/gdpr'] as const;

export function isLegalPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return (LEGAL_PATHS as readonly string[]).includes(path);
}
