import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const CC_TITLE =
    'HARX Téléphonie : numéro de votre pays, appels et répondeur IA pour freelances, TPE, PME et centres d’appels';
const CC_DESC =
    'Un numéro de votre pays, vos appels entrants et sortants, un répondeur et une IA pour vous assister. Pour les freelances et nomades, les TPE (accueil et secrétariat), les PME et équipes à distance, et les centres d’appels, en Europe, aux États-Unis et en externalisation.';
const CC_URL = 'https://harx.ai/telephony';

const CC_SNAPSHOT = `<div id="container-callcenter" class="harx-mf-active">
      <!-- Résumé statique pour les robots ; vidé par qiankun au montage du micro-frontend téléphonie. -->
      <div id="seo-snapshot-callcentre" lang="fr" style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif">
        <h1>HARX Téléphonie</h1>
        <p>${CC_DESC}</p>
        <h2>Quatre profils, quatre offres</h2>
        <ul>
          <li>Nomad Solo : pour les freelances, les nomades qui voyagent tout le temps et ceux qui travaillent en France en vivant à l’étranger (Maroc, Dubaï, Thaïlande…). Un numéro de votre pays, un répondeur personnel et un journal d’appels.</li>
          <li>Accueil / Secrétariat : pour les TPE de tous les métiers (cabinets médicaux, courtiers d’assurance…), dont le personnel travaille à distance ou dont l’accueil est délocalisé.</li>
          <li>Company Full Scope In &amp; Out : pour les PME et les équipes à distance qui téléphonent dans tous leurs services (ventes, relation client, recouvrement, recrutement).</li>
          <li>Contact Centre Multi-clients : pour les centres d’appels, en Europe, aux États-Unis ou dans les pays d’externalisation (France, Maroc, Tunisie, Sénégal…), dont les agents sont sur plateau ou à distance, et qui travaillent pour plusieurs clients.</li>
        </ul>
      </div>
    </div>`;

const CC_JSONLD = JSON.stringify({
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
            '@id': `${CC_URL}#webpage`,
            url: CC_URL,
            name: CC_TITLE,
            description: CC_DESC,
            inLanguage: 'fr',
            isPartOf: { '@id': 'https://harx.ai/#website' },
        },
    ],
});

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * Pré-rendu minimal de /telephony : dérive dist/telephony/index.html du dist/index.html construit
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
            let html = readFileSync(resolve(outDir, 'index.html'), 'utf8');
            const sub = (re: RegExp, to: string) => {
                if (!re.test(html)) throw new Error(`prerender-callcentre: motif introuvable ${re}`);
                html = html.replace(re, () => to);
            };
            sub(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(CC_TITLE)}</title>`);
            sub(/<meta name="description"[^>]*>/, `<meta name="description" content="${escAttr(CC_DESC)}" />`);
            sub(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${CC_URL}" />`);
            sub(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${CC_URL}" />`);
            sub(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escAttr(CC_TITLE)}" />`);
            sub(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escAttr(CC_DESC)}" />`);
            sub(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${CC_JSONLD}</script>`);
            // Le conteneur auth ne doit pas être actif ni porter l'aperçu de l'accueil.
            sub(/<div id="container-auth" class="harx-mf-active">[\s\S]*?<\/script>\s*<\/div>/, '<div id="container-auth"></div>');
            sub(/<div id="container-callcenter"><\/div>/, CC_SNAPSHOT);
            mkdirSync(resolve(outDir, 'telephony'), { recursive: true });
            writeFileSync(resolve(outDir, 'telephony/index.html'), html);
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
