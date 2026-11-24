import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SiteLang } from '../lib/langRoutes';

/**
 * Panneau de chat de l'assistant IA HARX (WhatsApp Business + Claude) affiché directement sur le site : le visiteur écrit ici,
 * sans être redirigé vers l'application WhatsApp. Les messages passent par le backend orchestrateur
 * (POST /api/whatsapp/web-chat/message) ; aucune donnée de compte n'est accessible dans ce mode.
 * Si le service est indisponible, le panneau propose le lien wa.me en repli.
 */
const API = String(
  import.meta.env.VITE_API_URL_ORCHESTRATOR || 'https://v25comporchestratorback-production.up.railway.app/api',
).replace(/\/+$/, '');
const SESSION_KEY = 'harx-wa-web-session';
const POLL_MS = 8000;

type Role = 'user' | 'assistant' | 'human_agent';
export interface ChatMessage { role: Role; text: string; ts?: string }

const TEXTS = {
  fr: { title: 'Assistant HARX', greeting: "Bonjour ! Je suis l'assistant IA de HARX. Comment puis-je vous aider ?", placeholder: 'Écrivez votre message…', send: 'Envoyer', close: 'Fermer le chat', open: 'Continuer sur WhatsApp', error: "L'assistant est momentanément indisponible. Vous pouvez continuer sur WhatsApp.", limit: 'Trop de messages, patientez un instant avant de réessayer.', human: "Un membre de l'équipe HARX a été prévenu et vous répondra ici.", typing: "L'assistant écrit…", you: 'Vous', bot: 'HARX', team: 'Équipe HARX', notice: "Vos messages peuvent être transmis à l'équipe HARX via WhatsApp." },
  en: { title: 'HARX Assistant', greeting: "Hi! I'm HARX's AI assistant. How can I help you?", placeholder: 'Type your message…', send: 'Send', close: 'Close chat', open: 'Continue on WhatsApp', error: 'The assistant is temporarily unavailable. You can continue on WhatsApp.', limit: 'Too many messages, please wait a moment before trying again.', human: 'A HARX team member has been notified and will reply here.', typing: 'The assistant is typing…', you: 'You', bot: 'HARX', team: 'HARX team', notice: 'Your messages may be forwarded to the HARX team via WhatsApp.' },
  es: { title: 'Asistente HARX', greeting: '¡Hola! Soy el asistente de IA de HARX. ¿En qué puedo ayudarle?', placeholder: 'Escriba su mensaje…', send: 'Enviar', close: 'Cerrar el chat', open: 'Continuar en WhatsApp', error: 'El asistente no está disponible por el momento. Puede continuar en WhatsApp.', limit: 'Demasiados mensajes, espere un momento antes de volver a intentarlo.', human: 'Un miembro del equipo HARX ha sido avisado y le responderá aquí.', typing: 'El asistente está escribiendo…', you: 'Usted', bot: 'HARX', team: 'Equipo HARX', notice: 'Sus mensajes pueden transmitirse al equipo de HARX por WhatsApp.' },
  ar: { title: 'مساعد HARX', greeting: 'مرحبا! أنا مساعد HARX الذكي. كيف يمكنني مساعدتك؟', placeholder: 'اكتب رسالتك…', send: 'إرسال', close: 'إغلاق المحادثة', open: 'المتابعة على واتساب', error: 'المساعد غير متاح مؤقتا. يمكنك المتابعة على واتساب.', limit: 'رسائل كثيرة، يرجى الانتظار قليلا قبل المحاولة مجددا.', human: 'تم إبلاغ أحد أعضاء فريق HARX وسيرد عليك هنا.', typing: 'المساعد يكتب…', you: 'أنت', bot: 'HARX', team: 'فريق HARX', notice: 'قد تُحوَّل رسائلك إلى فريق HARX عبر واتساب.' },
} as const;

const CSS = `
.harx-wc{position:fixed;right:20px;bottom:164px;z-index:99991;width:min(380px,calc(100vw - 28px));height:min(540px,calc(100vh - 190px));display:flex;flex-direction:column;
  background:#fff;color:#111827;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35);font:14px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.harx-wc__head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:#128C7E;color:#fff;font-weight:600}
.harx-wc__close{border:0;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}
.harx-wc__close:focus-visible,.harx-wc__send:focus-visible,.harx-wc__wa:focus-visible,.harx-wc__input:focus-visible{outline:2px solid #25D366;outline-offset:2px}
.harx-wc__log{flex:1;overflow-y:auto;padding:12px;background:#ece5dd;display:flex;flex-direction:column;gap:8px}
.harx-wc__msg{max-width:85%;padding:8px 10px;border-radius:10px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;box-shadow:0 1px 1px rgba(0,0,0,.12)}
.harx-wc__msg--user{align-self:flex-end;background:#d9fdd3}
.harx-wc__msg--assistant,.harx-wc__msg--human_agent{align-self:flex-start;background:#fff}
.harx-wc__who{display:block;font-size:11px;font-weight:600;color:#128C7E;margin-bottom:2px}
.harx-wc__note{align-self:center;font-size:12px;color:#4b5563;text-align:center;padding:4px 8px}
.harx-wc__form{display:flex;gap:8px;padding:10px;background:#f0f2f5}
.harx-wc__input{flex:1;min-width:0;border:1px solid #d1d5db;border-radius:20px;padding:9px 14px;font:inherit;background:#fff;color:#111827}
.harx-wc__send{border:0;border-radius:20px;padding:0 16px;background:#25D366;color:#fff;font-weight:600;cursor:pointer}
.harx-wc__send:disabled{opacity:.55;cursor:not-allowed}
.harx-wc__foot{padding:6px 10px 10px;background:#f0f2f5;text-align:center;font-size:12px}
.harx-wc__notice{display:block;margin-bottom:3px;color:#6b7280;font-size:11px}
.harx-wc__wa{color:#128C7E;text-decoration:underline}
@media (max-width:640px){.harx-wc{right:7px;bottom:150px}}
@media print{.harx-wc{display:none}}
`;

