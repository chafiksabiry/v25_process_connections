# Connection Manager - React + TypeScript + Vite

Ce projet est un gestionnaire de connexions qui permet de router vers différents services selon l'environnement (sandbox vs prod).

## Fonctionnalités

- Gestion dynamique des URLs selon l'environnement
- Chargement automatique des CSS selon les routes
- Support des environnements sandbox et prod
- Configuration via variables d'environnement

## Configuration des Variables d'Environnement

Ce projet utilise des variables d'environnement pour gérer les URLs selon l'environnement. Voir [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) pour plus de détails.

### Configuration rapide

1. Copiez le fichier d'exemple :
```bash
cp env.example .env
```

2. Modifiez `VITE_ENVIRONMENT` dans `.env` :
   - `sandbox` pour l'environnement de développement
   - `prod` pour l'environnement de préproduction

## Plugins Vite disponibles

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
