import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from '../lib/consent';
import { getLangFromPath } from '../lib/langRoutes';

const TEXTS = {
  fr: {
    title: 'Vos préférences de cookies',
    body:
      "Nous utilisons des cookies pour mesurer l'audience du site et, avec votre accord, l'efficacité de nos publicités. Les cookies strictement nécessaires (connexion, sécurité) sont toujours actifs.",
    refuse: 'Tout refuser',
    accept: 'Tout accepter',
    customize: 'Personnaliser',
    save: 'Enregistrer mes choix',
    analytics: "Mesure d'audience (Google Analytics, enregistrement de sessions Mouseflow)",
    marketing: 'Publicité (Google Ads, Meta, LinkedIn)',
    more: 'En savoir plus',
    manage: 'Cookies',
    manageLabel: 'Gérer mes préférences de cookies',
  },
  en: {
    title: 'Your cookie preferences',
    body:
      'We use cookies to measure site audience and, with your consent, the effectiveness of our advertising. Strictly necessary cookies (login, security) are always active.',
    refuse: 'Reject all',
    accept: 'Accept all',
    customize: 'Customize',
    save: 'Save my choices',
    analytics: 'Audience measurement (Google Analytics, Mouseflow session recording)',
    marketing: 'Advertising (Google Ads, Meta, LinkedIn)',
    more: 'Learn more',
    manage: 'Cookies',
    manageLabel: 'Manage my cookie preferences',
  },
} as const;

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
  const t = TEXTS[getLangFromPath(pathname) ?? 'fr'];
  const cookiesHref = getLangFromPath(pathname) ? `/${getLangFromPath(pathname)}/cookies` : '/cookies';

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

  if (!open) {
    return createPortal(
      <button
        type="button"
        aria-label={t.manageLabel}
        onClick={() => {
          setDraft(readConsent() ?? { analytics: false, marketing: false });
          setCustomizing(true);
          setOpen(true);
        }}
        style={{
          position: 'fixed',
          left: 12,
          bottom: 12,
          zIndex: 2147483000,
          padding: '6px 12px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.4)',
          background: '#111827',
          color: '#ffffff',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {t.manage}
      </button>,
      document.body
    );
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
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
