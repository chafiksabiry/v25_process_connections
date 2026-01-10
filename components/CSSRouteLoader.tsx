import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadCSSForRoute } from '../utils/cssLoader';

/**
 * Composant qui gère automatiquement le chargement des CSS
 * en fonction de la route actuelle
 */
const CSSRouteLoader = () => {
  const location = useLocation();

  useEffect(() => {
    // Charger les CSS pour la nouvelle route
    loadCSSForRoute(location.pathname);
    
    // Optionnel : nettoyer les CSS non utilisés
    // Décommentez la ligne suivante si vous voulez décharger les CSS non utilisés
    // cleanupUnusedCSS(location.pathname);
  }, [location.pathname]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default CSSRouteLoader; 