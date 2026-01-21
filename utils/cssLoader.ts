/**
 * Interface définissant la structure d'un module CSS
 * Un module CSS contient une URL vers le fichier CSS et les routes associées
 */
interface CSSModule {
  url: string;      // URL du fichier CSS à charger
  routes: string[]; // Routes pour lesquelles ce CSS doit être appliqué
}

/**
 * Configuration des modules CSS et leurs routes associées
 * Chaque module définit un fichier CSS externe et les chemins d'URL
 * pour lesquels il doit être chargé dynamiquement
 */
const cssModules: CSSModule[] = [
  {
    url: 'https://harx25register.netlify.app/index.css',
    routes: ['/app1', '/auth']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harx25choicepage.netlify.app/index.css'
      : 'https://harx25choicepage.netlify.app/index.css',
    routes: ['/app2']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25repscreationwizardfrontend.netlify.app/index.css'
      : 'https://harxv25repscreationwizardfrontend.netlify.app/index.css',
    routes: ['/repcreationprofile']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25searchcompanywizardfrontend.netlify.app/index.css'
      : 'https://harxv25searchcompanywizardfrontend.netlify.app/index.css',
    routes: ['/app4']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25gigcreationfrontend.netlify.app/index.css'
      : 'https://harxv25gigcreationfrontend.netlify.app/index.css',
    routes: ['/app5']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25dashboardfrontend.netlify.app/index.css'
      : 'https://harxv25dashboardfrontend.netlify.app/index.css',
    routes: ['/company']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25gigcreationfrontend.netlify.app/index.css'
      : 'https://harxv25gigcreationfrontend.netlify.app/index.css',
    routes: ['/app6']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25dashboardrepfront.netlify.app/index.css'
      : 'https://harxv25dashboardrepfront.netlify.app/index.css',
    routes: ['/repdashboard']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25knowledgebasefrontend.netlify.app/index.css'
      : 'https://harxv25knowledgebasefrontend.netlify.app/index.css',
    routes: ['/knowledgebase']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25matchingfrontend.netlify.app/index.css'
      : 'https://harxv25matchingfrontend.netlify.app/index.css',
    routes: ['/app12']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25comporchestratorfront.netlify.app/index.css'
      : 'https://harxv25comporchestratorfront.netlify.app/index.css',
    routes: ['/app11']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25copilotfrontend.netlify.app/index.css'
      : 'https://harxv25copilotfrontend.netlify.app/index.css',
    routes: ['/copilot']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25trainingplatformfrontend.netlify.app/index.css'
      : 'https://harxv25trainingplatformfrontend.netlify.app/index.css',
    routes: ['/training']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25reporchestratorfront.netlify.app/index.css'
      : 'https://harxv25reporchestratorfront.netlify.app/index.css',
    routes: ['/reporchestrator']
  },
  {
    url: import.meta.env.VITE_ENVIRONMENT === 'preprod'
      ? 'https://harxv25assessmentsfront.netlify.app/index.css'
      : 'https://harxv25assessmentsfront.netlify.app/index.css',
    routes: ['/repassessments']
  }
];

/**
 * Cache pour éviter de recharger les mêmes fichiers CSS
 * Utilise un Set pour stocker les URLs des CSS déjà chargés
 */
const loadedCSS = new Set<string>();

/**
 * Charge un fichier CSS de manière asynchrone
 * @param url - L'URL du fichier CSS à charger
 * @returns Promise qui se résout quand le CSS est chargé ou rejette en cas d'erreur
 */
const loadCSS = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si le CSS est déjà chargé pour éviter les doublons
    if (loadedCSS.has(url)) {
      resolve();
      return;
    }

    // Créer un élément link pour charger le CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    // Gérer le succès du chargement
    link.onload = () => {
      loadedCSS.add(url);  // Ajouter l'URL au cache
      resolve();
    };

    // Gérer les erreurs de chargement
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${url}`);
      reject(new Error(`Failed to load CSS: ${url}`));
    };

    // Ajouter le lien au head du document
    document.head.appendChild(link);
  });
};

/**
 * Décharge un fichier CSS du DOM
 * @param url - L'URL du fichier CSS à décharger
 */
const unloadCSS = (url: string): void => {
  // Trouver tous les liens CSS avec cette URL
  const links = document.querySelectorAll(`link[href="${url}"]`);
  // Supprimer chaque lien du DOM
  links.forEach(link => link.remove());
  // Retirer l'URL du cache
  loadedCSS.delete(url);
};

/**
 * Charge les CSS nécessaires pour une route donnée
 * Cette fonction analyse le pathname et charge tous les CSS correspondants
 * @param pathname - Le chemin de l'URL actuelle
 * @returns Promise qui se résout quand tous les CSS sont chargés
 */
export const loadCSSForRoute = async (pathname: string): Promise<void> => {
  try {
    // Trouver les modules CSS nécessaires pour cette route
    // Un module est requis si au moins une de ses routes correspond au pathname
    const normalizedPath = pathname.toLowerCase();
    const requiredModules = cssModules.filter(module =>
      module.routes.some(route => normalizedPath.startsWith(route))
    );

    // Charger tous les CSS nécessaires en parallèle pour optimiser les performances
    const loadPromises = requiredModules.map(module => loadCSS(module.url));
    await Promise.all(loadPromises);

    console.log(`CSS loaded for route: ${pathname}`);
  } catch (error) {
    console.error('Error loading CSS for route:', error);
  }
};

/**
 * Nettoie les CSS non utilisés pour libérer de la mémoire
 * Cette fonction décharge les CSS qui ne sont plus nécessaires pour la route actuelle
 * @param currentPathname - Le chemin de l'URL actuelle
 */
export const cleanupUnusedCSS = (currentPathname: string): void => {
  // Déterminer quels CSS sont encore nécessaires pour la route actuelle
  const normalizedPath = currentPathname.toLowerCase();
  const requiredURLs = new Set(
    cssModules
      .filter(module => module.routes.some(route => normalizedPath.startsWith(route)))
      .map(module => module.url)
  );

  // Décharger les CSS qui ne sont plus nécessaires
  loadedCSS.forEach(url => {
    if (!requiredURLs.has(url)) {
      unloadCSS(url);
    }
  });
};

/**
 * Initialise le système de chargement CSS
 * Cette fonction doit être appelée au démarrage de l'application
 * pour charger les CSS appropriés pour la route initiale
 */
export const initCSSLoader = (): void => {
  // Charger les CSS pour la route initiale au démarrage de l'application
  loadCSSForRoute(window.location.pathname);
}; 