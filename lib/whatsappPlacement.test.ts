import { describe, expect, it } from 'vitest';
import { compactWhatsAppFor } from './whatsappPlacement';

describe('bouton WhatsApp compact dans l’application Téléphonie', () => {
  it('pastille ronde dans /telephony/app, avec ou sans préfixe de langue', () => {
    for (const p of ['/telephony/app', '/telephony/app/dashboard', '/en/telephony/app/emails', '/ar/telephony/app/followups']) expect(compactWhatsAppFor(p)).toBe(true);
  });
  it('libellé visible ailleurs (site public, page d’offre Téléphonie, autres espaces)', () => {
    for (const p of ['/', '/en', '/telephony', '/telephony/cloud', '/telephony/application', '/taas', '/app/dashboard', '/en/auth/signin']) expect(compactWhatsAppFor(p)).toBe(false);
  });
  it('pastille ronde dans les écrans du portail NOMAD (/nomad/<écran>), avec ou sans préfixe de langue', () => {
    for (const p of ['/nomad/poste', '/nomad/mise-en-route', '/nomad/appels/123', '/nomad/faq', '/en/nomad/messages']) expect(compactWhatsAppFor(p)).toBe(true);
  });
  it('libellé visible sur la page NOMAD, la connexion et l’inscription NOMAD', () => {
    for (const p of ['/nomad', '/nomad/', '/nomad/connexion', '/nomad/inscription', '/nomad/inscription/', '/en/nomad', '/nomadx/poste']) expect(compactWhatsAppFor(p)).toBe(false);
  });
});
