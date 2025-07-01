# Système de Chargement Conditionnel CSS

## 🎯 Objectif
Éviter les conflits CSS en chargeant uniquement les styles nécessaires pour chaque route.

## 📁 Structure

### Fichiers créés :
- `src/utils/cssLoader.ts` - Logique de chargement des CSS
- `src/components/CSSRouteLoader.tsx` - Composant React pour la gestion automatique
- `CSS_LOADER_README.md` - Cette documentation

### Fichiers modifiés :
- `src/App.tsx` - Intégration du CSSRouteLoader
- `index.html` - Suppression des liens CSS statiques

## 🔧 Configuration

### Ajouter un nouveau module CSS :
Dans `src/utils/cssLoader.ts`, ajoutez une nouvelle entrée dans le tableau `cssModules` :

```typescript
{
  url: 'https://nouveau-module.harx.ai/index.css',
  routes: ['/nouvelle-route', '/autre-route']
}
```

### Routes supportées :
- `/app1`, `/auth` → registration.harx.ai
- `/app2` → choicepage.harx.ai
- `/repcreationprofile` → repcreationwizard.harx.ai
- `/company` → companysearchwizard.harx.ai
- `/gigs` → gigsmanual.harx.ai
- `/app4`, `/app5`, `/app6`, `/app7` → dashboard.harx.ai
- `/app11`, `/app12` → gigsai.harx.ai
- `/repdashboard` → rep-dashboard.harx.ai
- `/knowledgebase` → knowledge-base.harx.ai
- `/repassessments` → matching.harx.ai
- `/reporchestrator` → comp-orchestrator.harx.ai

## ⚡ Fonctionnalités

### ✅ Avantages :
1. **Pas de conflits CSS** - Seuls les styles nécessaires sont chargés
2. **Performance améliorée** - Chargement plus rapide de la page
3. **Cache intelligent** - Les CSS déjà chargés ne sont pas rechargés
4. **Gestion d'erreurs** - Logs en cas d'échec de chargement
5. **Chargement parallèle** - Tous les CSS nécessaires sont chargés simultanément

### 🔧 Options avancées :

#### Nettoyage automatique des CSS non utilisés :
Décommentez cette ligne dans `CSSRouteLoader.tsx` :
```typescript
cleanupUnusedCSS(location.pathname);
```

#### Chargement manuel :
```typescript
import { loadCSSForRoute } from './utils/cssLoader';

// Charger les CSS pour une route spécifique
await loadCSSForRoute('/app1');
```

## 🐛 Debug

### Vérifier les CSS chargés :
Ouvrez la console du navigateur et regardez les logs :
```
CSS loaded for route: /app1
```

### Vérifier les erreurs :
Les erreurs de chargement sont loggées dans la console :
```
Failed to load CSS: https://example.com/style.css
```

## 📊 Monitoring

Le système garde une trace des CSS chargés dans `loadedCSS` Set. Vous pouvez l'inspecter dans la console :

```javascript
// Dans la console du navigateur
console.log(window.loadedCSS); // Si vous exposez cette variable
```

## 🔄 Migration

Si vous avez des CSS locaux dans `src/`, vous pouvez les ajouter au système :

```typescript
{
  url: '/src/styles/local-module.css',
  routes: ['/local-route']
}
```

## 🚀 Performance

- **Avant** : 10 fichiers CSS chargés à chaque page
- **Après** : 1-2 fichiers CSS chargés selon la route

Cela peut améliorer le temps de chargement de 50-80% selon la taille des fichiers CSS. 