function newSessionId(): string {
  const c = (typeof crypto !== 'undefined' ? crypto : undefined) as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(24);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getSessionId(): string {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored && /^[A-Za-z0-9_-]{22,64}$/.test(stored)) return stored;
    const fresh = newSessionId();
    localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return newSessionId();
  }
}

/** *gras* -> <strong> (balisage WhatsApp renvoyé par l'assistant) ; tout le reste reste du texte brut (jamais de HTML injecté). */
export function renderWhatsAppText(text: string): React.ReactNode[] {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    /^\*[^*\n]+\*$/.test(part) ? <strong key={i}>{part.slice(1, -1)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
}

interface Props { lang: SiteLang; whatsappUrl: string; onClose: () => void }

export default function WhatsAppWebChat({ lang, whatsappUrl, onClose }: Props) {
  const t = TEXTS[lang];
  const [sessionId] = useState(getSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTs = useRef<string | null>(null);

  const mergeHistory = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    lastTs.current = incoming[incoming.length - 1].ts ?? lastTs.current;
    setMessages((prev) => {
      const seen = new Set(prev.filter((m) => m.ts).map((m) => `${m.role}|${m.ts}`));
      return [...prev, ...incoming.filter((m) => !seen.has(`${m.role}|${m.ts}`))];
    });
  }, []);

  // Reprise de la conversation après un rechargement de la page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/whatsapp/web-chat/${sessionId}/messages`);
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: ChatMessage[]; handoff?: boolean };
        if (cancelled) return;
        mergeHistory(data.messages ?? []);
        setHandoff(Boolean(data.handoff));
      } catch { /* hors ligne : la conversation démarre vide */ }
    })();
    return () => { cancelled = true; };
  }, [sessionId, mergeHistory]);

  // Tant qu'un humain doit répondre, on interroge l'historique pour afficher sa réponse.
  useEffect(() => {
    if (!handoff) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const q = lastTs.current ? `?after=${encodeURIComponent(lastTs.current)}` : '';
        const res = await fetch(`${API}/whatsapp/web-chat/${sessionId}/messages${q}`);
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: ChatMessage[]; handoff?: boolean };
        mergeHistory((data.messages ?? []).filter((m) => m.role !== 'user'));
        if (data.handoff === false) setHandoff(false);
      } catch { /* on réessaie au prochain tour */ }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [handoff, sessionId, mergeHistory]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages, busy, note]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setNote(null);
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    try {
      const res = await fetch(`${API}/whatsapp/web-chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
      if (res.status === 429) { setNote(t.limit); return; }
      if (res.status === 202) { setHandoff(true); setNote(t.human); return; }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { reply?: string; handoff?: boolean };
      if (data.reply) setMessages((prev) => [...prev, { role: 'assistant', text: data.reply as string }]);
      if (data.handoff) { setHandoff(true); setNote(t.human); }
    } catch {
      setNote(t.error);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const who = (r: Role) => (r === 'user' ? t.you : r === 'human_agent' ? t.team : t.bot);

  return (
    <div className="harx-wc" role="dialog" aria-label={t.title} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-testid="whatsapp-web-chat">
      <style>{CSS}</style>
      <div className="harx-wc__head">
        <span>{t.title}</span>
        <button type="button" className="harx-wc__close" onClick={onClose} aria-label={t.close}>×</button>
      </div>
      <div className="harx-wc__log" ref={logRef} role="log" aria-live="polite">
        <div className="harx-wc__msg harx-wc__msg--assistant"><span className="harx-wc__who">{t.bot}</span>{t.greeting}</div>
        {messages.map((m, i) => (
          <div key={`${m.ts ?? 'l'}-${i}`} className={`harx-wc__msg harx-wc__msg--${m.role}`}>
            <span className="harx-wc__who">{who(m.role)}</span>
            {renderWhatsAppText(m.text)}
          </div>
        ))}
        {busy ? <div className="harx-wc__note">{t.typing}</div> : null}
        {note ? <div className="harx-wc__note" role="status">{note}</div> : null}
      </div>
      <form className="harx-wc__form" onSubmit={send}>
        <input ref={inputRef} className="harx-wc__input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} maxLength={2000} autoComplete="off" />
        <button type="submit" className="harx-wc__send" disabled={busy || !input.trim()}>{t.send}</button>
      </form>
      <div className="harx-wc__foot"><span className="harx-wc__notice">{t.notice}</span><a className="harx-wc__wa" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{t.open}</a></div>
    </div>
  );
}
