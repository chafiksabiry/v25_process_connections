import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Page CLOUD (/cloud, ancienne adresse /telephony) et page de l'offre Receptionist (/cloud/receptionist), adresses CLOUD Receptionist du
 * 24/11/2026 : méta en anglais (langue officielle, comme /nomad), mêmes textes que lib/tracking/pageMeta.ts (CLOUD_META,
 * CLOUD_RECEPTIONIST_META). Le test lib/cloudRoutes.test.ts vérifie qu'ils restent alignés.
 */
const CLOUD_TITLE = 'HARX CLOUD: Telephony In The Cloud for your company and your teams — Receptionist, Entreprise, Contact Centre';
const CLOUD_DESC =
    'Phone service for your company and your teams: Receptionist, agents, managers and the management team, all in one place. A number from your country, inbound and outbound calls, voicemail and AI.';
const CLOUD_URL = 'https://harx.ai/cloud';
const RECEPTIONIST_TITLE = 'HARX CLOUD Receptionist: every call answered, handled and called back, even when you’re away';
const RECEPTIONIST_DESC =
    'Every call answered, every message followed up, even when your secretary works remotely. A number from your country, a greeting and voicemail suggested by AI, follow-ups, calendar and e-mails for your front desk.';
const RECEPTIONIST_URL = 'https://harx.ai/cloud/receptionist';

const CLOUD_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage de l'application Téléphonie (page CLOUD). -->
      <div id="seo-snapshot-cloud" lang="en" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX CLOUD</h1>
        <p>${CLOUD_DESC}</p>
        <ul>
          <li><a href="${RECEPTIONIST_URL}">Receptionist</a>: every call answered, every message followed up, even when your secretary works remotely.</li>
          <li>Entreprise: sales, customer service, collections — inbound and outbound calls for all your departments.</li>
          <li>Contact Centre: operations, numbers, queues and reports per client, shared agents, client portal under your brand.</li>
        </ul>
      </div>
    </div>`;

const RECEPTIONIST_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage de l'application Téléphonie (page de l'offre Receptionist). -->
      <div id="seo-snapshot-cloud-receptionist" lang="en" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX CLOUD Receptionist</h1>
        <p>${RECEPTIONIST_DESC}</p>
        <ul>
          <li>Every call answered, handled and called back, even when you’re away</li>
          <li>A number from your country, calls in the browser</li>
          <li>Greeting and voicemail suggested by AI, follow-ups, calendar and e-mails</li>
        </ul>
      </div>
    </div>`;

/** Offre CLOUD Receptionist décrite comme un service (sans prix : ils viennent du catalogue Stripe et changent selon le pays). */
const RECEPTIONIST_SERVICE = {
    '@type': 'Service',
    '@id': `${RECEPTIONIST_URL}#service`,
    name: 'HARX CLOUD Receptionist',
    url: RECEPTIONIST_URL,
    description: RECEPTIONIST_DESC,
    serviceType: 'Cloud telephony — front desk and secretariat',
    provider: { '@id': 'https://harx.ai/#organization' },
};

/**
 * Page de l'offre NOMAD (/nomad), en anglais (langue officielle ; le titre français est posé à l'exécution pour un visiteur francophone) :
 * mêmes textes que lib/tracking/pageMeta.ts (NOMAD_META.en). Le test lib/nomadRoutes.test.ts vérifie qu'ils restent alignés.
 */
const NOMAD_TITLE = 'HARX NOMAD: your phone number, voicemail and calls, anywhere in the world';
const NOMAD_DESC =
    'Travel without losing your number: the number from your country rings in your browser, with no roaming. A voicemail takes the message, AI summarizes it. For business travelers, nomads and freelancers on the road.';
const NOMAD_URL = 'https://harx.ai/nomad';

const NOMAD_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage de l'application Téléphonie (page NOMAD). -->
      <div id="seo-snapshot-nomad" lang="en" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX NOMAD</h1>
        <p>${NOMAD_DESC}</p>
        <ul>
          <li>One number that works anywhere in the world</li>
          <li>No roaming</li>
          <li>HARX Nomad app for iPhone and Android, and browser</li>
        </ul>
      </div>
    </div>`;

/** Application HARX Nomad (iPhone, Android, navigateur) : pas de prix (non affichés par l'hôte sur cette page). */
const NOMAD_APP = {
    '@type': 'SoftwareApplication',
    '@id': `${NOMAD_URL}#app`,
    name: 'HARX Nomad',
    url: NOMAD_URL,
    description: NOMAD_DESC,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'iOS, Android, Web',
    inLanguage: 'en',
    publisher: { '@id': 'https://harx.ai/#organization' },
};

