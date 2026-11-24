import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { ZOHO_SALESIQ_WIDGET_SRC } from './tracking/constants';
import { hideSalesIqChat } from './tracking/initVisitorTrackingScripts';

// Décision du fondateur (24/11/2026) : Zoho SalesIQ garde le suivi du trafic, la bulle de chat est retirée.
// Le script inline de index.html (le seul qui s'exécute sur l'hôte) est rejoué dans un bac à sable.
function runSalesIqInline() {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const block = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('zsiqscript'));
  if (!block) throw new Error('script SalesIQ introuvable dans index.html');
  const appended: Array<{ id?: string; src?: string; defer?: boolean }> = [];
  const window: Record<string, unknown> = {};
  const document = {
    getElementById: () => null,
    createElement: () => ({}) as { id?: string; src?: string; defer?: boolean },
    head: { appendChild: (el: { id?: string; src?: string }) => appended.push(el) },
  };
  const sandbox = { window, document } as Record<string, unknown>;
  // `$zoho` est une globale du navigateur (= window.$zoho) : le bac à sable la relie à window.
  Object.defineProperty(sandbox, '$zoho', { get: () => window.$zoho, set: (v) => { window.$zoho = v; } });
  runInNewContext(block, sandbox);
  return { appended, siq: (window.$zoho as { salesiq: Record<string, unknown> }).salesiq };
}

describe('Zoho SalesIQ : suivi conservé, bulle de chat masquée', () => {
  it('le script de suivi SalesIQ est toujours chargé (même widget)', () => {
    const { appended } = runSalesIqInline();
    expect(appended).toHaveLength(1);
    expect(appended[0].id).toBe('zsiqscript');
    expect(appended[0].src).toBe(ZOHO_SALESIQ_WIDGET_SRC);
  });

  it('au « ready » de SalesIQ : bouton flottant et fenêtre de chat masqués par l’API', () => {
    const { siq } = runSalesIqInline();
    const calls: string[] = [];
    siq.floatbutton = { visible: (v: string) => calls.push(`floatbutton:${v}`) };
    siq.floatwindow = { visible: (v: string) => calls.push(`floatwindow:${v}`) };
    (siq.ready as () => void)();
    expect(calls).toEqual(['floatbutton:hide', 'floatwindow:hide']);
  });

  it('API absente ou en erreur : aucune exception (la page ne casse pas)', () => {
    const { siq } = runSalesIqInline();
    expect(() => (siq.ready as () => void)()).not.toThrow();
    siq.floatbutton = { visible: () => { throw new Error('boom'); } };
    expect(() => (siq.ready as () => void)()).not.toThrow();
  });

  it('hideSalesIqChat (initVisitorTrackingScripts) applique la même règle', () => {
    const calls: string[] = [];
    (globalThis as unknown as { window: unknown }).window = { $zoho: { salesiq: { floatbutton: { visible: (v: string) => calls.push(`b:${v}`) }, floatwindow: { visible: (v: string) => calls.push(`w:${v}`) } } } };
    try {
      hideSalesIqChat();
    } finally {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
    expect(calls).toEqual(['b:hide', 'w:hide']);
  });
});
