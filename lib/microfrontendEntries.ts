/**
 * Qiankun micro-frontend entry URLs.
 * Override per env via Netlify / Vite:
 *   VITE_MF_AUTH_ENTRY, VITE_MF_COMPANY_ENTRY, VITE_MF_REPS_ENTRY, VITE_MF_HOME_ENTRY, VITE_MF_CALLCENTER_ENTRY
 *
 * Defaults = *-dev Netlify sites (local / branch builds).
 * Production shell (harx.ai) overrides via netlify.toml [context.production].
 */
const trimSlash = (url: string) => url.replace(/\/+$/, '') + '/';

export const MF_ENTRIES = {
  home:
    import.meta.env.VITE_MF_HOME_ENTRY ||
    'https://websitev2026.netlify.app',
  auth: trimSlash(
    import.meta.env.VITE_MF_AUTH_ENTRY ||
      'https://harx26register-dev.netlify.app'
  ),
  company: trimSlash(
    import.meta.env.VITE_MF_COMPANY_ENTRY ||
      'https://harx26comporchestratorfront-dev.netlify.app'
  ),
  reps: trimSlash(
    import.meta.env.VITE_MF_REPS_ENTRY ||
      'https://harx26reporchestratorfront-dev.netlify.app'
  ),
  // Application dédiée aux centres d'appels (dépôt v25_callcenter_front), montée sous /callcentre.
  callcenter: trimSlash(
    import.meta.env.VITE_MF_CALLCENTER_ENTRY ||
      'https://harxv25callcenterfront.netlify.app'
  ),
} as const;
