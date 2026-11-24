// harx.ai/app : renvoie vers l'App Store (iPhone, iPad) ; page avec Google Play et le téléchargement direct (APK) sur Android ; page avec le
// QR code et les trois choix sur ordinateur. Logique et textes : lib/nomadApp.ts. Liens : variables Netlify NOMAD_APP_STORE_URL,
// NOMAD_PLAY_STORE_URL et NOMAD_APK_URL ; NOMAD_APP_STORE_EXCLUDED_COUNTRIES : pays (ISO-2) où l'App Store n'est ni ouvert ni montré
// (app iOS pas encore disponible dans l'UE), pays du visiteur donné par Netlify (context.geo).
import { decide, detectPlatform, excludedCountries, linksForCountry, pickLang, renderPage, storeLinks } from '../../lib/nomadApp.ts';

declare const Netlify: { env: { get(name: string): string | undefined } };

export default (request: Request, context?: { geo?: { country?: { code?: string } } }): Response => {
  const configured = storeLinks({ NOMAD_APP_STORE_URL: Netlify.env.get('NOMAD_APP_STORE_URL'), NOMAD_PLAY_STORE_URL: Netlify.env.get('NOMAD_PLAY_STORE_URL'), NOMAD_APK_URL: Netlify.env.get('NOMAD_APK_URL') });
  const links = linksForCountry(configured, excludedCountries(Netlify.env.get('NOMAD_APP_STORE_EXCLUDED_COUNTRIES')), context?.geo?.country?.code);
  const platform = detectPlatform(request.headers.get('user-agent'));
  const d = decide(platform, links);
  // La réponse dépend de l'appareil et du pays : jamais mise en cache partagé.
  const headers = { 'cache-control': 'private, no-store', vary: 'User-Agent, Accept-Language' };
  if (d.kind === 'redirect') return new Response(null, { status: 302, headers: { ...headers, location: d.location } });
  return new Response(renderPage(pickLang(request.headers.get('accept-language')), d.platform, links), { status: 200, headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } });
};

export const config = { path: ['/app', '/app/'] };
