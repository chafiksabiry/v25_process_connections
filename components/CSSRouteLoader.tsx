import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadCSSForRoute, cleanupUnusedCSS } from '../utils/cssLoader';

/**
 * Composant qui gère automatiquement le chargement des CSS
 * en fonction de la route actuelle
 */
const CSSRouteLoader = () => {
  const location = useLocation();

  useEffect(() => {
    // Charger les CSS pour la nouvelle route
    loadCSSForRoute(location.pathname);

    // Nettoyer les CSS non utilisés pour éviter les conflits
    cleanupUnusedCSS(location.pathname);
  }, [location.pathname]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default CSSRouteLoader; 