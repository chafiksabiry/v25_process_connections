import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  NOMAD_LEGACY_SECTIONS,
  TELEPHONY_APP_SECTIONS,
  isLegacyCallCenterPath,
  legacyCallCenterRedirect,
  mapLegacyCallCenterPath,
} from './callCenterRedirect';

describe('mapLegacyCallCenterPath', () => {
  it('envoie /call-center vers /telephony', () => {
    expect(mapLegacyCallCenterPath('/call-center')).toBe('/telephony');
    expect(mapLegacyCallCenterPath('/call-center/')).toBe('/telephony');
  });

  it('garde le sous-chemin quand la rubrique existe dans /telephony', () => {
    expect(mapLegacyCallCenterPath('/call-center/dashboard')).toBe('/telephony/app/dashboard');
    expect(mapLegacyCallCenterPath('/call-center/agents')).toBe('/telephony/app/agents');
    expect(mapLegacyCallCenterPath('/call-center/operations/new')).toBe('/telephony/app/operations/new');
    expect(mapLegacyCallCenterPath('/call-center/billing/')).toBe('/telephony/app/billing');
    expect(mapLegacyCallCenterPath('/call-center/onboarding')).toBe('/telephony/onboarding');
  });

  it('envoie le poste vers l’adresse NOMAD /nomad/poste (24/11/2026), sous-chemin, requête et ancre gardés', () => {
    expect(mapLegacyCallCenterPath('/call-center/poste')).toBe('/nomad/poste');
    expect(mapLegacyCallCenterPath('/call-center/poste/')).toBe('/nomad/poste');
    expect(mapLegacyCallCenterPath('/call-center/poste/clavier')).toBe('/nomad/poste/clavier');
    expect(legacyCallCenterRedirect({ pathname: '/call-center/poste', search: '?num=33', hash: '#k' })).toBe('/nomad/poste?num=33#k');
  });

  it('renvoie vers /telephony/app/dashboard quand la rubrique n’existe pas', () => {
    expect(mapLegacyCallCenterPath('/call-center/inconnu')).toBe('/telephony/app/dashboard');
    expect(mapLegacyCallCenterPath('/call-center/app/agents')).toBe('/telephony/app/dashboard');
    expect(mapLegacyCallCenterPath('/call-center/company/dashboard')).toBe('/telephony/app/dashboard');
  });

  it('ne touche pas aux autres adresses (REPS, TAAS, entreprise, téléphonie)', () => {
    for (const p of ['/', '/reps', '/reps/dashboard', '/taas', '/taas/reps', '/company', '/telephony', '/telephony/app/agents', '/call-centers', '/auth/register-call-center', '/fr/auth/signin']) {
      expect(isLegacyCallCenterPath(p)).toBe(false);
      expect(mapLegacyCallCenterPath(p)).toBeNull();
    }
  });

  it('ne produit jamais de cible sous /call-center (pas de boucle)', () => {
    const samples = ['/call-center', '/call-center/x', ...TELEPHONY_APP_SECTIONS.map((s) => `/call-center/${s}/a/b`)];
    for (const p of samples) {
      const t = mapLegacyCallCenterPath(p)!;
      expect(t.startsWith('/telephony') || t.startsWith('/nomad/')).toBe(true);
      expect(isLegacyCallCenterPath(t)).toBe(false);
      expect(mapLegacyCallCenterPath(t)).toBeNull();
    }
  });

  it('conserve la requête et l’ancre', () => {
    expect(legacyCallCenterRedirect({ pathname: '/call-center/billing', search: '?payment=ok&session_id=cs_1', hash: '#top' })).toBe(
      '/telephony/app/billing?payment=ok&session_id=cs_1#top',
    );
    expect(legacyCallCenterRedirect({ pathname: '/reps' })).toBeNull();
  });
});

/** Simulation de l'ordre « première règle qui correspond » de Netlify sur le bloc /call-center de netlify.toml. */
type Rule = { from: string; to: string; status: number; force: boolean };

function readCallCenterRules(): Rule[] {
  const toml = readFileSync(fileURLToPath(new URL('../netlify.toml', import.meta.url)), 'utf8');
  const block = toml.split('# BEGIN call-center-redirects')[1]?.split('# END call-center-redirects')[0];
  if (!block) throw new Error('bloc call-center-redirects absent de netlify.toml');
  return block
    .split('[[redirects]]')
    .slice(1)
    .map((chunk) => ({
      from: /from = "([^"]+)"/.exec(chunk)![1],
      to: /to = "([^"]+)"/.exec(chunk)![1],
      status: Number(/status = (\d+)/.exec(chunk)![1]),
      force: /force = true/.test(chunk),
    }));
}

function applyNetlify(rules: Rule[], path: string): string | null {
  for (const r of rules) {
    if (r.from.endsWith('/*')) {
      const base = r.from.slice(0, -2);
      if (path.startsWith(`${base}/`)) {
        const splat = path.slice(base.length + 1);
        return r.to.replace(':splat', splat);
      }
    } else if (path === r.from) {
      return r.to;
    }
  }
  return null;
}

describe('netlify.toml (redirections 301 côté serveur)', () => {
  const rules = readCallCenterRules();

  it('toutes les règles sont des 301 forcées vers /telephony (ou /nomad/poste pour le poste NOMAD)', () => {
    expect(rules.length).toBeGreaterThan(4);
    for (const r of rules) {
      expect(r.status).toBe(301);
      expect(r.force).toBe(true);
      expect(r.from.startsWith('/call-center')).toBe(true);
      if (r.from === '/call-center/poste' || r.from === '/call-center/poste/*') expect(r.to.startsWith('/nomad/poste')).toBe(true);
      else expect(r.to.startsWith('/telephony')).toBe(true);
    }
  });

  it('donne le même résultat que la redirection côté navigateur', () => {
    const paths = [
      '/call-center',
      '/call-center/',
      '/call-center/onboarding',
      '/call-center/onboarding/step',
      '/call-center/inconnu',
      '/call-center/app/agents',
      ...TELEPHONY_APP_SECTIONS.flatMap((s) => [`/call-center/${s}`, `/call-center/${s}/x/y`]),
    ];
    for (const p of paths) {
      const server = applyNetlify(rules, p)!.replace(/\/$/, '');
      expect(server, p).toBe(mapLegacyCallCenterPath(p));
    }
  });

  it('chaque rubrique de /telephony a sa règle', () => {
    for (const s of TELEPHONY_APP_SECTIONS) {
      const to = NOMAD_LEGACY_SECTIONS[s] ?? `/telephony/app/${s}`;
      expect(rules.some((r) => r.from === `/call-center/${s}` && r.to === to), s).toBe(true);
    }
  });
});
