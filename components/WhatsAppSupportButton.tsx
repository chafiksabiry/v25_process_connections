import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { getLangFromPath } from '../lib/langRoutes';

/**
 * Bouton flottant « AI Support » : ouvre WhatsApp vers l'assistant IA de HARX (WhatsApp Business / Cloud API + Claude).
 *
 * - Visiteur non connecté : lien wa.me avec un message d'accueil dans la langue du site -> aide générale.
 * - Utilisateur connecté (jeton HARX présent) : le backend émet un code de liaison à usage unique ; il est ajouté au
 *   message pré-rempli. Quand le code arrive sur WhatsApp, le numéro est lié au compte (l'assistant peut alors voir
 *   le forfait, les soldes, les droits de CE compte uniquement). En cas d'échec (réseau, jeton expiré), on retombe
 *   sur le lien général : le bouton fonctionne toujours.
 * Rendu dans <body> via un portail (le #root de l'hôte peut être écrêté, comme pour CookieBanner). Il se place
 * au-dessus de la bulle de chat Zoho SalesIQ (bas droite) pour ne pas la masquer.
 */
const NUMBER = String(import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || '212637446431').replace(/\D/g, '');
const ORCHESTRATOR_API = String(
  import.meta.env.VITE_API_URL_ORCHESTRATOR || 'https://v25comporchestratorback-production.up.railway.app/api',
).replace(/\/+$/, '');

const TEXTS = {
  fr: { label: 'Support IA', aria: 'Ouvrir le support IA HARX sur WhatsApp', hello: "Bonjour, j'ai besoin d'aide sur HARX." },
  en: { label: 'AI Support', aria: 'Open HARX AI support on WhatsApp', hello: 'Hello, I need help with HARX.' },
  es: { label: 'Soporte IA', aria: 'Abrir el soporte IA de HARX en WhatsApp', hello: 'Hola, necesito ayuda con HARX.' },
  ar: { label: 'الدعم الذكي', aria: 'فتح الدعم الذكي لـ HARX على واتساب', hello: 'مرحبا، أحتاج مساعدة بخصوص HARX.' },
} as const;

const WHATSAPP_GREEN = '#25D366';
const WHATSAPP_GREEN_DARK = '#128C7E';

/** Logo WhatsApp (glyphe officiel, une seule couleur, viewBox 448x512). */
function WhatsAppGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" aria-hidden="true" focusable="false" fill="#fff">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

const CSS = `
.harx-wa-fab{position:fixed;right:20px;bottom:96px;z-index:99990;display:inline-flex;align-items:center;gap:10px;
  height:56px;padding:0 20px 0 14px;border:0;border-radius:999px;background:${WHATSAPP_GREEN};color:#fff;cursor:pointer;
  font:600 15px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;letter-spacing:.01em;
  box-shadow:0 6px 18px rgba(0,0,0,.28),0 0 0 0 rgba(37,211,102,.5);transition:transform .15s ease,background .15s ease}
.harx-wa-fab:hover{background:${WHATSAPP_GREEN_DARK};transform:translateY(-2px)}
.harx-wa-fab:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 6px ${WHATSAPP_GREEN_DARK}}
.harx-wa-fab[aria-busy="true"]{opacity:.8;cursor:progress}
.harx-wa-fab[dir="rtl"]{padding:0 14px 0 20px}
@media (prefers-reduced-motion:no-preference){.harx-wa-fab{animation:harx-wa-pulse 2.6s ease-out 1.2s 2}}
@keyframes harx-wa-pulse{0%{box-shadow:0 6px 18px rgba(0,0,0,.28),0 0 0 0 rgba(37,211,102,.55)}100%{box-shadow:0 6px 18px rgba(0,0,0,.28),0 0 0 18px rgba(37,211,102,0)}}
@media (max-width:640px){
  .harx-wa-fab{right:14px;bottom:84px;width:56px;padding:0;justify-content:center}
  .harx-wa-fab .harx-wa-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
}
@media print{.harx-wa-fab{display:none}}
`;

async function buildWhatsAppUrl(hello: string): Promise<string> {
  const generic = `https://wa.me/${NUMBER}?text=${encodeURIComponent(hello)}`;
  let token: string | null = null;
  try { token = localStorage.getItem('token'); } catch { /* stockage indisponible */ }
  if (!token) return generic;
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${ORCHESTRATOR_API}/whatsapp/link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: hello }),
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return generic;
    const data = (await res.json()) as { url?: string };
    return typeof data.url === 'string' && data.url.startsWith(`https://wa.me/${NUMBER}`) ? data.url : generic;
  } catch {
    return generic;
  }
}

export default function WhatsAppSupportButton() {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname) ?? 'fr';
  const t = TEXTS[lang];
  const [busy, setBusy] = useState(false);

  // Le portail n'existe qu'une fois le <body> disponible (rendu côté client uniquement).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === 'undefined') return null;

  const open = async () => {
    if (busy) return;
    setBusy(true);
    // Ouvrir la fenêtre tout de suite (clic utilisateur) pour ne pas être bloqué par le bloqueur de popups, puis la rediriger.
    const win = window.open('about:blank', '_blank');
    const url = await buildWhatsAppUrl(t.hello);
    if (win) { try { win.opener = null; } catch { /* ignore */ } win.location.href = url; } else window.location.href = url;
    setBusy(false);
  };

  return createPortal(
    <>
      <style>{CSS}</style>
      <button type="button" className="harx-wa-fab" onClick={open} aria-label={t.aria} title={t.aria} aria-busy={busy} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-testid="whatsapp-support-button">
        <WhatsAppGlyph />
        <span className="harx-wa-label">{t.label}</span>
      </button>
    </>,
    document.body,
  );
}
