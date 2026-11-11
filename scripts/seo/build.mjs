// Génère les pages de contenu statiques (blog, FAQ, solutions) en 4 langues + les sitemaps.
// Usage : node scripts/seo/build.mjs  (après `vite build`, écrit dans dist/)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, SITE, UI } from './ui.mjs';
import { CORE } from './core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = resolve(root, 'dist');
const TYPES = { blog: 'blog', faq: 'faq', solution: 'solutions' }; // type -> segment d'URL
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const words = (s) => String(s).split(/\s+/).filter(Boolean).length;

const checkArg = process.argv.indexOf('--check');
const checkSlugs = checkArg > -1 ? new Set(process.argv[checkArg + 1].split(',')) : null;
// ---------- chargement + validation ----------
const entries = [];
const errors = [];
for (const dir of ['blog', 'faq', 'solutions']) {
  const p = resolve(root, 'content', dir);
  if (!existsSync(p)) continue;
  for (const f of readdirSync(p).filter((n) => n.endsWith('.json') && (!checkSlugs || checkSlugs.has(n.replace(/\.json$/, ''))))) {
    const e = JSON.parse(readFileSync(resolve(p, f), 'utf8'));
    e.file = `content/${dir}/${f}`;
    e.segment = TYPES[e.type];
    if (!e.segment || f.replace(/\.json$/, '') !== e.slug) errors.push(`${e.file}: type/slug incohérent`);
    for (const l of LANGS) {
      const c = e.langs?.[l];
      if (!c) { errors.push(`${e.file}: langue ${l} manquante`); continue; }
      if (!c.title || c.title.length > 75) errors.push(`${e.file}[${l}]: titre vide ou > 75 car.`);
      if (!c.description || c.description.length < 70 || c.description.length > 175) errors.push(`${e.file}[${l}]: description hors 70–175 car. (${c.description?.length})`);
      const text = JSON.stringify(c.blocks || []);
      const min = e.type === 'faq' ? 100 : 300;
      if (words(text) < min) errors.push(`${e.file}[${l}]: contenu trop court (${words(text)} mots < ${min})`);
    }
    entries.push(e);
  }
}
const seen = new Map();
for (const e of entries) for (const l of LANGS) {
  const t = `${l}|${e.langs?.[l]?.title}`;
  if (seen.has(t)) errors.push(`${e.file}[${l}]: titre dupliqué avec ${seen.get(t)}`);
  seen.set(t, e.file);
}
if (errors.length) { console.error('SEO build: contenu invalide\n - ' + errors.join('\n - ')); process.exit(1); }

if (checkSlugs) { console.log(`SEO check OK: ${entries.length} contenus valides`); process.exit(0); }
// ---------- rendu ----------
const url = (lang, ...parts) => `${SITE}/${lang}/${parts.filter(Boolean).join('/')}${parts.length ? '/' : ''}`.replace(/\/\/$/, '/');
const alternates = (build) => LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${build(l)}">`).join('\n  ') + `\n  <link rel="alternate" hreflang="x-default" href="${build('fr')}">`;

