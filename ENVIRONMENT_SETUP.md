# Configuration des Variables d'Environnement

Ce projet utilise des variables d'environnement pour gérer les URLs selon l'environnement (sandbox vs preprod).

## Configuration

### 1. Créer le fichier .env

Copiez le fichier `env.example` vers `.env` et configurez les variables :

```bash
cp env.example .env
```

### 2. Variables d'environnement disponibles

#### Environnement principal
- `VITE_ENVIRONMENT`: Définit l'environnement (`sandbox` ou `preprod`)

#### URLs de base
- `VITE_BASE_URL_SANDBOX`: URL de base pour l'environnement sandbox (défaut: `https://`)
- `VITE_BASE_URL_PREPROD`: URL de base pour l'environnement preprod (défaut: `https://preprod-`)

#### Domaines des services
- `VITE_REGISTRATION_DOMAIN`: Domaine pour l'enregistrement
- `VITE_CHOICEPAGE_DOMAIN`: Domaine pour la page de choix
- `VITE_REPCREATION_DOMAIN`: Domaine pour la création de représentant
- `VITE_COMPANYSEARCH_DOMAIN`: Domaine pour la recherche d'entreprise
- `VITE_GIGSMANUAL_DOMAIN`: Domaine pour le manuel des gigs
- `VITE_DASHBOARD_DOMAIN`: Domaine pour le tableau de bord
- `VITE_GIGSAI_DOMAIN`: Domaine pour l'IA des gigs
- `VITE_REP_DASHBOARD_DOMAIN`: Domaine pour le tableau de bord des représentants
- `VITE_KNOWLEDGE_BASE_DOMAIN`: Domaine pour la base de connaissances
- `VITE_MATCHING_DOMAIN`: Domaine pour le matching
- `VITE_COMP_ORCHESTRATOR_DOMAIN`: Domaine pour l'orchestrateur

## Exemples d'utilisation

### Environnement Sandbox (par défaut)
```env
VITE_ENVIRONMENT=sandbox
```

Les URLs seront générées comme :
- `https://registration.harx.ai/index.css`
- `https://choicepage.harx.ai/index.css`
- etc.

### Environnement Preprod
```env
VITE_ENVIRONMENT=preprod
```

Les URLs seront générées comme :
- `https://preprod-registration.harx.ai/index.css`
- `https://preprod-choicepage.harx.ai/index.css`
- etc.

## Docker

### Variables d'environnement dans Docker

Les variables d'environnement sont définies dans le Dockerfile avec des valeurs par défaut. Pour les surcharger lors du déploiement :

```bash
docker run -e VITE_ENVIRONMENT=preprod -e VITE_REGISTRATION_DOMAIN=preprod-registration.harx.ai your-image
```

### Docker Compose (optionnel)

Si vous utilisez Docker Compose, vous pouvez créer un fichier `docker-compose.yml` :

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_ENVIRONMENT=preprod
      - VITE_REGISTRATION_DOMAIN=preprod-registration.harx.ai
      # Ajoutez d'autres variables selon vos besoins
```

## Développement local

Pour le développement local, les variables d'environnement sont automatiquement chargées depuis le fichier `.env` grâce à Vite.

## Production

En production, assurez-vous que les variables d'environnement sont correctement définies dans votre environnement de déploiement. 