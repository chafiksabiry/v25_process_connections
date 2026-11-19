import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from '../lib/consent';
import { cookieBannerDir, cookiePolicyHref, COOKIE_BANNER_TEXTS, readCookieBannerLang } from '../lib/cookieBannerI18n';

const buttonBase: React.CSSProperties = {
  flex: '1 1 140px',
  padding: '10px 16px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid #ffffff',
  background: '#ffffff',
  color: '#111827',
};

/**
 * Rendu dans <body> via un portail : le #root de l'hôte est écrêté (clip) quand il ne contient
 * aucune page hôte, ce qui masquerait un élément fixe rendu à l'intérieur.
 */
export default function CookieBanner() {
  const { pathname } = useLocation();
  // Langue de la page : préfixe /fr, /en, /es, /ar, sinon langue mémorisée par le site (voir lib/cookieBannerI18n.ts).
  // Un changement de langue sans rechargement (sélecteur du site d'accueil) met à jour <html lang/dir> : on relit alors la langue.
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const bump = () => setLangTick((n) => n + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    window.addEventListener('storage', bump);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', bump);
    };
  }, []);
  const lang = readCookieBannerLang(pathname);
  const t = COOKIE_BANNER_TEXTS[lang];
  const cookiesHref = cookiePolicyHref(lang);

  const [open, setOpen] = useState<boolean>(() => readConsent() === null);
  const [customizing, setCustomizing] = useState(false);
  const [draft, setDraft] = useState<ConsentChoice>(() => readConsent() ?? { analytics: false, marketing: false });

  useEffect(() => {
    const onOpen = () => {
      setDraft(readConsent() ?? { analytics: false, marketing: false });
      setCustomizing(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  const choose = (choice: ConsentChoice) => {
    setOpen(false);
    setCustomizing(false);
    saveConsent(choice);
  };

  // Plus de bouton flottant : le panneau se rouvre depuis le lien « Gérer mes cookies » du pied de page.
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      lang={lang}
      dir={cookieBannerDir(lang)}
      data-testid="cookie-banner"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        margin: '0 auto',
        maxWidth: 760,
        zIndex: 2147483000,
        background: '#111827',
        color: '#ffffff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>{t.title}</strong>
      <p style={{ margin: '0 0 12px' }}>
        {t.body}{' '}
        <a href={cookiesHref} style={{ color: '#ffffff', textDecoration: 'underline' }}>
          {t.more}
        </a>
      </p>

      {customizing && (
        <div style={{ margin: '0 0 12px' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={draft.analytics}
              onChange={(e) => setDraft({ ...draft, analytics: e.target.checked })}
            />
            <span>{t.analytics}</span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={draft.marketing}
              onChange={(e) => setDraft({ ...draft, marketing: e.target.checked })}
            />
            <span>{t.marketing}</span>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={buttonBase} onClick={() => choose({ analytics: false, marketing: false })}>
          {t.refuse}
        </button>
        {customizing ? (
          <button type="button" style={buttonBase} onClick={() => choose(draft)}>
            {t.save}
          </button>
        ) : (
          <button type="button" style={buttonBase} onClick={() => setCustomizing(true)}>
            {t.customize}
          </button>
        )}
        <button type="button" style={buttonBase} onClick={() => choose({ analytics: true, marketing: true })}>
          {t.accept}
        </button>
      </div>
    </div>,
    document.body
  );
}