const GA_ID = 'G-93ZHG8LNXL';
const CONSENT_KEY = 'harx_cookie_consent';
const gaSnippet = `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});(function(){function load(c){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied'});if(c.analytics||c.marketing){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s);}if(c.analytics){gtag('event','page_view',{page_location:location.href,page_path:location.pathname,page_title:document.title});}}window.harxApplyConsent=load;try{var raw=localStorage.getItem('${CONSENT_KEY}');if(raw){var c=JSON.parse(raw);if(c&&c.v===1)load({analytics:c.analytics===true,marketing:c.marketing===true});}}catch(e){}})();</script>`;
const consentBar = (u, lang) => `<div id="harx-consent" hidden style="position:fixed;inset:auto 0 0 0;background:#1e0f33;border-top:1px solid #3a2257;padding:14px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;z-index:50"><span style="flex:1;min-width:220px;font-size:.9rem">${esc(u.consent)} <a href="/${lang}/cookies">${esc(u.cookies)}</a></span><button id="harx-consent-no" style="padding:8px 16px;border-radius:10px;border:1px solid #3a2257;background:transparent;color:#fff;cursor:pointer">${esc(u.refuse)}</button><button id="harx-consent-yes" style="padding:8px 16px;border-radius:10px;border:0;background:#e91e8c;color:#fff;font-weight:700;cursor:pointer">${esc(u.accept)}</button></div><script>(function(){var k='${CONSENT_KEY}',b=document.getElementById('harx-consent');var stored=false;try{stored=!!localStorage.getItem(k);}catch(e){}if(!stored)b.hidden=false;var m=document.getElementById('harx-manage-cookies');if(m)m.onclick=function(ev){ev.preventDefault();b.hidden=false;};function save(a){var c={v:1,analytics:a,marketing:a,ts:new Date().toISOString()};try{localStorage.setItem(k,JSON.stringify(c));}catch(e){}b.hidden=true;if(window.harxApplyConsent)window.harxApplyConsent(c);}document.getElementById('harx-consent-yes').onclick=function(){save(true);};document.getElementById('harx-consent-no').onclick=function(){save(false);};})();</script>`;
const CSS = `*{box-sizing:border-box}body{margin:0;background:#12071f;color:#f4eefb;font:17px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}a{color:#ff7ab8}a:hover{color:#fff}header{background:linear-gradient(90deg,#e11d48,#e91e8c);padding:14px 24px;display:flex;gap:20px;align-items:center;flex-wrap:wrap}header a{color:#fff;text-decoration:none;font-weight:600}header img{height:30px;display:block}nav{display:flex;gap:18px;flex-wrap:wrap;flex:1}.lang{display:flex;gap:10px}main{max-width:820px;margin:0 auto;padding:40px 24px 64px}h1{font-size:2.1rem;line-height:1.2;margin:.2em 0 .4em}h2{font-size:1.45rem;margin:1.8em 0 .5em;color:#fff}.crumbs{font-size:.9rem;opacity:.8}.meta{opacity:.7;font-size:.9rem}ul{padding-inline-start:1.3em}li{margin:.35em 0}.card{background:#1e0f33;border:1px solid #3a2257;border-radius:14px;padding:18px 20px;margin:14px 0}.card a{font-weight:700;text-decoration:none}.cta{margin:40px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#e11d48,#e91e8c);color:#fff}.cta a.btn{display:inline-block;margin-top:10px;padding:12px 22px;border-radius:12px;background:#fff;color:#c2185b;font-weight:700;text-decoration:none}details{background:#1e0f33;border:1px solid #3a2257;border-radius:12px;padding:12px 16px;margin:10px 0}summary{cursor:pointer;font-weight:700}footer{border-top:1px solid #3a2257;padding:24px;text-align:center;font-size:.9rem;opacity:.8}footer a{margin:0 10px}`;

