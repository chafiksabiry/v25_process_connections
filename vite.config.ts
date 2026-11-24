import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const CC_TITLE =
    'HARX Téléphonie : numéro français, appels et répondeur IA pour freelances, TPE, PME et centres d’appels';
const CC_DESC =
    'Un numéro français, vos appels entrants et sortants, un répondeur et une IA pour vous assister. Pour les freelances et nomades, les TPE (accueil et secrétariat), les PME et équipes à distance, et les centres d’appels, en Europe, aux États-Unis et en externalisation.';
const CC_URL = 'https://harx.ai/telephony';

const CC_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage du micro-frontend téléphonie. -->
      <div id="seo-snapshot-callcentre" lang="fr" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX Téléphonie</h1>
        <p>${CC_DESC}</p>
        <h2>Quatre profils, quatre offres</h2>
        <ul>
          <li>Nomad : pour les freelances, les nomades qui voyagent tout le temps et ceux qui travaillent en France en vivant à l’étranger (Maroc, Dubaï, Thaïlande…). Un numéro français, un répondeur personnel et un journal d’appels.</li>
          <li>Accueil / Secrétariat : pour les TPE de tous les métiers (cabinets médicaux, courtiers d’assurance…), dont le personnel travaille à distance ou dont l’accueil est délocalisé.</li>
          <li>Company Full Scope In &amp; Out : pour les PME et les équipes à distance qui téléphonent dans tous leurs services (ventes, relation client, recouvrement, recrutement).</li>
          <li>Contact Centre Multi-clients : pour les centres d’appels, en Europe, aux États-Unis ou dans les pays d’externalisation (France, Maroc, Tunisie, Sénégal…), dont les agents sont sur plateau ou à distance, et qui travaillent pour plusieurs clients.</li>
        </ul>
      </div>
    </div>`;

/** Page de l'offre NOMAD (/nomad) : mêmes textes que lib/tracking/pageMeta.ts (NOMAD_TITLE, NOMAD_DESCRIPTION). */
const NOMAD_TITLE = 'HARX NOMAD : un numéro français, un répondeur et vos appels, partout dans le monde';
const NOMAD_DESC =
    'Pour les freelances, les nomades qui voyagent tout le temps et ceux qui travaillent en France en vivant à l’étranger (Maroc, Dubaï, Thaïlande…). Un numéro français, un répondeur personnel et un journal d’appels.';
const NOMAD_URL = 'https://harx.ai/nomad';

const NOMAD_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage de l'application Téléphonie (page NOMAD). -->
      <div id="seo-snapshot-nomad" lang="fr" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX NOMAD</h1>
        <p>${NOMAD_DESC}</p>
      </div>
    </div>`;

const jsonLd = (url: string, title: string, desc: string) => JSON.stringify({
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
            inLanguage: 'fr',
            isPartOf: { '@id': 'https://harx.ai/#website' },
        },
    ],
});

const CC_JSONLD = jsonLd(CC_URL, CC_TITLE, CC_DESC);
const NOMAD_JSONLD = jsonLd(NOMAD_URL, NOMAD_TITLE, NOMAD_DESC);

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * Pré-rendu minimal de /telephony et de /nomad : dérive dist/telephony/index.html et dist/nomad/index.html du dist/index.html construit
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
            page('telephony', CC_TITLE, CC_DESC, CC_URL, CC_JSONLD, CC_SNAPSHOT);
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