const jsonLd = (url: string, title: string, desc: string, lang = 'fr', extra: Record<string, unknown>[] = []) => JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': 'https://harx.ai/#organization',
            name: 'HARX',
            url: 'https://harx.ai/',
            logo: 'https://harx.ai/logo_harx.png',
        },
        {
            '@type': 'WebSite',
            '@id': 'https://harx.ai/#website',
            name: 'HARX',
            url: 'https://harx.ai/',
            inLanguage: 'fr',
            publisher: { '@id': 'https://harx.ai/#organization' },
        },
        {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: title,
            description: desc,
            inLanguage: lang,
            isPartOf: { '@id': 'https://harx.ai/#website' },
            ...(extra.length ? { mainEntity: { '@id': extra[0]['@id'] } } : {}),
        },
        ...extra,
    ],
});

const CLOUD_JSONLD = jsonLd(CLOUD_URL, CLOUD_TITLE, CLOUD_DESC, 'en');
const RECEPTIONIST_JSONLD = jsonLd(RECEPTIONIST_URL, RECEPTIONIST_TITLE, RECEPTIONIST_DESC, 'en', [RECEPTIONIST_SERVICE]);
const NOMAD_JSONLD = jsonLd(NOMAD_URL, NOMAD_TITLE, NOMAD_DESC, 'en', [NOMAD_APP]);

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * Pré-rendu minimal de /cloud, /cloud/receptionist et /nomad : dérive dist/cloud/index.html, dist/cloud/receptionist/index.html et
 * dist/nomad/index.html du dist/index.html construit
 * (mêmes scripts hachés, mêmes conteneurs qiankun), avec méta SEO et résumé texte propres à la page.
 * Le build échoue si un gabarit attendu a changé, plutôt que de publier une page incohérente.
 */
function prerenderCallcentre(): Plugin {
    let outDir = 'dist';
    return {
        name: 'prerender-callcentre',
        apply: 'build',
        configResolved(c) {
            outDir = resolve(c.root, c.build.outDir);
        },
        closeBundle() {
            const base = readFileSync(resolve(outDir, 'index.html'), 'utf8');
            const page = (dir: string, title: string, desc: string, url: string, jsonld: string, snapshot: string) => {
                let html = base;
                const sub = (re: RegExp, to: string) => {
                    if (!re.test(html)) throw new Error(`prerender-callcentre: motif introuvable ${re}`);
                    html = html.replace(re, () => to);
                };
                sub(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)}</title>`);
                sub(/<meta name="description"[^>]*>/, `<meta name="description" content="${escAttr(desc)}" />`);
                sub(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
                sub(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
                sub(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escAttr(title)}" />`);
                sub(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escAttr(desc)}" />`);
                sub(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonld}</script>`);
                // Le conteneur auth ne doit pas être actif ni porter l'aperçu de l'accueil.
                sub(/<div id="container-auth" class="harx-mf-active">[\s\S]*?<\/script>\s*<\/div>/, '<div id="container-auth"></div>');
                sub(/<div id="container-callcenter"><\/div>/, snapshot);
                mkdirSync(resolve(outDir, dir), { recursive: true });
                writeFileSync(resolve(outDir, `${dir}/index.html`), html);
            };
            // Page CLOUD (/cloud, ancienne adresse /telephony qui y renvoie en 301) et page de l'offre Receptionist (/cloud/receptionist).
            page('cloud', CLOUD_TITLE, CLOUD_DESC, CLOUD_URL, CLOUD_JSONLD, CLOUD_SNAPSHOT);
            page('cloud/receptionist', RECEPTIONIST_TITLE, RECEPTIONIST_DESC, RECEPTIONIST_URL, RECEPTIONIST_JSONLD, RECEPTIONIST_SNAPSHOT);
            // Page de l'offre NOMAD (/nomad, adresses NOMAD du 24/11/2026), même gabarit.
            page('nomad', NOMAD_TITLE, NOMAD_DESC, NOMAD_URL, NOMAD_JSONLD, NOMAD_SNAPSHOT);
        },
    };
}

export default defineConfig({
    plugins: [react(), prerenderCallcentre()],
    server: {
        port: 5173,
        strictPort: true,
    },
    build: {
        outDir: 'dist',
    },
});