function header(lang) {
  const u = UI[lang];
  const langLinks = LANGS.map((l) => `<a href="/${l}/" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`).join('');
  return `<header><a href="/${lang}"><img src="/logo_harx.png" alt="HARX" height="30"></a><nav><a href="/${lang}/taas">${esc(u.taas)}</a><a href="/telephony/">${esc(u.telephony)}</a><a href="/${lang}/solutions/">${esc(u.solutions)}</a><a href="/${lang}/blog/">${esc(u.blog)}</a><a href="/${lang}/faq/">${esc(u.faq)}</a></nav><a href="/${lang}/auth/signin">${esc(u.signin)}</a><span class="lang">${langLinks}</span></header>`;
}
function footer(lang) {
  const u = UI[lang];
  return `<footer><a href="/${lang}/terms">${esc(u.terms)}</a><a href="/${lang}/privacy">${esc(u.privacy)}</a><a href="/${lang}/gdpr">${esc(u.gdpr)}</a><a href="#" id="harx-manage-cookies">${esc(u.manageCookies)}</a><p>© 2026 HARX Technologies Inc. ${esc(u.rights)}</p></footer>`;
}
function blocksHtml(blocks) {
  return blocks.map((b) => {
    if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.ul) return `<ul>${b.ul.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.faq) return b.faq.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('');
    return '';
  }).join('\n');
}
function faqItems(blocks) { return blocks.flatMap((b) => b.faq || []); }

function page({ lang, path, title, description, bodyHtml, jsonld, alt, ogType = 'website', lastmod }) {
  const u = UI[lang];
  const canonical = `${SITE}/${lang}/${path}`.replace(/([^:])\/\/+/g, '$1/');
  return `<!doctype html>
<html lang="${lang}" dir="${u.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  ${alt}
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="HARX">
  <meta property="og:locale" content="${u.locale}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/logo_harx.png">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/logo_harx.png">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld })}</script>
  <style>${CSS}</style>
  ${gaSnippet}
</head>
<body>
${header(lang)}
<main>
${bodyHtml}
<section class="cta"><strong>${esc(u.cta)}</strong><p>${esc(u.ctaText)}</p><a class="btn" href="/telephony/">${esc(u.telephony)}</a> <a class="btn" href="/${lang}/auth/choice">${esc(u.start)}</a></section>
</main>
${footer(lang)}
${consentBar(u, lang)}
</body>
</html>`;
}
const ORG = { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'HARX', url: `${SITE}/`, logo: `${SITE}/logo_harx.png` };
const crumbs = (lang, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});
function write(rel, html) {
  const f = resolve(dist, rel, 'index.html');
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, html);
}

const urls = []; // { loc, alts, lastmod, group }
const byType = (t) => entries.filter((e) => e.type === t).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

for (const lang of LANGS) {
  const u = UI[lang];
  // pages de contenu
  for (const e of entries) {
    const c = e.langs[lang];
    const path = `${e.segment}/${e.slug}/`;
    const hubName = e.type === 'blog' ? u.blog : e.type === 'faq' ? u.faq : u.solutions;
    const related = byType(e.type).filter((x) => x.slug !== e.slug).slice(0, 3);
    const body = `<p class="crumbs"><a href="/${lang}">${esc(u.home)}</a> › <a href="/${lang}/${e.segment}/">${esc(hubName)}</a> › ${esc(c.title)}</p>
<h1>${esc(c.title)}</h1>
${e.date ? `<p class="meta">${esc(u.published)} ${esc(e.date)}</p>` : ''}
<p><strong>${esc(c.description)}</strong></p>
${blocksHtml(c.blocks)}
${related.length ? `<h2>${esc(u.related)}</h2>${related.map((r) => `<div class="card"><a href="/${lang}/${r.segment}/${r.slug}/">${esc(r.langs[lang].title)}</a><br>${esc(r.langs[lang].description)}</div>`).join('')}` : ''}`;
    const ld = [ORG, crumbs(lang, [{ name: u.home, url: `${SITE}/${lang}` }, { name: hubName, url: url(lang, e.segment) }, { name: c.title, url: url(lang, e.segment, e.slug) }])];
    const fq = faqItems(c.blocks);
    if (fq.length) ld.push({ '@type': 'FAQPage', mainEntity: fq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) });
    if (e.type === 'blog') ld.push({ '@type': 'Article', headline: c.title, description: c.description, inLanguage: lang, datePublished: e.date, dateModified: e.updated || e.date, author: { '@id': `${SITE}/#organization` }, publisher: { '@id': `${SITE}/#organization` }, mainEntityOfPage: url(lang, e.segment, e.slug), image: `${SITE}/logo_harx.png` });
    write(`${lang}/${path}`, page({ lang, path, title: c.title, description: c.description, bodyHtml: body, jsonld: ld, alt: alternates((l) => url(l, e.segment, e.slug)), ogType: e.type === 'blog' ? 'article' : 'website' }));
  }
  // pages de liste (hubs)
  for (const [type, seg, name, desc] of [['blog', 'blog', u.hubBlog, u.hubBlogDesc], ['faq', 'faq', u.hubFaq, u.hubFaqDesc], ['solution', 'solutions', u.hubSolutions, u.hubSolutionsDesc]]) {
    const list = byType(type);
    if (!list.length) continue;
    const body = `<p class="crumbs"><a href="/${lang}">${esc(u.home)}</a> › ${esc(name)}</p><h1>${esc(name)}</h1><p>${esc(desc)}</p>${list.map((r) => `<div class="card"><a href="/${lang}/${seg}/${r.slug}/">${esc(r.langs[lang].title)}</a><br>${esc(r.langs[lang].description)}</div>`).join('\n')}`;
    const ld = [ORG, crumbs(lang, [{ name: u.home, url: `${SITE}/${lang}` }, { name, url: url(lang, seg) }]), { '@type': 'CollectionPage', name, description: desc, inLanguage: lang, url: url(lang, seg) }];
    write(`${lang}/${seg}/`, page({ lang, path: `${seg}/`, title: `${name} | HARX`, description: desc.length >= 70 ? desc : desc + ' ' + u.ctaText, bodyHtml: body, jsonld: ld, alt: alternates((l) => url(l, seg)) }));
  }
}


