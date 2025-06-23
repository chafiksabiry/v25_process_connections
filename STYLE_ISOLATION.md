# Configuration de l'Isolation des Styles avec Qiankun

## Problème résolu

Les conflits de styles entre micro-frontends ont été résolus en configurant correctement l'isolation des styles dans qiankun.

## Configuration appliquée

### 1. Configuration globale de qiankun

```typescript
start({
  prefetch: true,
  sandbox: {
    strictStyleIsolation: false, // Désactivé pour éviter les conflits
    experimentalStyleIsolation: true, // Activé pour l'isolation des styles
  },
  singular: false,
  // ...
});
```

### 2. Configuration uniforme pour tous les micro-frontends

Tous les micro-frontends utilisent maintenant la même configuration :

```typescript
props: {
  sandbox: {
    experimentalStyleIsolation: true,
  },
  actions,
}
```

### 3. Styles de l'application hôte

- Les styles de l'hôte sont préfixés avec `.host-app`
- Les conteneurs de micro-frontends ont des styles dédiés
- Les CSS globaux des micro-frontends ont été commentés dans `index.html`

## Types d'isolation des styles dans qiankun

### `strictStyleIsolation: true`
- Utilise Shadow DOM
- Isolation complète mais peut causer des problèmes de compatibilité
- **Non recommandé** pour notre cas d'usage

### `experimentalStyleIsolation: true`
- Utilise des préfixes CSS automatiques
- Isolation efficace sans les problèmes de Shadow DOM
- **Recommandé** pour notre configuration

### `strictStyleIsolation: false` + `experimentalStyleIsolation: false`
- Aucune isolation
- Les styles peuvent se chevaucher
- **Non recommandé** pour les micro-frontends

## Bonnes pratiques

1. **Uniformité** : Tous les micro-frontends doivent utiliser la même configuration
2. **CSS global** : Éviter de charger les CSS des micro-frontends globalement
3. **Préfixes** : Utiliser des préfixes CSS pour les styles de l'hôte
4. **Conteneurs** : Donner des styles appropriés aux conteneurs de micro-frontends

## Dépannage

Si vous rencontrez encore des conflits de styles :

1. Vérifiez que tous les micro-frontends utilisent `experimentalStyleIsolation: true`
2. Assurez-vous que les CSS globaux sont bien commentés dans `index.html`
3. Vérifiez que les micro-frontends n'injectent pas de styles dans le document global
4. Utilisez les outils de développement pour inspecter les styles appliqués

## Références

- [Documentation officielle qiankun](https://qiankun.umijs.org/zh/guide)
- [Guide d'isolation des styles](https://qiankun.umijs.org/zh/guide/style-isolation) 