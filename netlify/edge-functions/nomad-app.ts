// harx.ai/app : renvoie vers l'App Store (iPhone, iPad) ou Google Play (Android) ; page avec les boutons sur ordinateur ou si le store
// n'est pas configuré. Logique et textes : lib/nomadApp.ts. Liens : variables Netlify NOMAD_APP_STORE_URL et NOMAD_PLAY_STORE_URL.
import { decide, detectPlatform, pickLang, renderPage, storeLinks } from '../../lib/nomadApp.ts';

declare const Netlify: { env: { get(name: string): string | undefined } };

export default (request: Request): Response => {
  const links = storeLinks({ NOMAD_APP_STORE_URL: Netlify.env.get('NOMAD_APP_STORE_URL'), NOMAD_PLAY_STORE_URL: Netlify.env.get('NOMAD_PLAY_STORE_URL') });
  const platform = detectPlatform(request.headers.get('user-agent'));
  const d = decide(platform, links);
  // La réponse dépend de l'appareil : jamais mise en cache partagé.
  const headers = { 'cache-control': 'private, no-store', vary: 'User-Agent, Accept-Language' };
  if (d.kind === 'redirect') return new Response(null, { status: 302, headers: { ...headers, location: d.location } });
  return new Response(renderPage(pickLang(request.headers.get('accept-language')), d.platform, links), { status: 200, headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } });
};

export const config = { path: ['/app', '/app/'] };
