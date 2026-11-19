/**
 * Bouton WhatsApp du support : dans l'application connectée de HARX Téléphonie (/telephony/app/…, avec ou sans préfixe de langue),
 * il est réduit à sa pastille ronde (56 px, comme sur mobile), alignée au-dessus de la bulle de chat Zoho SalesIQ : les deux forment
 * une seule colonne étroite en bas à droite, dont l'application réserve la place (marge droite et marge basse de son contenu).
 * Avec son libellé, il débordait de cette colonne et recouvrait cartes et boutons (clavier « Nouvel appel », lecture d'un e-mail…).
 */
const IN_APP_RE = /^\/(?:(?:fr|en|es|ar)\/)?telephony\/app(?:\/|$)/;

export function compactWhatsAppFor(pathname: string): boolean {
  return IN_APP_RE.test(pathname);
}
