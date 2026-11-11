/**
 * Consentement aux cookies : deux catégories optionnelles.
 *   analytics : mesure d'audience (Google Analytics) et enregistrement de sessions (Mouseflow)
 *   marketing : publicité (Google Ads, Meta, LinkedIn)
 * Aucune balise de ces catégories n'est chargée avant le choix de l'utilisateur.
 * Les cookies strictement nécessaires (connexion, sécurité) ne dépendent pas de ce choix.
 */
import { GA_MEASUREMENT_ID, MOUSEFLOW_PROJECT_SRC } from './tracking/constants';

export type ConsentChoice = { analytics: boolean; marketing: boolean };

export const CONSENT_STORAGE_KEY = 'harx_cookie_consent';
/** Émis après chaque enregistrement d'un choix (detail = ConsentChoice). */
export const CONSENT_EVENT = 'harx:consent';
/** Demande d'ouverture du panneau de préférences. */
export const CONSENT_OPEN_EVENT = 'harx:open-consent';

const CONSENT_VERSION = 1;

type ConsentWindow = Window & { gtag?: (...args: unknown[]) => void };

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: number; analytics?: boolean; marketing?: boolean };
    if (parsed.v !== CONSENT_VERSION) return null;
    return { analytics: parsed.analytics === true, marketing: parsed.marketing === true };
  } catch {
    return null;
  }
}

function loadScript(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function applyChoice(choice: ConsentChoice): void {
  const w = window as ConsentWindow;
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: choice.marketing ? 'granted' : 'denied',
      ad_user_data: choice.marketing ? 'granted' : 'denied',
      ad_personalization: choice.marketing ? 'granted' : 'denied',
    });
  }
  if (choice.analytics || choice.marketing) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
  }
  if (choice.analytics) {
    loadScript(MOUSEFLOW_PROJECT_SRC);
  }
}

/** Enregistre le choix, applique le Consent Mode et prévient les autres modules. */
export function saveConsent(choice: ConsentChoice): void {
  const previous = readConsent();
  try {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ v: CONSENT_VERSION, ...choice, ts: new Date().toISOString() })
    );
  } catch {
    /* stockage indisponible : le choix vaut pour cette page seulement */
  }
  applyChoice(choice);
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
  // Un retrait de consentement ne peut pas décharger des scripts déjà exécutés : on recharge la page.
  if (previous && ((previous.analytics && !choice.analytics) || (previous.marketing && !choice.marketing))) {
    window.location.reload();
  }
}

/** À appeler une fois au démarrage : applique un choix déjà enregistré. */
export function initConsent(): void {
  const stored = readConsent();
  if (stored) applyChoice(stored);
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
