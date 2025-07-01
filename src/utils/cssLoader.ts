interface CSSModule {
  url: string;
  routes: string[];
}

// Configuration des modules CSS et leurs routes associées
const cssModules: CSSModule[] = [
  {
    url: 'https://registration.harx.ai/index.css',
    routes: ['/app1', '/auth']
  },
  {
    url: 'https://choicepage.harx.ai/index.css',
    routes: ['/app2']
  },
  {
    url: 'https://repcreationwizard.harx.ai/index.css',
    routes: ['/repcreationprofile']
  },
  {
    url: 'https://companysearchwizard.harx.ai/index.css',
    routes: ['/app4']
  },
  {
    url: 'https://gigsmanual.harx.ai/index.css',
    routes: ['/app5']
  },
  {
    url: 'https://dashboard.harx.ai/index.css',
    routes: ['/company']
  },
  {
    url: 'https://gigsai.harx.ai/index.css',
    routes: ['/app6']
  },
  {
    url: 'https://rep-dashboard.harx.ai/index.css',
    routes: ['/repdashboard']
  },
  {
    url: 'https://knowledge-base.harx.ai/index.css',
    routes: ['/knowledgebase']
  },
  {
    url: 'https://matching.harx.ai/index.css',
    routes: ['/app12']
  },
  {
    url: 'https://comp-orchestrator.harx.ai/index.css',
    routes: ['/app11']
  }
];

// Cache pour éviter de recharger les mêmes CSS
const loadedCSS = new Set<string>();

/**
 * Charge un fichier CSS de manière asynchrone
 */
const loadCSS = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loadedCSS.has(url)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    link.onload = () => {
      loadedCSS.add(url);
      resolve();
    };
    
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${url}`);
      reject(new Error(`Failed to load CSS: ${url}`));
    };

    document.head.appendChild(link);
  });
};

/**
 * Décharge un fichier CSS
 */
const unloadCSS = (url: string): void => {
  const links = document.querySelectorAll(`link[href="${url}"]`);
  links.forEach(link => link.remove());
  loadedCSS.delete(url);
};

/**
 * Charge les CSS nécessaires pour une route donnée
 */
export const loadCSSForRoute = async (pathname: string): Promise<void> => {
  try {
    // Trouver les modules CSS nécessaires pour cette route
    const requiredModules = cssModules.filter(module =>
      module.routes.some(route => pathname.startsWith(route))
    );

    // Charger tous les CSS nécessaires en parallèle
    const loadPromises = requiredModules.map(module => loadCSS(module.url));
    await Promise.all(loadPromises);

    console.log(`CSS loaded for route: ${pathname}`);
  } catch (error) {
    console.error('Error loading CSS for route:', error);
  }
};

/**
 * Nettoie les CSS non utilisés (optionnel)
 */
export const cleanupUnusedCSS = (currentPathname: string): void => {
  const requiredURLs = new Set(
    cssModules
      .filter(module => module.routes.some(route => currentPathname.startsWith(route)))
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
 */
export const initCSSLoader = (): void => {
  // Charger les CSS pour la route initiale
  loadCSSForRoute(window.location.pathname);
}; 