// ---------- pages principales pré-rendues (accueil, TAAS, COMPANY, REPS) ----------
const baseHtml = readFileSync(resolve(dist, 'index.html'), 'utf8');
const rewrites = [];
const coreKeys = ['home', 'taas', 'company', 'reps'];
const corePath = (lang, key) => `${SITE}/${lang}${CORE[lang][key].path ? '/' + CORE[lang][key].path : ''}`;
for (const lang of LANGS) {
  for (const key of coreKeys) {
    const c = CORE[lang][key];
    const url = corePath(lang, key);
    let html = baseHtml;
    const sub = (re, to) => {
      if (!re.test(html)) throw new Error(`prerender core: motif introuvable ${re}`);
      html = html.replace(re, () => to);
    };
    sub(/<html lang="fr">/, `<html lang="${lang}">`);
    sub(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.title)}</title>`);
    sub(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(c.description)}" />`);
    sub(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />\n    ${alternates((l) => corePath(l, key))}`);
    sub(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
    sub(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(c.title)}" />`);
    sub(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(c.description)}" />`);
    const open = html.indexOf('<div id="seo-snapshot"');
    const innerStart = html.indexOf('>', open) + 1;
    const marker = '\n      </div>\n      <script>';
    const innerEnd = html.indexOf(marker, innerStart);
    if (open < 0 || innerEnd < 0) throw new Error('prerender core: aperçu #seo-snapshot introuvable');
    const attrs = key === 'home' ? ` data-snap-page="hub" data-snap-lang="${lang}"` : key === 'taas' ? ` data-snap-page="taas" data-snap-lang="${lang}"` : '';
    const links = `<nav><a href="/${lang}">${esc(UI[lang].home)}</a> · <a href="/${lang}/taas">TAAS</a> · <a href="/telephony/">${esc(UI[lang].telephony)}</a> · <a href="/${lang}/faq/">${esc(UI[lang].faq)}</a> · <a href="/${lang}/blog/">${esc(UI[lang].blog)}</a> · <a href="/${lang}/solutions/">${esc(UI[lang].solutions)}</a></nav>`;
    const snap = `\n        <div${attrs} lang="${lang}" dir="${UI[lang].dir}">\n          <h1>${esc(c.h1)}</h1>\n${c.p.map((t) => `          <p>${esc(t)}</p>`).join('\n')}\n          ${links}\n        </div>`;
    html = html.slice(0, innerStart) + snap + html.slice(innerEnd);
    const file = `_pre/${lang}-${key}.html`;
    mkdirSync(resolve(dist, '_pre'), { recursive: true });
    writeFileSync(resolve(dist, file), html);
    const route = `/${lang}${c.path ? '/' + c.path : ''}`;
    rewrites.push(`${route} /${file} 200!`);
    if (!c.path) rewrites.push(`${route}/ /${file} 200!`);
  }
}
writeFileSync(resolve(dist, '_redirects'), rewrites.join('\n') + '\n');

// ---------- sitemaps ----------
const today = new Date().toISOString().slice(0, 10);
const altXml = (build) => LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${build(l)}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${build('fr')}"/>`;
const entryUrls = [];
for (const type of ['blog', 'faq', 'solution']) {
  const list = byType(type);
  if (!list.length) continue;
  const seg = TYPES[type];
  for (const l of LANGS) entryUrls.push({ loc: url(l, seg), alt: altXml((x) => url(x, seg)), lastmod: today });
  for (const e of list) for (const l of LANGS) entryUrls.push({ loc: url(l, seg, e.slug), alt: altXml((x) => url(x, seg, e.slug)), lastmod: e.updated || e.date || today });
}
const xml = (items) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${items.map((i) => `  <url>\n    <loc>${i.loc}</loc>\n    <lastmod>${i.lastmod}</lastmod>\n${i.alt}\n  </url>`).join('\n')}\n</urlset>\n`;
writeFileSync(resolve(dist, 'sitemap-content.xml'), xml(entryUrls));
const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE}/sitemap-core.xml</loc><lastmod>${today}</lastmod></sitemap>\n  <sitemap><loc>${SITE}/sitemap-content.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>\n`;
writeFileSync(resolve(dist, 'sitemap.xml'), index);
console.log(`SEO build: ${LANGS.length * coreKeys.length} pages principales pré-rendues ; ${entries.length} contenus × ${LANGS.length} langues = ${entries.length * LANGS.length} pages + hubs ; ${entryUrls.length} URLs dans sitemap-content.xml`);
